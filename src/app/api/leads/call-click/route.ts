import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { CallClickSchema } from '@/lib/schemas';

function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parseResult = CallClickSchema.safeParse(body);

    const data = parseResult.success ? parseResult.data : { intent: 'call_button' };
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const userAgent = req.headers.get('user-agent') || undefined;

    const log = await prisma.callLog.create({
      data: {
        intent: data.intent,
        referrer: data.referrer || req.headers.get('referer') || undefined,
        userAgent,
        ipHash: ip !== 'unknown' ? hashIp(ip) : undefined,
      },
    });

    return NextResponse.json({ success: true, logId: log.id });
  } catch (error) {
    console.error('[API] Error logging call-click:', error);
    // Return 200/202 to never break client click flow
    return NextResponse.json({ success: false, error: 'Tracking failed' }, { status: 200 });
  }
}
