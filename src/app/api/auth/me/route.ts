import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateRequest, successResponse, errorResponse } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.user.userId },
      include: {
        patientProfile: true,
        doctorProfile: {
          include: {
            hospital: true,
          },
        },
      },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    const displayName =
      user.role === 'PATIENT' && user.patientProfile
        ? `${user.patientProfile.firstName} ${user.patientProfile.lastName}`
        : user.role === 'DOCTOR' && user.doctorProfile
        ? `${user.doctorProfile.firstName} ${user.doctorProfile.lastName}`
        : user.email;

    return successResponse({
      id: user.id,
      email: user.email,
      role: user.role,
      walletAddress: user.walletAddress,
      publicKey: user.publicKey,
      displayName,
      profile: user.patientProfile || user.doctorProfile || null,
    });
  } catch (err: any) {
    console.error('Me endpoint error:', err);
    return errorResponse('Internal server error', 500);
  }
}
