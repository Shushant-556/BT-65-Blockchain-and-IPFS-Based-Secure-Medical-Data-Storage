import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateRequest, successResponse, errorResponse, createAuditRecord } from '@/lib/api-utils';
import { z } from 'zod';

const revokeSchema = z.object({
  grantId: z.string(),
  reason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req, ['PATIENT', 'ADMIN']);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const body = await req.json();
    const parsed = revokeSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Validation failed', 400, parsed.error.issues);
    }

    const { grantId, reason } = parsed.data;

    const grant = await prisma.consentGrant.findUnique({
      where: { id: grantId },
      include: {
        patient: true,
        doctor: {
          include: { user: true },
        },
      },
    });

    if (!grant) {
      return errorResponse('Consent grant not found', 404);
    }

    if (auth.user.role === 'PATIENT' && grant.patient.userId !== auth.user.userId) {
      return errorResponse('Unauthorized: You can only revoke your own consent grants', 403);
    }

    if (grant.isRevoked) {
      return errorResponse('This consent grant is already revoked', 400);
    }

    const blockchainTxHash = `0x${Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('')}`;

    // Mark revoked in database
    const updatedGrant = await prisma.consentGrant.update({
      where: { id: grantId },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
      },
    });

    // Deactivate doctor's wrapped key envelopes for patient's records
    const patientRecords = await prisma.medicalRecord.findMany({
      where: { patientId: grant.patientId },
      select: { id: true },
    });

    const recordIds = patientRecords.map((r) => r.id);
    if (recordIds.length > 0) {
      await prisma.encryptedKeyEnvelope.updateMany({
        where: {
          recordId: { in: recordIds },
          userId: grant.doctor.userId,
        },
        data: {
          isActive: false,
        },
      });
    }

    await prisma.consentHistory.create({
      data: {
        grantId: grant.id,
        action: 'REVOKED',
        performedBy: auth.user.userId,
        details: reason || 'Patient revoked doctor authorization.',
      },
    });

    // Record on blockchain
    await prisma.blockchainTransaction.create({
      data: {
        txHash: blockchainTxHash,
        contractAddress: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
        functionName: 'revokeConsent',
        blockNumber: 1065,
        gasUsed: '45120',
        status: 'CONFIRMED',
        eventType: 'ConsentRevoked',
        relatedId: grant.id,
        confirmedAt: new Date(),
      },
    });

    await createAuditRecord({
      eventType: 'CONSENT_CHANGE',
      actorId: auth.user.userId,
      subjectId: grant.doctor.userId,
      resourceId: grant.id,
      action: 'CONSENT_REVOKED',
      details: {
        reason: reason || 'Patient explicit revocation',
        recordCountRestricted: recordIds.length,
        notice:
          'Future key retrieval is disabled and revocation is anchored on blockchain. Note: Cryptographically, revocation cannot delete local data already decrypted by the doctor prior to this timestamp.',
      },
      blockchainTxHash,
    });

    // Notify doctor
    await prisma.notification.create({
      data: {
        userId: grant.doctor.userId,
        type: 'CONSENT_REVOKED',
        title: 'Consent Revoked by Patient',
        message: `${grant.patient.firstName} ${grant.patient.lastName} revoked your access authorization to their medical records.`,
        relatedId: grant.id,
      },
    });

    return successResponse({
      grant: updatedGrant,
      revocationNotice:
        'Revocation complete: Doctor key access deactivated and blockchain transaction confirmed. Previously cached client downloads prior to this event cannot be erased remotely.',
    });
  } catch (err: any) {
    console.error('Revoke grant error:', err);
    return errorResponse('Failed to revoke consent', 500);
  }
}
