import { NextRequest, NextResponse } from 'next/server';
import { Prisma, QuoteStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { CreateDetailedQuoteSchema } from '@/lib/schemas';
import { computeQuoteCalculations, generateNextQuoteNumber } from '@/lib/quote-engine';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status')?.toUpperCase();
    const leadId = searchParams.get('leadId')?.trim();
    const search = searchParams.get('search')?.trim();
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 100);
    const skip = (page - 1) * limit;

    const where: Prisma.DetailedQuoteWhereInput = {};

    // 1. Status Filter
    if (status && status !== 'ALL' && Object.values(QuoteStatus).includes(status as QuoteStatus)) {
      where.status = status as QuoteStatus;
    }

    // 2. Lead Filter
    if (leadId) {
      where.leadId = leadId;
    }

    // 3. Search query across quote number, customer details, address, project type
    if (search) {
      where.OR = [
        { quoteNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
        { projectAddress: { contains: search, mode: 'insensitive' } },
        { projectType: { contains: search, mode: 'insensitive' } },
        { scopeDescription: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [quotes, total] = await Promise.all([
      prisma.detailedQuote.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          lead: {
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
            },
          },
          items: true,
          _count: {
            select: {
              transactions: true,
            },
          },
        },
      }),
      prisma.detailedQuote.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      quotes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[Admin Quotes GET Error]', error);
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => null);
    const validation = CreateDetailedQuoteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: validation.error.issues[0]?.message || 'Invalid quote specifications',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Validate and check lead if provided
    if (data.leadId) {
      const existingLead = await prisma.quote.findUnique({
        where: { id: data.leadId },
      });
      if (!existingLead) {
        return NextResponse.json(
          { error: `Lead with ID "${data.leadId}" not found` },
          { status: 404 }
        );
      }
    }

    // Auto-generate unique quote number if not explicitly specified
    const quoteNumber = data.quoteNumber || (await generateNextQuoteNumber(prisma));

    // Ensure quote number is not duplicated
    const existingQuote = await prisma.detailedQuote.findUnique({
      where: { quoteNumber },
    });
    if (existingQuote) {
      return NextResponse.json(
        { error: `Quote number "${quoteNumber}" already exists` },
        { status: 409 }
      );
    }

    // Compute tile materials, financials, proposal and BOM items
    const computed = computeQuoteCalculations({
      quoteNumber,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      projectAddress: data.projectAddress,
      projectType: data.projectType,
      scopeDescription: data.scopeDescription,
      areaM2: data.areaM2,
      wastagePercent: data.wastagePercent,
      tileLengthMm: data.tileLengthMm,
      tileWidthMm: data.tileWidthMm,
      tileThicknessMm: data.tileThicknessMm,
      groutJointMm: data.groutJointMm,
      trowelSizeMm: data.trowelSizeMm,
      isWetArea: data.isWetArea,
      materialCost: data.materialCost,
      labourDays: data.labourDays,
      labourDayRate: data.labourDayRate,
      otherCost: data.otherCost,
      markupPercent: data.markupPercent,
      profitMarginPercent: data.profitMarginPercent,
      subtotalExGst: data.subtotalExGst,
      depositRequired: data.depositRequired,
      proposalTone: data.proposalTone,
      notes: data.notes,
      items: data.items,
    });

    const status = (data.status || 'DRAFT') as QuoteStatus;

    // Create quote and associated items in transaction
    const quote = await prisma.$transaction(async (tx) => {
      const created = await tx.detailedQuote.create({
        data: {
          leadId: data.leadId || null,
          quoteNumber: computed.quoteNumber,
          customerName: computed.customerName,
          customerEmail: computed.customerEmail,
          customerPhone: computed.customerPhone,
          projectAddress: computed.projectAddress,
          projectType: computed.projectType,
          scopeDescription: computed.scopeDescription,
          status,

          // Tile & Area Specifications
          areaM2: computed.areaM2,
          wastagePercent: computed.wastagePercent,
          tileLengthMm: computed.tileLengthMm,
          tileWidthMm: computed.tileWidthMm,
          tileThicknessMm: computed.tileThicknessMm,
          groutJointMm: computed.groutJointMm,
          trowelSizeMm: computed.trowelSizeMm,
          isWetArea: computed.isWetArea,

          // Calculated Materials
          tilesNeededM2: computed.tilesNeededM2,
          tilesBoxCount: computed.tilesBoxCount,
          adhesiveBags: computed.adhesiveBags,
          groutKg: computed.groutKg,
          siliconeTubes: computed.siliconeTubes,
          waterproofingLitres: computed.waterproofingLitres,
          primerLitres: computed.primerLitres,
          clipsCount: computed.clipsCount,

          // Financials
          materialCost: computed.materialCost,
          labourDays: computed.labourDays,
          labourDayRate: computed.labourDayRate,
          labourCost: computed.labourCost,
          otherCost: computed.otherCost,
          totalCost: computed.totalCost,
          markupPercent: computed.markupPercent,
          profitMarginPercent: computed.profitMarginPercent,
          grossProfit: computed.grossProfit,
          subtotalExGst: computed.subtotalExGst,
          gstAmount: computed.gstAmount,
          totalIncGst: computed.totalIncGst,

          // Proposal
          proposalText: computed.proposalText,
          depositRequired: computed.depositRequired,
          notes: computed.notes,

          // Nested Quote Items
          items: {
            create: computed.items.map((item) => ({
              name: item.name,
              category: item.category,
              quantity: item.quantity,
              unit: item.unit,
              unitCost: item.unitCost,
              unitPrice: item.unitPrice,
              totalCost: item.totalCost,
              totalPrice: item.totalPrice,
              notes: item.notes,
            })),
          },
        },
        include: {
          lead: true,
          items: true,
        },
      });

      // Update lead status to QUOTED if linked and requested
      if (data.leadId && data.updateLeadStatus) {
        await tx.quote.update({
          where: { id: data.leadId },
          data: { status: 'QUOTED' },
        });
      }

      return created;
    });

    return NextResponse.json(
      {
        success: true,
        quote,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Admin Quotes POST Error]', error);
    return NextResponse.json(
      { error: 'Failed to create detailed quote' },
      { status: 500 }
    );
  }
}
