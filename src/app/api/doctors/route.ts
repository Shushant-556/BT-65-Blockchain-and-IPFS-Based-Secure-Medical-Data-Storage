import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const doctors = await prisma.doctorProfile.findMany({
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            walletAddress: true,
            publicKey: true,
          },
        },
      },
      orderBy: { lastName: 'asc' },
    });

    return successResponse(doctors);
  } catch (err: any) {
    console.error('Fetch doctors error:', err);
    return errorResponse('Failed to retrieve doctors directory', 500);
  }
}
