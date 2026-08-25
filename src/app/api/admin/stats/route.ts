import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [
      totalQuotes,
      newQuotes,
      contactedQuotes,
      quotedQuotes,
      wonQuotes,
      lostQuotes,
      totalCallClicks,
      recentQuotes,
    ] = await Promise.all([
      prisma.quote.count(),
      prisma.quote.count({ where: { status: 'NEW' } }),
      prisma.quote.count({ where: { status: 'CONTACTED' } }),
      prisma.quote.count({ where: { status: 'QUOTED' } }),
      prisma.quote.count({ where: { status: 'WON' } }),
      prisma.quote.count({ where: { status: 'LOST' } }),
      prisma.callLog.count(),
      prisma.quote.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          projectType: true,
          status: true,
          aiEstimateLow: true,
          aiEstimateHigh: true,
          createdAt: true,
        },
      }),
    ]);

    // Calculate ballpark estimated pipeline value from active quotes (NEW, CONTACTED, QUOTED)
    const activeQuotesEstimates = await prisma.quote.findMany({
      where: {
        status: { in: ['NEW', 'CONTACTED', 'QUOTED'] },
        aiEstimateHigh: { not: null },
      },
      select: { aiEstimateLow: true, aiEstimateHigh: true },
    });

    const pipelineValue = activeQuotesEstimates.reduce(
      (acc, q) => acc + ((q.aiEstimateLow || 0) + (q.aiEstimateHigh || 0)) / 2,
      0
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalQuotes,
        newQuotes,
        contactedQuotes,
        quotedQuotes,
        wonQuotes,
        lostQuotes,
        totalCallClicks,
        pipelineValue: Math.round(pipelineValue),
        statusDistribution: {
          NEW: newQuotes,
          CONTACTED: contactedQuotes,
          QUOTED: quotedQuotes,
          WON: wonQuotes,
          LOST: lostQuotes,
        },
      },
      recentQuotes,
    });
  } catch (error) {
    console.error('[Admin Stats Error]', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
