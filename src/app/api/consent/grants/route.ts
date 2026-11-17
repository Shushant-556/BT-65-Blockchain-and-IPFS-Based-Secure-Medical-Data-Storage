import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateRequest, successResponse, errorResponse, createAuditRecord } from '@/lib/api-utils';
import { z } from 'zod';

const grantSchema = z.object({
  doctorId: z.string(),
  scope: z.enum(['SELECTED_RECORDS', 'CATEGORY', 'ALL_CURRENT']),
  durationDays: z.number().min(1).max(365),
  recordIds: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
});

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    let whereClause: any = {};

    if (auth.user.role === 'PATIENT') {
      const patient = await prisma.patientProfile.findUnique({
        where: { userId: auth.user.userId },
      });
      if (!patient) return errorResponse('Patient profile not found', 404);
      whereClause.patientId = patient.id;
    } else if (auth.user.role === 'DOCTOR') {
      const doctor = await prisma.doctorProfile.findUnique({
        where: { userId: auth.user.userId },
      });
      if (!doctor) return errorResponse('Doctor profile not found', 404);
      whereClause.doctorId = doctor.id;
    }

    const grants = await prisma.consentGrant.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            gender: true,
          },
        },
        doctor: {
          include: {
            hospital: true,
          },
        },
        consentHistory: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(grants);
  } catch (err: any) {
    console.error('Fetch grants error:', err);
    return errorResponse('Failed to retrieve consent grants', 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req, ['PATIENT']);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const body = await req.json();
    const parsed = grantSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Validation failed', 400, parsed.error.issues);
    }

    const patient = await prisma.patientProfile.findUnique({
      where: { userId: auth.user.userId },
    });
    if (!patient) return errorResponse('Patient profile not found', 404);

    const { doctorId, scope, durationDays, recordIds, categories } = parsed.data;

    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
      include: { user: true },
    });
    if (!doctor) return errorResponse('Target doctor profile not found', 404);

    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
    const blockchainTxHash = `0x${Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('')}`;

    const grant = await prisma.consentGrant.create({
      data: {
        patientId: patient.id,
        doctorId,
        scope,
        durationDays: durationDays,
        recordIds: recordIds ? JSON.stringify(recordIds) : null,
        categories: categories ? JSON.stringify(categories) : null,
        expiresAt,
        blockchainTxHash,
      } as any,
    });

    await prisma.consentHistory.create({
      data: {
        grantId: grant.id,
        action: 'GRANTED',
        performedBy: auth.user.userId,
        details: `Consent granted for scope ${scope} for ${durationDays} days.`,
      },
    });

    // Record on blockchain transaction table
    await prisma.blockchainTransaction.create({
      data: {
        txHash: blockchainTxHash,
        contractAddress: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
        functionName: 'grantConsent',
        blockNumber: 1060,
        gasUsed: '62450',
        status: 'CONFIRMED',
        eventType: 'ConsentGranted',
        relatedId: grant.id,
        confirmedAt: new Date(),
      },
    });

    await createAuditRecord({
      eventType: 'CONSENT_CHANGE',
      actorId: auth.user.userId,
      subjectId: doctor.userId,
      resourceId: grant.id,
      action: 'CONSENT_GRANTED',
      details: { scope, durationDays, expiresAt },
      blockchainTxHash,
    });

    // Notify doctor
    await prisma.notification.create({
      data: {
        userId: doctor.userId,
        type: 'CONSENT_APPROVED',
        title: 'Patient Granted Access',
        message: `${patient.firstName} ${patient.lastName} granted you access to medical records (${scope}).`,
        relatedId: grant.id,
      },
    });

    return successResponse(grant, 201);
  } catch (err: any) {
    console.error('Create grant error:', err);
    return errorResponse('Failed to grant consent', 500);
  }
}
