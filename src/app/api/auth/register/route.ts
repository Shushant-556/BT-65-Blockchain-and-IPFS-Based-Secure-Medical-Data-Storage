import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, createToken } from '@/lib/auth';
import { successResponse, errorResponse, createAuditRecord } from '@/lib/api-utils';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['PATIENT', 'DOCTOR', 'HOSPITAL', 'ADMIN']),
  walletAddress: z.string().optional(),
  publicKey: z.string().optional(),
  // Profile fields
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  // Patient specific
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  bloodGroup: z.string().optional(),
  // Doctor specific
  specialization: z.string().optional(),
  licenseNumber: z.string().optional(),
  hospitalId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Validation failed', 400, parsed.error.issues);
    }

    const data = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return errorResponse('An account with this email already exists', 409);
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: data.role,
        walletAddress: data.walletAddress || null,
        publicKey: data.publicKey || null,
      },
    });

    if (data.role === 'PATIENT') {
      await prisma.patientProfile.create({
        data: {
          userId: user.id,
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth || '1990-01-01',
          gender: data.gender || 'Unknown',
          bloodGroup: data.bloodGroup || null,
        },
      });
    } else if (data.role === 'DOCTOR') {
      await prisma.doctorProfile.create({
        data: {
          userId: user.id,
          firstName: data.firstName,
          lastName: data.lastName,
          specialization: data.specialization || 'General Practice',
          licenseNumber: data.licenseNumber || `MD-${Date.now().toString().slice(-6)}`,
          hospitalId: data.hospitalId || null,
          isVerified: false,
        },
      });
    }

    await createAuditRecord({
      eventType: 'SECURITY',
      actorId: user.id,
      action: 'USER_REGISTERED',
      details: { role: user.role, email: user.email },
    });

    const token = await createToken({
      id: user.id,
      email: user.email,
      role: user.role as any,
    });

    return successResponse(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          walletAddress: user.walletAddress,
          displayName: `${data.firstName} ${data.lastName}`,
        },
      },
      201
    );
  } catch (err: any) {
    console.error('Registration error:', err);
    return errorResponse('Internal server error during registration', 500);
  }
}
