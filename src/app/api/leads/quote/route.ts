import { NextRequest, NextResponse, after } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { QuoteInputSchema } from '@/lib/schemas';
import { quoteRateLimiter } from '@/lib/rate-limit';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { runAiTriage } from '@/lib/ai-triage';
import { sendOwnerNotification, sendCustomerConfirmation } from '@/lib/email';

function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';

    // 1. Sliding Window Rate Limiting (5 submissions / hr / IP)
    const rateCheck = quoteRateLimiter.check(ip);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many submissions from this connection. Please try again in ${rateCheck.reset} seconds.`,
        },
        { status: 429 }
      );
    }

    // 2. Zod Schema Validation
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: 'Invalid JSON payload' }, { status: 400 });
    }

    const validation = QuoteInputSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Validation error';
      return NextResponse.json({ success: false, error: firstError, details: validation.error.format() }, { status: 400 });
    }

    const data = validation.data;

    // 3. Bot Protection (Cloudflare Turnstile)
    const turnstileResult = await verifyTurnstileToken(data.turnstileToken, ip);
    if (!turnstileResult.success) {
      return NextResponse.json({ success: false, error: turnstileResult.error }, { status: 403 });
    }

    // 4. PRIMARY ACTION: Save Quote to PostgreSQL (must succeed)
    const quote = await prisma.quote.create({
      data: {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        projectType: data.projectType,
        message: data.message.trim(),
        turnstileVerified: turnstileResult.success,
        source: data.source || req.headers.get('referer') || undefined,
        ipHash: hashIp(ip),
        status: 'NEW',
        aiTriageStatus: 'PENDING',
      },
    });

    // 5. SECONDARY ACTION: AI Triage & Transactional Emails (Serverless Background Execution via Next.js after())
    after(async () => {
      let aiResult = null;
      try {
        aiResult = await runAiTriage({
          firstName: quote.firstName,
          lastName: quote.lastName,
          email: quote.email,
          phone: quote.phone,
          projectType: quote.projectType,
          message: quote.message,
        });

        if (aiResult) {
          await prisma.quote.update({
            where: { id: quote.id },
            data: {
              aiSummary: aiResult.summary,
              aiEstimateLow: aiResult.estimateLow,
              aiEstimateHigh: aiResult.estimateHigh,
              aiDraftProposal: aiResult.draftProposal,
              aiTriageStatus: 'COMPLETED',
            },
          });
        } else {
          await prisma.quote.update({
            where: { id: quote.id },
            data: { aiTriageStatus: 'FAILED' },
          });
        }
      } catch (aiErr) {
        console.error('[Quote API] AI triage update error:', aiErr);
        await prisma.quote.update({
          where: { id: quote.id },
          data: { aiTriageStatus: 'FAILED' },
        }).catch(() => null);
      }

      // Dispatch Transactional Emails
      const emailPayload = {
        id: quote.id,
        firstName: quote.firstName,
        lastName: quote.lastName,
        email: quote.email,
        phone: quote.phone,
        projectType: quote.projectType,
        message: quote.message,
        createdAt: quote.createdAt,
        aiTriage: aiResult,
      };

      await Promise.allSettled([
        sendOwnerNotification(emailPayload),
        sendCustomerConfirmation(emailPayload),
      ]);
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Your quote request has been received! We will be in touch within 24 hours.',
        quoteId: quote.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Quote API Fatal Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to submit quote request at this time. Please try again or call us directly.',
      },
      { status: 500 }
    );
  }
}
