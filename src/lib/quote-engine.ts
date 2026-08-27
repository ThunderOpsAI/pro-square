import { PrismaClient } from '@prisma/client';
import {
  calculateTileProject,
  TrowelNotchSize,
  BillOfMaterialsItem,
} from './tile-calculator';
import {
  calculateFinancialSummary,
  round,
} from './financial-calculator';
import {
  generateClientProposalText,
  ProposalLineItem,
  ProposalTone,
} from './proposal-generator';
import { CreateQuoteItemInput } from './schemas';

export interface ComputeQuoteInput {
  quoteNumber?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  projectAddress?: string | null;
  projectType?: string;
  scopeDescription?: string | null;
  areaM2?: number;
  wastagePercent?: number;
  tileLengthMm?: number | null;
  tileWidthMm?: number | null;
  tileThicknessMm?: number | null;
  groutJointMm?: number | null;
  trowelSizeMm?: number | null;
  isWetArea?: boolean;

  materialCost?: number;
  labourDays?: number;
  labourDayRate?: number;
  otherCost?: number;
  markupPercent?: number;
  profitMarginPercent?: number;
  subtotalExGst?: number;
  depositRequired?: number;
  proposalTone?: ProposalTone;
  notes?: string | null;

  items?: CreateQuoteItemInput[];
}

export interface ComputedQuoteResult {
  quoteNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  projectAddress: string | null;
  projectType: string;
  scopeDescription: string | null;
  areaM2: number;
  wastagePercent: number;
  tileLengthMm: number;
  tileWidthMm: number;
  tileThicknessMm: number;
  groutJointMm: number;
  trowelSizeMm: number;
  isWetArea: boolean;

  // Auto-calculated Materials
  tilesNeededM2: number;
  tilesBoxCount: number;
  adhesiveBags: number;
  groutKg: number;
  siliconeTubes: number;
  waterproofingLitres: number;
  primerLitres: number;
  clipsCount: number;

  // Financial Breakdown
  materialCost: number;
  labourDays: number;
  labourDayRate: number;
  labourCost: number;
  otherCost: number;
  totalCost: number;
  markupPercent: number;
  profitMarginPercent: number;
  grossProfit: number;
  subtotalExGst: number;
  gstAmount: number;
  totalIncGst: number;

  // Proposal & Milestones
  proposalText: string;
  depositRequired: number;
  notes: string | null;

  // Items to persist
  items: Array<{
    name: string;
    category: string;
    quantity: number;
    unit: string;
    unitCost: number;
    unitPrice: number;
    totalCost: number;
    totalPrice: number;
    notes?: string | null;
  }>;
}

/**
 * Resolves trowel notch size enum for tile calculator based on mm input
 */
function resolveTrowelNotch(mm?: number | null): TrowelNotchSize {
  if (!mm) return '10mm';
  if (mm <= 6) return '6mm';
  if (mm <= 8) return '8mm';
  if (mm <= 10) return '10mm';
  if (mm <= 12) return '12mm';
  return '15mm';
}

/**
 * Auto-generates the next sequential quote number for the current year (e.g. 'PST-2026-001')
 */
export async function generateNextQuoteNumber(prisma: PrismaClient): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `PST-${currentYear}-`;

  const quotes = await prisma.detailedQuote.findMany({
    where: {
      quoteNumber: {
        startsWith: prefix,
      },
    },
    select: {
      quoteNumber: true,
    },
  });

  let maxSequence = 0;
  for (const q of quotes) {
    const parts = q.quoteNumber.split('-');
    if (parts.length >= 3) {
      const seq = parseInt(parts[2], 10);
      if (!isNaN(seq) && seq > maxSequence) {
        maxSequence = seq;
      }
    }
  }

  const nextSequence = maxSequence + 1;
  return `${prefix}${nextSequence.toString().padStart(3, '0')}`;
}

/**
 * Converts BOM items from tile calculator into default QuoteItems
 */
