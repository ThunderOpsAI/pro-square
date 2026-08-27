import { NextRequest, NextResponse } from 'next/server';
import { QuoteStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { UpdateDetailedQuoteSchema } from '@/lib/schemas';
import { computeQuoteCalculations } from '@/lib/quote-engine';

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

    const quote = await prisma.detailedQuote.findFirst({
      where: {
        OR: [{ id }, { quoteNumber: id }],
      },
      include: {
        lead: true,
        items: {
          orderBy: { id: 'asc' },
        },
        transactions: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      quote,
    });
  } catch (error) {
    console.error('[Admin Quote Detail GET Error]', error);
    return NextResponse.json({ error: 'Failed to fetch quote details' }, { status: 500 });
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
    const validation = UpdateDetailedQuoteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: validation.error.issues[0]?.message || 'Invalid quote update data',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const existingQuote = await prisma.detailedQuote.findFirst({
      where: {
        OR: [{ id }, { quoteNumber: id }],
      },
      include: {
        items: true,
      },
    });

    if (!existingQuote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    const data = validation.data;

    // Merge updated specs with existing specifications
    const mergedSpecs = {
      quoteNumber: existingQuote.quoteNumber,
      customerName: data.customerName ?? existingQuote.customerName,
      customerEmail: data.customerEmail ?? existingQuote.customerEmail,
      customerPhone: data.customerPhone !== undefined ? data.customerPhone : existingQuote.customerPhone,
      projectAddress: data.projectAddress !== undefined ? data.projectAddress : existingQuote.projectAddress,
      projectType: data.projectType ?? existingQuote.projectType,
      scopeDescription: data.scopeDescription !== undefined ? data.scopeDescription : existingQuote.scopeDescription,
      areaM2: data.areaM2 !== undefined ? data.areaM2 : existingQuote.areaM2,
      wastagePercent: data.wastagePercent !== undefined ? data.wastagePercent : existingQuote.wastagePercent,
      tileLengthMm: data.tileLengthMm !== undefined && data.tileLengthMm !== null ? data.tileLengthMm : existingQuote.tileLengthMm,
      tileWidthMm: data.tileWidthMm !== undefined && data.tileWidthMm !== null ? data.tileWidthMm : existingQuote.tileWidthMm,
      tileThicknessMm: data.tileThicknessMm !== undefined && data.tileThicknessMm !== null ? data.tileThicknessMm : existingQuote.tileThicknessMm,
      groutJointMm: data.groutJointMm !== undefined && data.groutJointMm !== null ? data.groutJointMm : existingQuote.groutJointMm,
      trowelSizeMm: data.trowelSizeMm !== undefined && data.trowelSizeMm !== null ? data.trowelSizeMm : existingQuote.trowelSizeMm,
      isWetArea: data.isWetArea !== undefined ? data.isWetArea : existingQuote.isWetArea,
      materialCost: data.materialCost !== undefined ? data.materialCost : undefined,
      labourDays: data.labourDays !== undefined ? data.labourDays : existingQuote.labourDays,
      labourDayRate: data.labourDayRate !== undefined ? data.labourDayRate : existingQuote.labourDayRate,
      otherCost: data.otherCost !== undefined ? data.otherCost : existingQuote.otherCost,
      markupPercent: data.markupPercent !== undefined ? data.markupPercent : undefined,
      profitMarginPercent: data.profitMarginPercent !== undefined ? data.profitMarginPercent : undefined,
      subtotalExGst: data.subtotalExGst !== undefined ? data.subtotalExGst : undefined,
      depositRequired: data.depositRequired !== undefined ? data.depositRequired : undefined,
      proposalTone: data.proposalTone,
      notes: data.notes !== undefined ? data.notes : existingQuote.notes,
      items: data.items !== undefined ? data.items : existingQuote.items.map(item => ({
        id: item.id,
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
    };

    // Recalculate tile materials & financials
    const computed = computeQuoteCalculations(mergedSpecs);

    // Status management & sentAt handling
    const newStatus = (data.status ?? existingQuote.status) as QuoteStatus;
    let sentAt = existingQuote.sentAt;
    if (newStatus === 'SENT' && !sentAt) {
      sentAt = new Date();
    }

    const updatedQuote = await prisma.$transaction(async (tx) => {
      // If new items were explicitly provided, replace existing items
      if (data.items !== undefined) {
        await tx.quoteItem.deleteMany({
          where: { quoteId: existingQuote.id },
        });

        await tx.quoteItem.createMany({
          data: computed.items.map((item) => ({
            quoteId: existingQuote.id,
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
        });
      }

      const updated = await tx.detailedQuote.update({
        where: { id: existingQuote.id },
        data: {
          leadId: data.leadId !== undefined ? data.leadId : existingQuote.leadId,
          customerName: computed.customerName,
          customerEmail: computed.customerEmail,
          customerPhone: computed.customerPhone,
          projectAddress: computed.projectAddress,
          projectType: computed.projectType,
          scopeDescription: computed.scopeDescription,
          status: newStatus,
          sentAt,

          // Area & Tile Specs
          areaM2: computed.areaM2,
          wastagePercent: computed.wastagePercent,
          tileLengthMm: computed.tileLengthMm,
          tileWidthMm: computed.tileWidthMm,
          tileThicknessMm: computed.tileThicknessMm,
          groutJointMm: computed.groutJointMm,
          trowelSizeMm: computed.trowelSizeMm,
          isWetArea: computed.isWetArea,

          // Auto-calculated Materials
          tilesNeededM2: computed.tilesNeededM2,
          tilesBoxCount: computed.tilesBoxCount,
          adhesiveBags: computed.adhesiveBags,
          groutKg: computed.groutKg,
          siliconeTubes: computed.siliconeTubes,
          waterproofingLitres: computed.waterproofingLitres,
          primerLitres: computed.primerLitres,
          clipsCount: computed.clipsCount,

          // Financial Breakdown
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
          proposalText: data.proposalText !== undefined ? data.proposalText : computed.proposalText,
          depositRequired: computed.depositRequired,
          notes: computed.notes,
        },
        include: {
          lead: true,
          items: true,
          transactions: true,
        },
      });

      // Synchronize lead status if connected
      const targetLeadId = data.leadId !== undefined ? data.leadId : existingQuote.leadId;
      if (targetLeadId) {
        if (newStatus === 'WON') {
          await tx.quote.update({ where: { id: targetLeadId }, data: { status: 'WON' } }).catch(() => null);
        } else if (newStatus === 'LOST') {
          await tx.quote.update({ where: { id: targetLeadId }, data: { status: 'LOST' } }).catch(() => null);
        } else if (newStatus === 'SENT' || newStatus === 'DRAFT') {
          await tx.quote.update({ where: { id: targetLeadId }, data: { status: 'QUOTED' } }).catch(() => null);
        }
      }

      return updated;
    });

    return NextResponse.json({
      success: true,
      quote: updatedQuote,
    });
  } catch (error) {
    console.error('[Admin Quote Detail PATCH Error]', error);
    return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 });
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

    const existingQuote = await prisma.detailedQuote.findFirst({
      where: {
        OR: [{ id }, { quoteNumber: id }],
      },
    });

    if (!existingQuote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    await prisma.detailedQuote.delete({
      where: { id: existingQuote.id },
    });

    return NextResponse.json({
      success: true,
      message: `Quote ${existingQuote.quoteNumber} deleted successfully`,
    });
  } catch (error) {
    console.error('[Admin Quote Detail DELETE Error]', error);
    return NextResponse.json({ error: 'Failed to delete quote' }, { status: 500 });
  }
}
