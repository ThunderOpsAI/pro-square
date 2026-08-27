import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { UpdateBudgetTransactionSchema } from '@/lib/schemas';
import { extractGstFromTotal, round } from '@/lib/financial-calculator';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const transaction = await prisma.budgetTransaction.findUnique({
      where: { id },
      include: {
        quote: {
          select: {
            id: true,
            quoteNumber: true,
            customerName: true,
            projectType: true,
            totalIncGst: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, transaction });
  } catch (error) {
    console.error('[Admin Budget Transaction GET Error]', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction details' },
      { status: 500 }
    );
  }
}

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
    const validation = UpdateBudgetTransactionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: validation.error.issues[0]?.message || 'Invalid budget transaction data',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const existing = await prisma.budgetTransaction.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const data = validation.data;

    // Validate quoteId if updated
    if (data.quoteId !== undefined && data.quoteId !== null) {
      const quote = await prisma.detailedQuote.findUnique({
        where: { id: data.quoteId },
      });
      if (!quote) {
        return NextResponse.json(
          { error: `Quote with ID "${data.quoteId}" not found` },
          { status: 404 }
        );
      }
    }

    const effectivePersonal = data.isPersonal !== undefined ? data.isPersonal : existing.isPersonal;
    const effectiveAmount = data.amount !== undefined ? round(data.amount) : existing.amount;

    let effectiveGstAmount = existing.gstAmount;
    if (data.gstAmount !== undefined && data.gstAmount !== null) {
      effectiveGstAmount = round(data.gstAmount);
    } else if (data.amount !== undefined || data.isPersonal !== undefined) {
      // Recalculate if amount or isPersonal changed and gstAmount was not explicitly given
      if (effectivePersonal) {
        effectiveGstAmount = 0;
      } else {
        effectiveGstAmount = extractGstFromTotal(effectiveAmount).gstAmount;
      }
    }

    let parsedDate: Date | undefined;
    if (data.date !== undefined) {
      parsedDate = new Date(data.date);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json({ error: 'Invalid date provided' }, { status: 400 });
      }
    }

    const updated = await prisma.budgetTransaction.update({
      where: { id },
      data: {
        ...(data.type !== undefined && { type: data.type }),
        ...(data.category !== undefined && { category: data.category.toUpperCase().trim() }),
        ...(data.amount !== undefined && { amount: effectiveAmount }),
        ...(effectiveGstAmount !== undefined && { gstAmount: effectiveGstAmount }),
        ...(data.isTaxDeductible !== undefined && { isTaxDeductible: data.isTaxDeductible }),
        ...(data.description !== undefined && { description: data.description.trim() }),
        ...(parsedDate !== undefined && { date: parsedDate }),
        ...(data.reference !== undefined && { reference: data.reference ? data.reference.trim() : null }),
        ...(data.paymentMethod !== undefined && { paymentMethod: data.paymentMethod ? data.paymentMethod.trim() : 'BANK_TRANSFER' }),
        ...(data.isPersonal !== undefined && { isPersonal: data.isPersonal }),
        ...(data.quoteId !== undefined && { quoteId: data.quoteId || null }),
      },
      include: {
        quote: {
          select: {
            id: true,
            quoteNumber: true,
            customerName: true,
            projectType: true,
            totalIncGst: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, transaction: updated });
  } catch (error) {
    console.error('[Admin Budget Transaction PATCH Error]', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const existing = await prisma.budgetTransaction.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    await prisma.budgetTransaction.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Transaction deleted successfully',
      id,
    });
  } catch (error) {
    console.error('[Admin Budget Transaction DELETE Error]', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}