function bomToQuoteItems(
  bom: BillOfMaterialsItem[],
  labourDays: number,
  labourDayRate: number,
  areaM2: number
): Array<{
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unitCost: number;
  unitPrice: number;
  totalCost: number;
  totalPrice: number;
  notes?: string | null;
}> {
  const items: Array<{
    name: string;
    category: string;
    quantity: number;
    unit: string;
    unitCost: number;
    unitPrice: number;
    totalCost: number;
    totalPrice: number;
    notes?: string | null;
  }> = [];

  // Default unit costs for materials
  const defaultCosts: Record<string, { unitCost: number; markup: number }> = {
    tiles: { unitCost: 45.0, markup: 1.35 },
    adhesive: { unitCost: 35.0, markup: 1.35 },
    grout: { unitCost: 8.0, markup: 1.35 },
    waterproofing: { unitCost: 22.0, markup: 1.35 },
    silicone: { unitCost: 18.0, markup: 1.35 },
    levelling: { unitCost: 0.15, markup: 1.35 },
  };

  for (const b of bom) {
    const config = defaultCosts[b.category] || { unitCost: 10.0, markup: 1.35 };
    const unitCost = config.unitCost;
    const unitPrice = round(unitCost * config.markup);
    const totalCost = round(b.quantity * unitCost);
    const totalPrice = round(b.quantity * unitPrice);

    items.push({
      name: b.item,
      category: b.category.toUpperCase(),
      quantity: b.quantity,
      unit: b.unit,
      unitCost,
      unitPrice,
      totalCost,
      totalPrice,
      notes: b.description,
    });
  }

  // Add Labour Item if labourDays > 0 or area > 0
  if (labourDays > 0 || areaM2 > 0) {
    const days = labourDays > 0 ? labourDays : Math.max(1, Math.ceil(areaM2 / 12));
    const dayRate = labourDayRate > 0 ? labourDayRate : 650;
    const labourCost = round(days * dayRate);
    const labourPrice = round(labourCost * 1.30);

    items.push({
      name: 'Trade Labour & Installation',
      category: 'LABOUR',
      quantity: days,
      unit: 'days',
      unitCost: dayRate,
      unitPrice: round(labourPrice / days),
      totalCost: labourCost,
      totalPrice: labourPrice,
      notes: `Master installation labour (${days} days @ $${dayRate}/day)`,
    });
  }

  return items;
}

/**
 * Runs end-to-end calculations across tile specifications, financials, margins, and proposals.
 */
