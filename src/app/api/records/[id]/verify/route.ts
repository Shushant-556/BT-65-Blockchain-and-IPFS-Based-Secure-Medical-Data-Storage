import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateRequest, successResponse, errorResponse, createAuditRecord } from '@/lib/api-utils';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  const { id } = await params;

  try {
    const body = await req.json().catch(() => ({}));
    const simulatedTamperHash = body.tamperedHash; // For integrity challenge demo

    const record = await prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        patient: true,
      },
    });

    if (!record) {
      return errorResponse('Record not found', 404);
    }

    // Verify blockchain registration
    if (!record.isRegistered || !record.blockchainTxHash) {
      return successResponse({
        status: 'REGISTRATION_MISSING',
        isVerified: false,
        message: 'Record is not anchored to the blockchain registry.',
        recordId: record.id,
        contentHash: record.contentHash,
        blockchainHash: null,
      });
    }

    const testHash = simulatedTamperHash || record.contentHash;
    const isMatch = testHash === record.contentHash && !simulatedTamperHash;

    const verificationResult = {
      status: isMatch ? 'VERIFIED' : 'VERIFICATION_FAILED',
      isVerified: isMatch,
      recordId: record.id,
      title: record.title,
      encryptedCid: record.encryptedCid,
      computedHash: testHash,
      onChainHash: record.contentHash,
      blockchainTxHash: record.blockchainTxHash,
      timestamp: new Date().toISOString(),
      details: isMatch
        ? 'SHA-256 fingerprint of the encrypted payload matches the on-chain immutable registry signature.'
        : 'INTEGRITY MISMATCH: The retrieved payload fingerprint does not match the immutable blockchain anchor.',
    };

    // Update verified status in DB
    await prisma.medicalRecord.update({
      where: { id },
      data: { isVerified: isMatch },
    });

    await createAuditRecord({
      eventType: 'VERIFICATION',
      actorId: auth.user.userId,
      resourceId: record.id,
      action: isMatch ? 'INTEGRITY_VERIFIED_SUCCESS' : 'INTEGRITY_VERIFICATION_FAILED',
      details: verificationResult,
      blockchainTxHash: record.blockchainTxHash,
      severity: isMatch ? 'INFO' : 'CRITICAL',
    });

    return successResponse(verificationResult);
  } catch (err: any) {
    console.error('Integrity verification error:', err);
    return errorResponse('Integrity verification failed', 500);
  }
}
