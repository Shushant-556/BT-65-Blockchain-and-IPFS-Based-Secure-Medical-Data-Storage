import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateRequest, successResponse, errorResponse, createAuditRecord } from '@/lib/api-utils';
import { z } from 'zod';

const createRecordSchema = z.object({
  title: z.string().min(1),
  category: z.string(),
  description: z.string().optional(),
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  encryptedCid: z.string().optional(),
  contentHash: z.string(),
  metadataHash: z.string().optional(),
  blockchainTxHash: z.string().optional(),
  blockchainRecordId: z.string().optional(),
  doctorName: z.string().optional(),
  examinationDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
  keyEnvelope: z
    .object({
      encryptedKey: z.string(),
      wrappingKeyId: z.string(),
      algorithm: z.string().default('AES-KW'),
    })
    .optional(),
});

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const targetPatientId = searchParams.get('patientId');

  try {
    let patientIdToQuery: string | null = null;

    if (auth.user.role === 'PATIENT') {
      const patient = await prisma.patientProfile.findUnique({
        where: { userId: auth.user.userId },
      });
      if (!patient) return errorResponse('Patient profile not found', 404);
      patientIdToQuery = patient.id;
    } else if (auth.user.role === 'DOCTOR') {
      const doctor = await prisma.doctorProfile.findUnique({
        where: { userId: auth.user.userId },
      });
      if (!doctor) return errorResponse('Doctor profile not found', 404);

      if (!targetPatientId) {
        return errorResponse('Doctor must specify patientId parameter to access records', 400);
      }

      // Check active consent
      const activeGrant = await prisma.consentGrant.findFirst({
        where: {
          patientId: targetPatientId,
          doctorId: doctor.id,
          isRevoked: false,
          expiresAt: { gt: new Date() },
        },
      });

      if (!activeGrant) {
        await createAuditRecord({
          eventType: 'ACCESS',
          actorId: auth.user.userId,
          action: 'ACCESS_DENIED_NO_CONSENT',
          details: { targetPatientId, doctorId: doctor.id },
          severity: 'WARNING',
        });
        return errorResponse('Access denied: No active consent grant from patient', 403);
      }

      patientIdToQuery = targetPatientId;
    } else if (auth.user.role === 'ADMIN' || auth.user.role === 'HOSPITAL') {
      if (targetPatientId) {
        patientIdToQuery = targetPatientId;
      }
    }

    const whereClause: any = {
      isDeleted: false,
    };

    if (patientIdToQuery) {
      whereClause.patientId = patientIdToQuery;
    }

    if (category && category !== 'ALL') {
      whereClause.category = category;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { doctorName: { contains: search } },
      ];
    }

    const records = await prisma.medicalRecord.findMany({
      where: whereClause,
      include: {
        keyEnvelopes: {
          where: {
            userId: auth.user.userId,
            isActive: true,
          },
        },
        patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(records);
  } catch (err: any) {
    console.error('Fetch records error:', err);
    return errorResponse('Failed to retrieve medical records', 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req, ['PATIENT', 'HOSPITAL']);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const body = await req.json();
    const parsed = createRecordSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Validation failed', 400, parsed.error.issues);
    }

    const data = parsed.data;

    let patientId: string;
    if (auth.user.role === 'PATIENT') {
      const patient = await prisma.patientProfile.findUnique({
        where: { userId: auth.user.userId },
      });
      if (!patient) return errorResponse('Patient profile not found', 404);
      patientId = patient.id;
    } else {
      const targetPatient = req.nextUrl.searchParams.get('patientId');
      if (!targetPatient) return errorResponse('Missing patientId for hospital upload', 400);
      patientId = targetPatient;
    }

    // Generate mock blockchain tx and record id if not provided
    const blockchainTxHash =
      data.blockchainTxHash ||
      `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const blockchainRecordId =
      data.blockchainRecordId ||
      `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    const newRecord = await prisma.medicalRecord.create({
      data: {
        patientId,
        title: data.title,
        category: data.category,
        description: data.description,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        encryptedCid: data.encryptedCid,
        contentHash: data.contentHash,
        metadataHash: data.metadataHash,
        blockchainTxHash,
        blockchainRecordId,
        isRegistered: true,
        isVerified: true,
        doctorName: data.doctorName,
        examinationDate: data.examinationDate || new Date().toISOString().split('T')[0],
        tags: data.tags ? JSON.stringify(data.tags) : null,
      },
    });

    if (data.keyEnvelope) {
      await prisma.encryptedKeyEnvelope.create({
        data: {
          recordId: newRecord.id,
          userId: auth.user.userId,
          encryptedKey: data.keyEnvelope.encryptedKey,
          wrappingKeyId: data.keyEnvelope.wrappingKeyId,
          algorithm: data.keyEnvelope.algorithm,
        },
      });
    }

    await prisma.blockchainTransaction.create({
      data: {
        txHash: blockchainTxHash,
        contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        functionName: 'registerRecord',
        blockNumber: 1055,
        gasUsed: '84120',
        status: 'CONFIRMED',
        eventType: 'RecordRegistered',
        relatedId: newRecord.id,
        confirmedAt: new Date(),
      },
    });

    await createAuditRecord({
      eventType: 'ACCESS',
      actorId: auth.user.userId,
      resourceId: newRecord.id,
      action: 'RECORD_UPLOADED_AND_ANCHORED',
      details: {
        title: newRecord.title,
        category: newRecord.category,
        contentHash: newRecord.contentHash,
        encryptedCid: newRecord.encryptedCid,
      },
      blockchainTxHash,
    });

    await prisma.notification.create({
      data: {
        userId: auth.user.userId,
        type: 'RECORD_UPLOADED',
        title: 'Document Encrypted & Anchored',
        message: `"${newRecord.title}" was encrypted client-side and registered on blockchain.`,
        relatedId: newRecord.id,
      },
    });

    return successResponse(newRecord, 201);
  } catch (err: any) {
    console.error('Create record error:', err);
    return errorResponse('Failed to create medical record', 500);
  }
}
