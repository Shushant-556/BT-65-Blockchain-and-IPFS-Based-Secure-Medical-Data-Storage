import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateRequest, successResponse, errorResponse, createAuditRecord } from '@/lib/api-utils';
import { z } from 'zod';

const createRequestSchema = z.object({
  patientId: z.string(),
  reason: z.string().min(5),
  scope: z.enum(['SELECTED_RECORDS', 'CATEGORY', 'ALL_CURRENT']),
  durationHours: z.number().min(1).max(8760),
  categories: z.array(z.string()).optional(),
  recordIds: z.array(z.string()).optional(),
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

    const requests = await prisma.consentRequest.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
          },
        },
        doctor: {
          include: {
            hospital: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(requests);
  } catch (err: any) {
    console.error('Fetch requests error:', err);
    return errorResponse('Failed to retrieve consent requests', 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req, ['DOCTOR']);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const body = await req.json();
    const parsed = createRequestSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Validation failed', 400, parsed.error.issues);
    }

    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: auth.user.userId },
    });
    if (!doctor) return errorResponse('Doctor profile not found', 404);

    const { patientId, reason, scope, durationHours, categories, recordIds } = parsed.data;

    const patient = await prisma.patientProfile.findUnique({
      where: { id: patientId },
      include: { user: true },
    });
    if (!patient) return errorResponse('Target patient not found', 404);

    const newRequest = await prisma.consentRequest.create({
      data: {
        patientId,
        doctorId: doctor.id,
        reason,
        scope,
        duration: durationHours,
        categories: categories ? JSON.stringify(categories) : null,
        recordIds: recordIds ? JSON.stringify(recordIds) : null,
        status: 'PENDING',
      },
    });

    // Notify patient
    await prisma.notification.create({
      data: {
        userId: patient.userId,
        type: 'ACCESS_REQUEST',
        title: 'New Doctor Access Request',
        message: `${doctor.firstName} ${doctor.lastName} requested access to your records: "${reason}"`,
        relatedId: newRequest.id,
      },
    });

    await createAuditRecord({
      eventType: 'ACCESS',
      actorId: auth.user.userId,
      subjectId: patient.userId,
      resourceId: newRequest.id,
      action: 'CONSENT_REQUESTED',
      details: { reason, scope, durationHours },
    });

    return successResponse(newRequest, 201);
  } catch (err: any) {
    console.error('Create request error:', err);
    return errorResponse('Failed to create consent request', 500);
  }
}
