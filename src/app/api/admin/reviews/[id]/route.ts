import { NextRequest, NextResponse } from 'next/server';
import { ReviewStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json().catch(() => null);

    const status = body?.status;
    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be APPROVED or REJECTED' },
        { status: 400 }
      );
    }

    const updateData: {
      status: ReviewStatus;
      approvedAt?: Date | null;
    } = {
      status: status as ReviewStatus,
    };

    if (status === 'APPROVED') {
      updateData.approvedAt = new Date();
    }

    const review = await prisma.review.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('[Admin Review PATCH Error]', error);
    return NextResponse.json({ error: 'Failed to update review status' }, { status: 500 });
  }
}
