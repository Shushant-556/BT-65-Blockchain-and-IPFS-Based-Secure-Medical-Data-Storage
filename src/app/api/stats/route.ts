import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateRequest, successResponse, errorResponse } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    if (auth.user.role === 'PATIENT') {
      const patient = await prisma.patientProfile.findUnique({
        where: { userId: auth.user.userId },
      });
      if (!patient) return errorResponse('Patient profile not found', 404);

      const [
        totalRecords,
        activeConsents,
        pendingRequests,
        verifiedRecords,
        categoriesCount,
        recentActivity,
      ] = await Promise.all([
        prisma.medicalRecord.count({ where: { patientId: patient.id, isDeleted: false } }),
        prisma.consentGrant.count({
          where: { patientId: patient.id, isRevoked: false, expiresAt: { gt: new Date() } },
        }),
        prisma.consentRequest.count({
          where: { patientId: patient.id, status: 'PENDING' },
        }),
        prisma.medicalRecord.count({
          where: { patientId: patient.id, isVerified: true, isDeleted: false },
        }),
        prisma.medicalRecord.groupBy({
          by: ['category'],
          where: { patientId: patient.id, isDeleted: false },
          _count: { id: true },
        }),
        prisma.auditEvent.findMany({
          where: {
            OR: [{ actorId: auth.user.userId }, { subjectId: auth.user.userId }],
          },
          take: 5,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      return successResponse({
        role: 'PATIENT',
        totalRecords,
        activeConsents,
        pendingRequests,
        verifiedRecords,
        categoriesDistribution: categoriesCount.map((c) => ({
          category: c.category,
          count: c._count.id,
        })),
        recentActivity,
        storageFootprintKb: totalRecords * 280, // estimated KB
      });
    } else if (auth.user.role === 'DOCTOR') {
      const doctor = await prisma.doctorProfile.findUnique({
        where: { userId: auth.user.userId },
      });
      if (!doctor) return errorResponse('Doctor profile not found', 404);

      const [authorizedPatientsCount, pendingRequestsCount, recentAccessLogs] =
        await Promise.all([
          prisma.consentGrant.count({
            where: { doctorId: doctor.id, isRevoked: false, expiresAt: { gt: new Date() } },
          }),
          prisma.consentRequest.count({
            where: { doctorId: doctor.id, status: 'PENDING' },
          }),
          prisma.accessLog.findMany({
            where: { actorId: auth.user.userId },
            take: 5,
            orderBy: { createdAt: 'desc' },
          }),
        ]);

      return successResponse({
        role: 'DOCTOR',
        authorizedPatientsCount,
        pendingRequestsCount,
        recentAccessLogs,
      });
    } else {
      // ADMIN & HOSPITAL
      const [usersCount, recordsCount, transactionsCount, auditCount] = await Promise.all([
        prisma.user.count(),
        prisma.medicalRecord.count({ where: { isDeleted: false } }),
        prisma.blockchainTransaction.count(),
        prisma.auditEvent.count(),
      ]);

      return successResponse({
        role: auth.user.role,
        usersCount,
        recordsCount,
        transactionsCount,
        auditCount,
      });
    }
  } catch (err: any) {
    console.error('Stats endpoint error:', err);
    return errorResponse('Failed to retrieve dashboard analytics', 500);
  }
}
