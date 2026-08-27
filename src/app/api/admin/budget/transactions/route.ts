import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { CreateBudgetTransactionSchema } from '@/lib/schemas';
import { extractGstFromTotal, round } from '@/lib/financial-calculator';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type')?.toUpperCase();
    const category = searchParams.get('category')?.trim();
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const quoteId = searchParams.get('quoteId')?.trim();
    const isPersonalParam = searchParams.get('isPersonal');
    const search = searchParams.get('search')?.trim();
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 100);
    const skip = (page - 1) * limit;

    const where: Prisma.BudgetTransactionWhereInput = {};

    // 1. Filter by transaction type (INCOME / EXPENSE)
    if (type === 'INCOME' || type === 'EXPENSE') {
      where.type = type;
    }

    // 2. Filter by category
    if (category && category !== 'ALL') {
      where.category = { equals: category, mode: 'insensitive' };
    }

    // 3. Filter by quoteId
    if (quoteId) {
      where.quoteId = quoteId;
    }

    // 4. Filter by isPersonal (Default false to strictly keep business separate)
    if (isPersonalParam === 'true') {
      where.isPersonal = true;
    } else if (isPersonalParam === 'all') {
      // Don't filter isPersonal if 'all' is explicitly requested
    } else {
      where.isPersonal = false;
    }

    // 5. Filter by Date range
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        const start = new Date(startDate);
        if (!isNaN(start.getTime())) {
          where.date.gte = start;
        }
      }
      if (endDate) {
        const end = new Date(endDate);
        if (!isNaN(end.getTime())) {
          // If date-only string provided (YYYY-MM-DD), set to end of that day
          if (/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
            end.setHours(23, 59, 59, 999);
          }
          where.date.lte = end;
        }
      }
    }

    // 6. Optional search query
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [transactions, total] = await Promise.all([
      prisma.budgetTransaction.findMany({
        where,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
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
      }),
      prisma.budgetTransaction.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[Budget Transactions GET Error]', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget transactions' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => null);
    const validation = CreateBudgetTransactionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: validation.error.issues[0]?.message || 'Invalid budget transaction data',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    const amount = round(data.amount);
    const isPersonal = data.isPersonal ?? false;

    // Auto-calculate 10% GST if not explicitly provided
    let gstAmount: number;
    if (data.gstAmount !== undefined && data.gstAmount !== null) {
      gstAmount = round(data.gstAmount);
    } else if (isPersonal) {
      gstAmount = 0;
    } else {
      gstAmount = extractGstFromTotal(amount).gstAmount;
    }

    // Default tax deductibility
    let isTaxDeductible: boolean;
    if (data.isTaxDeductible !== undefined) {
      isTaxDeductible = data.isTaxDeductible;
    } else if (isPersonal) {
      isTaxDeductible = false;
    } else {
      isTaxDeductible = data.type === 'EXPENSE';
    }

    // Validate quoteId if provided
    if (data.quoteId) {
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

    const parsedDate = data.date ? new Date(data.date) : new Date();
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date provided' }, { status: 400 });
    }

    const transaction = await prisma.budgetTransaction.create({
      data: {
        type: data.type,
        category: data.category.toUpperCase().trim(),
        amount,
        gstAmount,
        isTaxDeductible,
        description: data.description.trim(),
        date: parsedDate,
        reference: data.reference?.trim() || null,
        paymentMethod: data.paymentMethod?.trim() || 'BANK_TRANSFER',
        isPersonal,
        quoteId: data.quoteId || null,
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

    return NextResponse.json(
      {
        success: true,
        transaction,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Budget Transaction POST Error]', error);
    return NextResponse.json(
      { error: 'Failed to create budget transaction' },
      { status: 500 }
    );
  }
}
