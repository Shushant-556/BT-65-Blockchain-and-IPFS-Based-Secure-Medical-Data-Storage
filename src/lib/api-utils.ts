import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractBearerToken, TokenPayload } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@/types/auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload;
}

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

export function errorResponse(message: string, status = 400, details?: any) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      details: details ?? null,
    },
    { status }
  );
}

export async function authenticateRequest(
  request: NextRequest,
  allowedRoles?: UserRole[]
): Promise<{ user: TokenPayload } | { errorResponse: NextResponse }> {
  const authHeader = request.headers.get('authorization');
  const token = extractBearerToken(authHeader);

  if (!token) {
    return {
      errorResponse: errorResponse('Missing or invalid Authorization header', 401),
    };
  }

  try {
    const payload = await verifyToken(token);

    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(payload.role)) {
        return {
          errorResponse: errorResponse(
            `Access forbidden: requires one of [${allowedRoles.join(', ')}]`,
            403
          ),
        };
      }
    }

    return { user: payload };
  } catch (err: any) {
    return {
      errorResponse: errorResponse('Invalid or expired authentication token', 401),
    };
  }
}

export async function createAuditRecord({
  eventType,
  actorId,
  subjectId,
  resourceId,
  action,
  details,
  blockchainTxHash,
  severity = 'INFO',
}: {
  eventType: string;
  actorId?: string;
  subjectId?: string;
  resourceId?: string;
  action: string;
  details?: Record<string, any>;
  blockchainTxHash?: string;
  severity?: 'INFO' | 'WARNING' | 'CRITICAL';
}) {
  try {
    return await prisma.auditEvent.create({
      data: {
        eventType,
        actorId,
        subjectId,
        resourceId,
        action,
        details: details ? JSON.stringify(details) : null,
        blockchainTxHash,
        severity,
      },
    });
  } catch (error) {
    console.error('Failed to create audit record:', error);
  }
}
