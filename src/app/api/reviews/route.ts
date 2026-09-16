import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ReviewInputSchema } from '@/lib/schemas';

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    console.error('[Public Reviews GET Error]', error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const validation = ReviewInputSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid review data' },
        { status: 400 }
      );
    }

    const { customerName, starRating, reviewText, projectType } = validation.data;

    const review = await prisma.review.create({
      data: {
        customerName,
        starRating,
        reviewText,
        projectType: projectType || null,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error: any) {
    console.error('[Public Reviews POST Error]', error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
