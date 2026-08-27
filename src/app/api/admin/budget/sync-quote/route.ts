import { NextRequest, NextResponse } from 'next/server';
import { QuoteStatus, TransactionType } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { SyncQuoteSchema } from '@/lib/schemas';
import { extractGstFromTotal, round } from '@/lib/financial-calculator';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => null);
    const validation = SyncQuoteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: validation.error.issues[0]?.message || 'Invalid sync quote request',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { quoteId, action } = validation.data;

    // Find the detailed quote by ID or quoteNumber
    const quote = await prisma.detailedQuote.findFirst({
      where: {
        OR: [
          { id: quoteId },
          { quoteNumber: quoteId },
        ],
      },
    });

    if (!quote) {
      return NextResponse.json(
        { error: `Quote with identifier "${quoteId}" not found` },
        { status: 404 }
      );
    }

    let createdTransaction;
    let updatedQuote = quote;

    if (action === 'WON' || action === 'INVOICE_PAID') {
      // Amount calculation (total inc GST)
      const amount = quote.totalIncGst > 0
        ? round(quote.totalIncGst)
        : round(quote.subtotalExGst + quote.gstAmount);

      const gstAmount = quote.gstAmount > 0
        ? round(quote.gstAmount)
        : extractGstFromTotal(amount).gstAmount;

      const description =
        action === 'WON'
          ? `Quote ${quote.quoteNumber} won - ${quote.customerName} (${quote.projectType})`
          : `Invoice payment received for Quote ${quote.quoteNumber} - ${quote.customerName}`;

      createdTransaction = await prisma.budgetTransaction.create({
        data: {
          quoteId: quote.id,
          type: TransactionType.INCOME,
          category: 'REVENUE_QUOTE',
          amount,
          gstAmount,
          isTaxDeductible: false,
          description,
          reference: quote.quoteNumber,
          date: new Date(),
          paymentMethod: 'BANK_TRANSFER',
          isPersonal: false,
        },
        include: {
          quote: {
            select: {
              id: true,
              quoteNumber: true,
              customerName: true,
              projectType: true,
            },
          },
        },
      });

      // Update quote status if needed
      const targetStatus = action === 'WON' ? QuoteStatus.WON : QuoteStatus.PAID;
      if (quote.status !== targetStatus) {
        updatedQuote = await prisma.detailedQuote.update({
          where: { id: quote.id },
          data: { status: targetStatus },
        });
      }
    } else if (action === 'LOG_MATERIAL_EXPENSE') {
      const amount = round(quote.materialCost);
      const gstAmount = extractGstFromTotal(amount).gstAmount;
      const description = `Material expense logged for Quote ${quote.quoteNumber} - ${quote.customerName}`;

      createdTransaction = await prisma.budgetTransaction.create({
        data: {
          quoteId: quote.id,
          type: TransactionType.EXPENSE,
          category: 'MATERIALS',
          amount,
          gstAmount,
          isTaxDeductible: true,
          description,
          reference: `${quote.quoteNumber}-MAT`,
          date: new Date(),
          paymentMethod: 'BANK_TRANSFER',
          isPersonal: false,
        },
        include: {
          quote: {
            select: {
              id: true,
              quoteNumber: true,
              customerName: true,
              projectType: true,
            },
          },
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        action,
        transaction: createdTransaction,
        quote: {
          id: updatedQuote.id,
          quoteNumber: updatedQuote.quoteNumber,
          status: updatedQuote.status,
          customerName: updatedQuote.customerName,
          totalIncGst: updatedQuote.totalIncGst,
          materialCost: updatedQuote.materialCost,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Admin Sync Quote Error]', error);
    return NextResponse.json(
      { error: 'Failed to sync quote to budget ledger' },
      { status: 500 }
    );
  }
}
