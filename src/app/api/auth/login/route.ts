import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { comparePassword, createToken } from '@/lib/auth';
import { successResponse, errorResponse, createAuditRecord } from '@/lib/api-utils';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Invalid input', 400, parsed.error.issues);
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        patientProfile: true,
        doctorProfile: true,
      },
    });

    if (!user || !user.isActive) {
      return errorResponse('Invalid email or password', 401);
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      await prisma.securityEvent.create({
        data: {
          userId: user.id,
          eventType: 'LOGIN_FAILED',
          severity: 'MEDIUM',
          details: 'Incorrect password attempt',
          ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
        },
      });
      return errorResponse('Invalid email or password', 401);
    }

    const token = await createToken({
      id: user.id,
      email: user.email,
      role: user.role as any,
    });

    await createAuditRecord({
      eventType: 'ACCESS',
      actorId: user.id,
      action: 'LOGIN_SUCCESS',
      details: { role: user.role, email: user.email },
    });

    const displayName =
      user.role === 'PATIENT' && user.patientProfile
        ? `${user.patientProfile.firstName} ${user.patientProfile.lastName}`
        : user.role === 'DOCTOR' && user.doctorProfile
        ? `${user.doctorProfile.firstName} ${user.doctorProfile.lastName}`
        : user.email;

    return successResponse({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
        publicKey: user.publicKey,
        displayName,
        profile: user.patientProfile || user.doctorProfile || null,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return errorResponse('Internal server error during login', 500);
  }
}
