import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const transactions = await prisma.blockchainTransaction.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(transactions);
  } catch (err: any) {
    console.error('Fetch transactions error:', err);
    return errorResponse('Failed to retrieve blockchain transactions', 500);
  }
}
