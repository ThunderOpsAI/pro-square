import { NextRequest, NextResponse } from 'next/server';
import { Prisma, ReviewStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status')?.toUpperCase();

    const where: Prisma.ReviewWhereInput = {};

    if (statusParam && statusParam !== 'ALL' && Object.values(ReviewStatus).includes(statusParam as ReviewStatus)) {
      where.status = statusParam as ReviewStatus;
    }

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error('[Admin Reviews GET Error]', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
