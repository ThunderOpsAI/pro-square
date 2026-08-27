import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import {
  generateClientProposalHtml,
  ProposalLineItem,
  LineItemCategory,
} from '@/lib/proposal-generator';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const quote = await prisma.detailedQuote.findFirst({
      where: {
        OR: [{ id }, { quoteNumber: id }],
      },
      include: {
        lead: true,
        items: true,
      },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    const recipientEmail = (body.emailOverride?.trim() || quote.customerEmail).trim();
    if (!recipientEmail || !recipientEmail.includes('@')) {
      return NextResponse.json({ error: 'Valid recipient email address is required' }, { status: 400 });
    }

    // Map quote items to ProposalLineItems
    const lineItems: ProposalLineItem[] = quote.items.map((item) => {
      let category: LineItemCategory = 'supply';
      const c = item.category.toLowerCase();
      if (c.includes('waterproof')) category = 'waterproofing';
      else if (c.includes('prep')) category = 'preparation';
      else if (c.includes('labour') || c.includes('laying')) category = 'laying';
      else if (c.includes('grout') || c.includes('silicone')) category = 'grouting_sealing';
      else if (c.includes('finish') || c.includes('clean')) category = 'finishing';
      else if (c.includes('disposal') || c.includes('waste')) category = 'disposal';

      return {
        category,
        description: item.name,
        quantity: item.quantity,
        unit: (item.unit as ProposalLineItem['unit']) || 'm²',
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        notes: item.notes || undefined,
      };
    });

    // Generate responsive HTML proposal email
    const proposalHtml = generateClientProposalHtml({
      proposalNumber: quote.quoteNumber,
      client: {
        name: quote.customerName,
        email: recipientEmail,
        phone: quote.customerPhone || undefined,
        address: quote.projectAddress || undefined,
      },
      project: {
        title: `${quote.projectType} Installation`,
        projectType: quote.projectType,
        description: quote.scopeDescription || `${quote.projectType} tiling covering approx ${quote.areaM2} m².`,
      },
      lineItems: lineItems.length > 0 ? lineItems : undefined,
      materialSpecs: {
        tileFormat: `${quote.tileLengthMm || 600}x${quote.tileWidthMm || 600}mm (${quote.tileThicknessMm || 10}mm thick)`,
        groutSpecification: `${quote.groutJointMm || 2}mm joint width, flexible mold-resistant grout`,
        movementJointsAndSealant: `Sanitary 100% neutral-cure perimeter silicone`,
      },
      pricing: {
        fixedTotal: quote.subtotalExGst,
        applyGst: true,
      },
    });

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Pro Square Tiling <onboarding@resend.dev>';
    const emailSubject = body.subject || `Trade Proposal ${quote.quoteNumber}: ${quote.projectType} | Pro Square Tiling`;

    let emailSentId: string | null = null;

    if (resend) {
      const emailResult = await resend.emails.send({
        from: fromEmail,
        to: recipientEmail,
        subject: emailSubject,
        html: proposalHtml,
      });

      if (emailResult.error) {
        console.error('[Send Proposal Email Error]', emailResult.error);
        return NextResponse.json(
          { error: `Resend error: ${emailResult.error.message}` },
          { status: 502 }
        );
      }

      emailSentId = emailResult.data?.id || null;
    } else {
      console.warn('[Proposal Email] RESEND_API_KEY is not configured. Simulating email dispatch.');
      emailSentId = `simulated_${Date.now()}`;
    }

    const sentAt = new Date();

    // Update Quote status to SENT and record sentAt
    const updatedQuote = await prisma.$transaction(async (tx) => {
      const q = await tx.detailedQuote.update({
        where: { id: quote.id },
        data: {
          status: 'SENT',
          sentAt,
        },
        include: {
          lead: true,
          items: true,
        },
      });

      // Update connected lead to QUOTED
      if (quote.leadId) {
        await tx.quote.update({
          where: { id: quote.leadId },
          data: { status: 'QUOTED' },
        }).catch(() => null);
      }

      return q;
    });

    return NextResponse.json({
      success: true,
      message: `Proposal ${quote.quoteNumber} successfully sent to ${recipientEmail}`,
      sentAt,
      emailId: emailSentId,
      quote: updatedQuote,
    });
  } catch (error) {
    console.error('[Admin Send Proposal POST Error]', error);
    return NextResponse.json({ error: 'Failed to send proposal email' }, { status: 500 });
  }
}
