import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { CalculatorCalculateSchema } from '@/lib/schemas';
import {
  calculateTileProject,
  TrowelNotchSize,
  LayingPattern,
} from '@/lib/tile-calculator';
import {
  calculateFinancialSummary,
  solveTargetPrice,
  round,
} from '@/lib/financial-calculator';

function resolveTrowelNotch(mm?: number | null): TrowelNotchSize {
  if (!mm) return '10mm';
  if (mm <= 6) return '6mm';
  if (mm <= 8) return '8mm';
  if (mm <= 10) return '10mm';
  if (mm <= 12) return '12mm';
  return '15mm';
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const validation = CalculatorCalculateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: validation.error.issues[0]?.message || 'Invalid calculator parameters',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // 1. Run Tile Calculation Engine
    const trowelNotch = resolveTrowelNotch(data.trowelSizeMm);
    const netArea = data.areaM2 ?? 0;
    const internalPerimeter = data.isWetArea && netArea > 0 ? round(Math.sqrt(netArea) * 4) : 0;

    const tileCalculation = calculateTileProject({
      area: {
        netArea,
        floors: data.floors,
        walls: data.walls,
        pattern: data.pattern as LayingPattern | undefined,
        customWastagePercent: data.wastagePercent,
      },
      tile: {
        lengthMm: data.tileLengthMm || 600,
        widthMm: data.tileWidthMm || 600,
        thicknessMm: data.tileThicknessMm || 10,
      },
      packaging: {
        m2PerBox: data.packagingM2PerBox,
        piecesPerBox: data.packagingPiecesPerBox,
      },
      adhesive: {
        trowelNotch,
      },
      grout: {
        jointWidthMm: data.groutJointMm || 2,
        thicknessMm: data.tileThicknessMm || 10,
      },
      waterproofing: {
        enabled: data.isWetArea,
        waterproofingAreaM2: data.isWetArea ? (tileCalculationAreaSafe(data.areaM2)) : 0,
        internalPerimeterLinearM: internalPerimeter,
      },
      silicone: {
        internalPerimeterLinearM: internalPerimeter,
      },
      levelling: {
        enabled: (data.tileLengthMm || 600) >= 300 || (data.tileWidthMm || 600) >= 300,
      },
    });

    // 2. Prepare Direct Costs for Financial Engine
    let materialCost = data.materialCost || 0;
    // If material cost is 0 but we have BOM, provide an estimated baseline material cost
    if (materialCost === 0 && tileCalculation.billOfMaterials.length > 0) {
      const defaultRates: Record<string, number> = {
        tiles: 45.0,
        adhesive: 35.0,
        grout: 8.0,
        waterproofing: 22.0,
        silicone: 18.0,
        levelling: 0.15,
      };
      for (const item of tileCalculation.billOfMaterials) {
        const rate = defaultRates[item.category] || 10.0;
        materialCost += item.quantity * rate;
      }
      materialCost = round(materialCost);
    }

    const labourDays = data.labourDays ?? (netArea > 0 ? Math.max(1, Math.ceil(netArea / 12)) : 0);
    const labourDayRate = data.labourDayRate ?? 650;

    let labourCost: number;
    if (data.labourCost !== undefined && data.labourCost > 0) {
      labourCost = round(data.labourCost);
    } else {
      labourCost = round(labourDays * labourDayRate);
    }

    const directCostInput = {
      materialCost,
      labourDays,
      labourDayRate,
      labourCost,
      subcontractorCost: data.subcontractorCost || 0,
      skipHireCost: data.skipHireCost || 0,
      equipmentHireCost: data.equipmentHireCost || 0,
      otherDirectCosts: data.otherCost || 0,
    };

    // Calculate Quoted Price (Ex GST) if markup/margins provided
    const totalCostEstimated = round(
      materialCost +
      labourCost +
      (data.subcontractorCost || 0) +
      (data.skipHireCost || 0) +
      (data.equipmentHireCost || 0) +
      (data.otherCost || 0)
    );

    let quotedPriceExGst = data.quotedPriceExGst;
    if (quotedPriceExGst === undefined && data.markupPercent !== undefined && data.markupPercent >= 0) {
      quotedPriceExGst = round(totalCostEstimated * (1 + data.markupPercent / 100));
    }

    const targetMarginPercentage =
      data.targetMarginPercentage !== undefined
        ? data.targetMarginPercentage
        : data.profitMarginPercent !== undefined
        ? data.profitMarginPercent
        : 30;

    // 3. Run Financial Summary Engine
    const financialSummary = calculateFinancialSummary({
      costs: directCostInput,
      quotedPriceExGst,
      quotedPriceIncGst: data.quotedPriceIncGst,
      targetMarginPercentage,
      gstRate: data.gstRate,
      incomeTaxRate: data.incomeTaxRate,
    });

    // 4. Compute Standard Target Pricing Scenarios for Trade Benchmarking
    const totalCost = financialSummary.costs.totalDirectCost;
    const targetPricingPresets = [20, 25, 30, 35, 40].map((margin) => {
      const result = solveTargetPrice({
        totalDirectCost: totalCost,
        targetMarginPercentage: margin,
        gstRate: data.gstRate,
        incomeTaxRate: data.incomeTaxRate,
      });
      return {
        marginPercent: margin,
        markupPercent: result.targetMarkupPercentage,
        priceExGst: result.requiredPriceExGst,
        gstAmount: result.gstAmount,
        priceIncGst: result.requiredPriceIncGst,
        grossProfit: result.expectedGrossProfit,
        takeHomeCash: result.taxReserves.realTakeHomeCash,
      };
    });

    return NextResponse.json({
      success: true,
      tileCalculation: {
        area: tileCalculation.area,
        tiles: tileCalculation.tiles,
        adhesive: tileCalculation.adhesive,
        grout: tileCalculation.grout,
        waterproofing: tileCalculation.waterproofing,
        silicone: tileCalculation.silicone,
        levelling: tileCalculation.levelling,
        billOfMaterials: tileCalculation.billOfMaterials,
      },
      financialSummary: {
        costs: financialSummary.costs,
        pricing: financialSummary.pricing,
        grossProfit: financialSummary.grossProfit,
        profitMarginPercent: financialSummary.profitMarginPercentage,
        markupPercent: financialSummary.markupPercentage,
        health: financialSummary.health,
        taxReserves: financialSummary.taxReserves,
        targetComparison: financialSummary.targetComparison,
      },
      targetPricingPresets,
    });
  } catch (error) {
    console.error('[Admin Calculator POST Error]', error);
    return NextResponse.json(
      { error: 'Failed to calculate tile and financial specifications' },
      { status: 500 }
    );
  }
}

function tileCalculationAreaSafe(area?: number): number {
  return Math.max(0, area || 0);
}