export function computeQuoteCalculations(input: ComputeQuoteInput): ComputedQuoteResult {
  const quoteNumber = input.quoteNumber || `PST-${new Date().getFullYear()}-001`;
  const customerName = input.customerName.trim();
  const customerEmail = input.customerEmail.trim();
  const customerPhone = input.customerPhone?.trim() || null;
  const projectAddress = input.projectAddress?.trim() || null;
  const projectType = input.projectType?.trim() || 'General Tiling';
  const scopeDescription = input.scopeDescription?.trim() || null;
  const notes = input.notes?.trim() || null;

  const areaM2 = Math.max(0, input.areaM2 ?? 0);
  const wastagePercent = Math.max(0, input.wastagePercent ?? 10);
  const tileLengthMm = Math.max(1, input.tileLengthMm ?? 600);
  const tileWidthMm = Math.max(1, input.tileWidthMm ?? 600);
  const tileThicknessMm = Math.max(1, input.tileThicknessMm ?? 10);
  const groutJointMm = Math.max(0.5, input.groutJointMm ?? 2);
  const trowelSizeMm = Math.max(4, input.trowelSizeMm ?? 10);
  const isWetArea = Boolean(input.isWetArea);
  const proposalTone: ProposalTone = input.proposalTone || 'confident';

  // 1. Run Tile Calculator Engine
  const trowelNotch = resolveTrowelNotch(trowelSizeMm);
  const internalPerimeter = isWetArea && areaM2 > 0 ? round(Math.sqrt(areaM2) * 4) : 0;

  const tileCalc = calculateTileProject({
    area: {
      netArea: areaM2,
      customWastagePercent: wastagePercent,
    },
    tile: {
      lengthMm: tileLengthMm,
      widthMm: tileWidthMm,
      thicknessMm: tileThicknessMm,
    },
    adhesive: {
      trowelNotch,
    },
    grout: {
      jointWidthMm: groutJointMm,
      thicknessMm: tileThicknessMm,
    },
    waterproofing: {
      enabled: isWetArea,
      waterproofingAreaM2: isWetArea ? areaM2 : 0,
      internalPerimeterLinearM: internalPerimeter,
    },
    silicone: {
      internalPerimeterLinearM: internalPerimeter,
    },
    levelling: {
      enabled: tileLengthMm >= 300 || tileWidthMm >= 300,
    },
  });

  // Extract auto-calculated material metrics
  const tilesNeededM2 = tileCalc.tiles.totalAreaSuppliedM2;
  const tilesBoxCount = tileCalc.tiles.boxesRequired;
  const adhesiveBags = tileCalc.adhesive.bagsRequired;
  const groutKg = tileCalc.grout.totalKg;
  const siliconeTubes = tileCalc.silicone?.tubesRequired ?? 0;
  const waterproofingLitres = tileCalc.waterproofing?.membraneLitres ?? 0;
  const primerLitres = tileCalc.waterproofing?.primerLitres ?? 0;
  const clipsCount = tileCalc.levelling?.totalClipsRequired ?? 0;

  // 2. Resolve Items & Costs
  let processedItems: Array<{
    name: string;
    category: string;
    quantity: number;
    unit: string;
    unitCost: number;
    unitPrice: number;
    totalCost: number;
    totalPrice: number;
    notes?: string | null;
  }> = [];

  const labourDays = Math.max(0, input.labourDays ?? 0);
  const labourDayRate = Math.max(0, input.labourDayRate ?? 650);

  if (input.items && input.items.length > 0) {
    processedItems = input.items.map((item) => {
      const quantity = Math.max(0, item.quantity ?? 1);
      const unitCost = Math.max(0, item.unitCost ?? 0);
      const unitPrice = Math.max(0, item.unitPrice ?? 0);
      const totalCost = item.totalCost !== undefined ? Math.max(0, item.totalCost) : round(quantity * unitCost);
      const totalPrice = item.totalPrice !== undefined ? Math.max(0, item.totalPrice) : round(quantity * unitPrice);

      return {
        name: item.name.trim(),
        category: (item.category || 'MATERIAL').toUpperCase().trim(),
        quantity,
        unit: item.unit.trim(),
        unitCost,
        unitPrice,
        totalCost,
        totalPrice,
        notes: item.notes?.trim() || null,
      };
    });
  } else {
    processedItems = bomToQuoteItems(tileCalc.billOfMaterials, labourDays, labourDayRate, areaM2);
  }

  // Calculate Materials & Labour costs
  let materialCost = 0;
  let computedLabourCost = 0;
  let itemsTotalPriceSum = 0;

  for (const it of processedItems) {
    if (it.category === 'LABOUR') {
      computedLabourCost += it.totalCost;
    } else {
      materialCost += it.totalCost;
    }
    itemsTotalPriceSum += it.totalPrice;
  }

  if (input.materialCost !== undefined && input.materialCost >= 0) {
    materialCost = round(input.materialCost);
  } else {
    materialCost = round(materialCost);
  }

  let labourCost = 0;
  if (labourDays > 0 && labourDayRate > 0) {
    labourCost = round(labourDays * labourDayRate);
  } else if (computedLabourCost > 0) {
    labourCost = round(computedLabourCost);
  }

  const otherCost = round(Math.max(0, input.otherCost ?? 0));
  const totalCost = round(materialCost + labourCost + otherCost);

  // 3. Determine Quoted Price Ex GST
  let quotedPriceExGst: number | undefined;

  if (input.subtotalExGst !== undefined && input.subtotalExGst > 0) {
    quotedPriceExGst = round(input.subtotalExGst);
  } else if (input.markupPercent !== undefined && input.markupPercent >= 0) {
    quotedPriceExGst = round(totalCost * (1 + input.markupPercent / 100));
  } else if (input.profitMarginPercent !== undefined && input.profitMarginPercent > 0) {
    // Handled by target margin percentage in calculateFinancialSummary
    quotedPriceExGst = undefined;
  } else if (itemsTotalPriceSum > 0) {
    quotedPriceExGst = round(itemsTotalPriceSum);
  }

  // 4. Run Financial Calculator
  const finSummary = calculateFinancialSummary({
    costs: {
      materialCost,
      labourDays,
      labourDayRate,
      labourCost,
      otherDirectCosts: otherCost,
    },
    quotedPriceExGst,
    targetMarginPercentage: input.profitMarginPercent ?? (quotedPriceExGst ? undefined : 30),
  });

  const resolvedSubtotalExGst = finSummary.pricing.subtotalExGst;
  const resolvedGstAmount = finSummary.pricing.gstAmount;
  const resolvedTotalIncGst = finSummary.pricing.totalIncGst;
  const resolvedGrossProfit = finSummary.grossProfit;
  const resolvedProfitMarginPercent = finSummary.profitMarginPercentage;
  const resolvedMarkupPercent = finSummary.markupPercentage;

  // 5. Build Proposal Line Items and Text
  const proposalLineItems: ProposalLineItem[] = processedItems.map((item) => {
    let cat: ProposalLineItem['category'] = 'other';
    const c = item.category.toLowerCase();
    if (c.includes('waterproof')) cat = 'waterproofing';
    else if (c.includes('prep')) cat = 'preparation';
    else if (c.includes('labour') || c.includes('laying')) cat = 'laying';
    else if (c.includes('grout') || c.includes('silicone')) cat = 'grouting_sealing';
    else if (c.includes('finish') || c.includes('clean')) cat = 'finishing';
    else if (c.includes('disposal') || c.includes('waste')) cat = 'disposal';
    else cat = 'supply';

    return {
      category: cat,
      description: item.name,
      quantity: item.quantity,
      unit: (item.unit as ProposalLineItem['unit']) || 'm²',
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      notes: item.notes || undefined,
    };
  });

  const proposalText = generateClientProposalText({
    proposalNumber: quoteNumber,
    tone: proposalTone,
    client: {
      name: customerName,
      email: customerEmail,
      phone: customerPhone || undefined,
      address: projectAddress || undefined,
    },
    project: {
      title: `${projectType} Installation`,
      projectType,
      description: scopeDescription || `${projectType} tiling covering approx ${areaM2} m².`,
    },
    lineItems: proposalLineItems,
    materialSpecs: {
      tileFormat: `${tileLengthMm}x${tileWidthMm}mm (${tileThicknessMm}mm thick)`,
      groutSpecification: `${groutJointMm}mm joint width, flexible antimicrobial grout`,
      movementJointsAndSealant: `Sanitary neutral-cure silicone perimeter sealing`,
    },
    pricing: {
      fixedTotal: resolvedSubtotalExGst,
      applyGst: true,
    },
  });

  const depositRequired =
    input.depositRequired !== undefined && input.depositRequired >= 0
      ? round(input.depositRequired)
      : round(resolvedTotalIncGst * 0.10);

  return {
    quoteNumber,
    customerName,
    customerEmail,
    customerPhone,
    projectAddress,
    projectType,
    scopeDescription,
    areaM2,
    wastagePercent,
    tileLengthMm,
    tileWidthMm,
    tileThicknessMm,
    groutJointMm,
    trowelSizeMm,
    isWetArea,

    tilesNeededM2,
    tilesBoxCount,
    adhesiveBags,
    groutKg,
    siliconeTubes,
    waterproofingLitres,
    primerLitres,
    clipsCount,

    materialCost,
    labourDays,
    labourDayRate,
    labourCost,
    otherCost,
    totalCost,
    markupPercent: resolvedMarkupPercent,
    profitMarginPercent: resolvedProfitMarginPercent,
    grossProfit: resolvedGrossProfit,
    subtotalExGst: resolvedSubtotalExGst,
    gstAmount: resolvedGstAmount,
    totalIncGst: resolvedTotalIncGst,

    proposalText,
    depositRequired,
    notes,

    items: processedItems,
  };
}
