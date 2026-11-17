import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateRequest, successResponse, errorResponse } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const eventType = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let whereClause: any = {};

    if (auth.user.role === 'PATIENT') {
      whereClause.OR = [
        { actorId: auth.user.userId },
        { subjectId: auth.user.userId },
      ];
    } else if (auth.user.role === 'DOCTOR') {
      whereClause.actorId = auth.user.userId;
    }

    if (eventType && eventType !== 'ALL') {
      whereClause.eventType = eventType;
    }

    const events = await prisma.auditEvent.findMany({
      where: whereClause,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(events);
  } catch (err: any) {
    console.error('Fetch audit events error:', err);
    return errorResponse('Failed to retrieve audit events', 500);
  }
}
