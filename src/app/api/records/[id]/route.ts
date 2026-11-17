import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateRequest, successResponse, errorResponse, createAuditRecord } from '@/lib/api-utils';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  const { id } = await params;

  try {
    const record = await prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                walletAddress: true,
              },
            },
          },
        },
        versions: true,
        keyEnvelopes: {
          where: {
            userId: auth.user.userId,
            isActive: true,
          },
        },
      },
    });

    if (!record || record.isDeleted) {
      return errorResponse('Record not found', 404);
    }

    // Permission check
    if (auth.user.role === 'PATIENT') {
      if (record.patient.userId !== auth.user.userId) {
        return errorResponse('Access denied: You do not own this record', 403);
      }
    } else if (auth.user.role === 'DOCTOR') {
      const doctor = await prisma.doctorProfile.findUnique({
        where: { userId: auth.user.userId },
      });
      if (!doctor) return errorResponse('Doctor profile not found', 404);

      const activeGrant = await prisma.consentGrant.findFirst({
        where: {
          patientId: record.patientId,
          doctorId: doctor.id,
          isRevoked: false,
          expiresAt: { gt: new Date() },
        },
      });

      if (!activeGrant) {
        await createAuditRecord({
          eventType: 'ACCESS',
          actorId: auth.user.userId,
          resourceId: record.id,
          action: 'ACCESS_DENIED_REVOKED_OR_EXPIRED',
          details: { recordId: record.id },
          severity: 'WARNING',
        });
        return errorResponse('Access denied: Active consent grant not found or expired', 403);
      }
    }

    // Log the read event for transparent audit history
    await createAuditRecord({
      eventType: 'ACCESS',
      actorId: auth.user.userId,
      subjectId: record.patient.userId,
      resourceId: record.id,
      action: 'RECORD_VIEWED',
      details: { title: record.title, role: auth.user.role },
    });

    return successResponse(record);
  } catch (err: any) {
    console.error('Fetch record by id error:', err);
    return errorResponse('Failed to fetch record details', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(req, ['PATIENT', 'ADMIN']);
  if ('errorResponse' in auth) return auth.errorResponse;

  const { id } = await params;

  try {
    const record = await prisma.medicalRecord.findUnique({
      where: { id },
      include: { patient: true },
    });

    if (!record) return errorResponse('Record not found', 404);

    if (auth.user.role === 'PATIENT' && record.patient.userId !== auth.user.userId) {
      return errorResponse('Unauthorized to delete this record', 403);
    }

    await prisma.medicalRecord.update({
      where: { id },
      data: { isDeleted: true },
    });

    await createAuditRecord({
      eventType: 'ACCESS',
      actorId: auth.user.userId,
      resourceId: record.id,
      action: 'RECORD_DELETED_SOFT',
      details: { title: record.title },
    });

    return successResponse({ message: 'Record soft deleted successfully' });
  } catch (err: any) {
    console.error('Delete record error:', err);
    return errorResponse('Failed to delete record', 500);
  }
}
