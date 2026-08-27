/**
 * Financial & Margin Calculator for ProSquare
 * 
 * Provides end-to-end calculations for trade and construction quotes:
 * 1. Direct Cost Aggregation (Materials, Labour, Subcontractors, Skip & Equipment Hire)
 * 2. Margin % vs Markup % conversions and metrics
 * 3. Target Price Solver for desired profit margins
 * 4. Australian GST (10%) handler (ex GST, GST amount, inc GST)
 * 5. Tax Reserve Breakdown (GST bucket, Estimated Income Tax, Real Take-Home Cash)
 * 6. Under-quoting detection and Margin Health Ratings
 */

export const DEFAULT_GST_RATE = 10; // 10% Australian GST
export const DEFAULT_INCOME_TAX_RATE = 25; // 25% default estimated income tax reserve on profit

/**
 * Standard monetary rounding helper (rounds to 2 decimal places with epsilon precision)
 */
export const round = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

// ==========================================
// 1. Direct Cost Interfaces & Aggregation
// ==========================================

export interface CostBreakdown {
  /** Cost of raw materials and supplies */
  materialCost: number;
  /** Total labour duration in days (optional if labourCost is provided directly) */
  labourDays?: number;
  /** Rate charged/costed per labour day (optional if labourCost is provided directly) */
  labourDayRate?: number;
  /** Explicit labour cost; if omitted or zero, computed as labourDays * labourDayRate */
  labourCost?: number;
  /** Subcontractor fees and specialist trades */
  subcontractorCost?: number;
  /** Skip bin hire and site waste disposal */
  skipHireCost?: number;
  /** Equipment, plant, or tool hire */
  equipmentHireCost?: number;
  /** Any other direct job expenses */
  otherDirectCosts?: number;
}

export interface DirectCostSummary {
  materialCost: number;
  labourCost: number;
  labourDays: number;
  labourDayRate: number;
  subcontractorCost: number;
  skipHireCost: number;
  equipmentHireCost: number;
  otherDirectCosts: number;
  totalDirectCost: number;
}

/**
 * Aggregates all direct job costs into structured summary categories.
 */
export const aggregateDirectCosts = (costs: CostBreakdown): DirectCostSummary => {
  const materialCost = round(Math.max(0, costs.materialCost || 0));
  const labourDays = Math.max(0, costs.labourDays || 0);
  const labourDayRate = Math.max(0, costs.labourDayRate || 0);
  
  let labourCost = 0;
  if (costs.labourCost !== undefined && costs.labourCost > 0) {
    labourCost = round(costs.labourCost);
  } else if (labourDays > 0 && labourDayRate > 0) {
    labourCost = round(labourDays * labourDayRate);
  }

  const subcontractorCost = round(Math.max(0, costs.subcontractorCost || 0));
  const skipHireCost = round(Math.max(0, costs.skipHireCost || 0));
  const equipmentHireCost = round(Math.max(0, costs.equipmentHireCost || 0));
  const otherDirectCosts = round(Math.max(0, costs.otherDirectCosts || 0));

  const totalDirectCost = round(
    materialCost +
    labourCost +
    subcontractorCost +
    skipHireCost +
    equipmentHireCost +
    otherDirectCosts
  );

  return {
    materialCost,
    labourCost,
    labourDays,
    labourDayRate,
    subcontractorCost,
    skipHireCost,
    equipmentHireCost,
    otherDirectCosts,
    totalDirectCost,
  };
};

// ==========================================
// 2. Margin % & Markup % Calculation & Conversions
// ==========================================

/**
 * Gross Profit = Quoted Price (ex GST) - Total Cost
 */
export const calculateGrossProfit = (
  quotedPriceExGst: number,
  totalCost: number
): number => round(quotedPriceExGst - totalCost);

/**
 * Profit Margin % = (Gross Profit / Quoted Price) * 100
 */
export const calculateProfitMarginPercentage = (
  grossProfit: number,
  quotedPriceExGst: number
): number => {
  if (quotedPriceExGst <= 0) return 0;
  return round((grossProfit / quotedPriceExGst) * 100);
};

/**
 * Markup % = (Gross Profit / Total Cost) * 100
 */
export const calculateMarkupPercentage = (
  grossProfit: number,
  totalCost: number
): number => {
  if (totalCost <= 0) return 0;
  return round((grossProfit / totalCost) * 100);
};

/**
 * Converts a Profit Margin % to its equivalent Markup %
 * Formula: Markup = Margin / (1 - Margin/100)
 */
export const marginToMarkupPercentage = (marginPercentage: number): number => {
  const denominator = 100 - marginPercentage;
  if (denominator <= 0) return 0;
  return round((marginPercentage / denominator) * 100);
};

/**
 * Converts a Markup % to its equivalent Profit Margin %
 * Formula: Margin = Markup / (1 + Markup/100)
 */
export const markupToMarginPercentage = (markupPercentage: number): number => {
  const denominator = 100 + markupPercentage;
  if (denominator <= 0) return 0;
  return round((markupPercentage / denominator) * 100);
};

// ==========================================
// 3. Australian GST (10%) Handlers
// ==========================================

export interface GstBreakdown {
  subtotalExGst: number;
  gstAmount: number;
  totalIncGst: number;
  gstRate: number;
}

/**
 * Calculates GST amount and total (inc GST) from an ex-GST subtotal.
 */
export const calculateGst = (
  subtotalExGst: number,
  gstRate: number = DEFAULT_GST_RATE
): GstBreakdown => {
  const subtotal = round(subtotalExGst);
  const gstAmount = round(subtotal * (gstRate / 100));
  const totalIncGst = round(subtotal + gstAmount);

  return {
    subtotalExGst: subtotal,
    gstAmount,
    totalIncGst,
    gstRate,
  };
};

/**
 * Extracts ex-GST amount and GST component from an inclusive total.
 */
export const extractGstFromTotal = (
  totalIncGst: number,
  gstRate: number = DEFAULT_GST_RATE
): GstBreakdown => {
  const total = round(totalIncGst);
  const subtotalExGst = round(total / (1 + gstRate / 100));
  const gstAmount = round(total - subtotalExGst);

  return {
    subtotalExGst,
    gstAmount,
    totalIncGst: total,
    gstRate,
  };
};

// ==========================================
// 4. Tax Reserve Breakdown
// ==========================================

export interface TaxReserveOptions {
  quotedPriceExGst: number;
  totalCost: number;
  gstRate?: number;
  incomeTaxRate?: number;
}

export interface TaxReserveBreakdown {
  /** Total revenue collected from client inclusive of GST */
  totalCollectedIncGst: number;
  /** GST bucket (10%) to set aside for the ATO BAS */
  gstReserve: number;
  /** Cost buffer to cover direct suppliers, labour, and contractors */
  directCostCover: number;
  /** Gross profit before income tax */
  grossProfit: number;
  /** Income tax set-aside (e.g. 25% of net profit before personal tax) */
  incomeTaxReserve: number;
  /** Configured income tax rate % */
  incomeTaxRate: number;
  /** Real take-home profit after direct costs, GST, and estimated income tax */
  realTakeHomeCash: number;
}

/**
 * Breaks down revenue into distinct cash buckets:
 * - GST Reserve (ATO)
 * - Direct Cost Cover (Suppliers/Trades)
 * - Income Tax Reserve (ATO Income Tax)
 * - Real Take-Home Cash (Owner pocket)
 */
export const calculateTaxReserves = ({
  quotedPriceExGst,
  totalCost,
  gstRate = DEFAULT_GST_RATE,
  incomeTaxRate = DEFAULT_INCOME_TAX_RATE,
}: TaxReserveOptions): TaxReserveBreakdown => {
  const priceExGst = round(quotedPriceExGst);
  const cost = round(totalCost);
  const gstData = calculateGst(priceExGst, gstRate);
  const grossProfit = calculateGrossProfit(priceExGst, cost);

  // Income tax is only reserved on positive profit
  const incomeTaxReserve = grossProfit > 0
    ? round(grossProfit * (incomeTaxRate / 100))
    : 0;

  const realTakeHomeCash = round(grossProfit - incomeTaxReserve);

  return {
    totalCollectedIncGst: gstData.totalIncGst,
    gstReserve: gstData.gstAmount,
    directCostCover: cost,
    grossProfit,
    incomeTaxReserve,
    incomeTaxRate,
    realTakeHomeCash,
  };
};

// ==========================================
// 5. Margin Health & Under-Quoting Detection
// ==========================================

export type MarginHealthRating =
  | 'Loss'
  | 'Low Margin (<20%)'
  | 'Healthy (20-35%)'
  | 'Strong (>35%)';

export interface HealthAssessment {
  rating: MarginHealthRating;
  isUnderQuoted: boolean;
  warningMessage?: string;
}

/**
 * Determines the health rating category of a quote's profit margin.
 */
export const getMarginHealthRating = (
  marginPercentage: number,
  grossProfit: number
): MarginHealthRating => {
  if (grossProfit < 0 || marginPercentage < 0) {
    return 'Loss';
  }
  if (marginPercentage < 20) {
    return 'Low Margin (<20%)';
  }
  if (marginPercentage <= 35) {
    return 'Healthy (20-35%)';
  }
  return 'Strong (>35%)';
};

/**
 * Assesses overall quote health and generates actionable under-quoting warnings.
 */
export const assessQuoteHealth = (
  marginPercentage: number,
  grossProfit: number,
  targetMarginPercentage?: number
): HealthAssessment => {
  const rating = getMarginHealthRating(marginPercentage, grossProfit);

  let isUnderQuoted = false;
  let warningMessage: string | undefined;

  if (rating === 'Loss') {
    isUnderQuoted = true;
    warningMessage =
      'CRITICAL: This quote operates at a loss. Quoted price is lower than direct job costs.';
  } else if (rating === 'Low Margin (<20%)') {
    isUnderQuoted = true;
    warningMessage =
      'WARNING: Margin is below the 20% safe trade threshold. High vulnerability to unexpected job delays, call-backs, or material price spikes.';
  } else if (targetMarginPercentage !== undefined && marginPercentage < targetMarginPercentage) {
    isUnderQuoted = true;
    warningMessage = `CAUTION: Margin of ${marginPercentage}% is below your target goal of ${targetMarginPercentage}%.`;
  }

  return {
    rating,
    isUnderQuoted,
    warningMessage,
  };
};

// ==========================================
// 6. Target Price Solver
// ==========================================

export interface TargetPricingOptions {
  totalDirectCost: number;
  targetMarginPercentage: number;
  gstRate?: number;
  incomeTaxRate?: number;
}

export interface TargetPricingResult {
  totalDirectCost: number;
  targetMarginPercentage: number;
  targetMarkupPercentage: number;
  requiredPriceExGst: number;
  gstAmount: number;
  requiredPriceIncGst: number;
  expectedGrossProfit: number;
  taxReserves: TaxReserveBreakdown;
  health: HealthAssessment;
}

/**
 * Solves for the exact selling price needed to achieve a target profit margin %.
 * Formula: Required Price (ex GST) = Total Direct Cost / (1 - Target Margin % / 100)
 */
export const solveTargetPrice = ({
  totalDirectCost,
  targetMarginPercentage,
  gstRate = DEFAULT_GST_RATE,
  incomeTaxRate = DEFAULT_INCOME_TAX_RATE,
}: TargetPricingOptions): TargetPricingResult => {
  const cost = round(Math.max(0, totalDirectCost));
  const targetMargin = Math.min(99.99, Math.max(0, targetMarginPercentage));
  const denominator = 1 - targetMargin / 100;

  if (denominator <= 0 || cost <= 0) {
    const defaultGst = calculateGst(0, gstRate);
    const defaultReserves = calculateTaxReserves({
      quotedPriceExGst: 0,
      totalCost: cost,
      gstRate,
      incomeTaxRate,
    });
    return {
      totalDirectCost: cost,
      targetMarginPercentage: targetMargin,
      targetMarkupPercentage: 0,
      requiredPriceExGst: 0,
      gstAmount: 0,
      requiredPriceIncGst: 0,
      expectedGrossProfit: round(-cost),
      taxReserves: defaultReserves,
      health: assessQuoteHealth(0, -cost, targetMargin),
    };
  }

  const requiredPriceExGst = round(cost / denominator);
  const gstBreakdown = calculateGst(requiredPriceExGst, gstRate);
  const expectedGrossProfit = calculateGrossProfit(requiredPriceExGst, cost);
  const targetMarkupPercentage = calculateMarkupPercentage(expectedGrossProfit, cost);
  const taxReserves = calculateTaxReserves({
    quotedPriceExGst: requiredPriceExGst,
    totalCost: cost,
    gstRate,
    incomeTaxRate,
  });
  const health = assessQuoteHealth(targetMargin, expectedGrossProfit, targetMargin);

  return {
    totalDirectCost: cost,
    targetMarginPercentage: targetMargin,
    targetMarkupPercentage,
    requiredPriceExGst,
    gstAmount: gstBreakdown.gstAmount,
    requiredPriceIncGst: gstBreakdown.totalIncGst,
    expectedGrossProfit,
    taxReserves,
    health,
  };
};

// ==========================================
// 7. Full Financial Summary Calculator
// ==========================================

export interface FinancialQuoteInput {
  /** Either an aggregated CostBreakdown object or a single number representing total direct cost */
  costs: CostBreakdown | number;
  /** Quoted price excluding GST (provide either this or quotedPriceIncGst) */
  quotedPriceExGst?: number;
  /** Quoted price including GST (used if quotedPriceExGst is omitted) */
  quotedPriceIncGst?: number;
  /** Optional target profit margin percentage for benchmarking */
  targetMarginPercentage?: number;
  /** Australian GST rate (defaults to 10%) */
  gstRate?: number;
  /** Estimated income tax set-aside rate % (defaults to 25%) */
  incomeTaxRate?: number;
}

export interface TargetComparison {
  targetMarginPercentage: number;
  targetPriceExGst: number;
  targetPriceIncGst: number;
  differenceExGst: number;
  meetsTarget: boolean;
}

export interface FinancialSummary {
  /** Itemized breakdown and total of direct costs */
  costs: DirectCostSummary;
  /** Quoted price and Australian GST breakdown */
  pricing: GstBreakdown;
  /** Gross profit = Quoted Price (ex GST) - Total Cost */
  grossProfit: number;
  /** Profit margin % = (Gross Profit / Quoted Price ex GST) * 100 */
  profitMarginPercentage: number;
  /** Markup % = (Gross Profit / Total Cost) * 100 */
  markupPercentage: number;
  /** Health rating and under-quoting checks */
  health: HealthAssessment;
  /** ATO GST, Income tax set-asides, and real take-home cash */
  taxReserves: TaxReserveBreakdown;
  /** Optional comparison against a target profit margin */
  targetComparison?: TargetComparison;
}

/**
 * Calculates complete financial metrics, health scores, and tax breakdowns for a job quote.
 */
export const calculateFinancialSummary = (
  input: FinancialQuoteInput
): FinancialSummary => {
  const gstRate = input.gstRate ?? DEFAULT_GST_RATE;
  const incomeTaxRate = input.incomeTaxRate ?? DEFAULT_INCOME_TAX_RATE;

  // 1. Direct Costs
  const directCostSummary =
    typeof input.costs === 'number'
      ? {
          materialCost: 0,
          labourCost: 0,
          labourDays: 0,
          labourDayRate: 0,
          subcontractorCost: 0,
          skipHireCost: 0,
          equipmentHireCost: 0,
          otherDirectCosts: 0,
          totalDirectCost: round(Math.max(0, input.costs)),
        }
      : aggregateDirectCosts(input.costs);

  const totalCost = directCostSummary.totalDirectCost;

  // 2. Pricing & GST
  let pricing: GstBreakdown;
  if (input.quotedPriceExGst !== undefined) {
    pricing = calculateGst(input.quotedPriceExGst, gstRate);
  } else if (input.quotedPriceIncGst !== undefined) {
    pricing = extractGstFromTotal(input.quotedPriceIncGst, gstRate);
  } else if (input.targetMarginPercentage !== undefined) {
    // If no quote price provided, derive from target margin solver
    const solved = solveTargetPrice({
      totalDirectCost: totalCost,
      targetMarginPercentage: input.targetMarginPercentage,
      gstRate,
      incomeTaxRate,
    });
    pricing = {
      subtotalExGst: solved.requiredPriceExGst,
      gstAmount: solved.gstAmount,
      totalIncGst: solved.requiredPriceIncGst,
      gstRate,
    };
  } else {
    pricing = calculateGst(0, gstRate);
  }

  // 3. Profit, Margin & Markup
  const grossProfit = calculateGrossProfit(pricing.subtotalExGst, totalCost);
  const profitMarginPercentage = calculateProfitMarginPercentage(grossProfit, pricing.subtotalExGst);
  const markupPercentage = calculateMarkupPercentage(grossProfit, totalCost);

  // 4. Health & Warnings
  const health = assessQuoteHealth(
    profitMarginPercentage,
    grossProfit,
    input.targetMarginPercentage
  );

  // 5. Tax Reserves
  const taxReserves = calculateTaxReserves({
    quotedPriceExGst: pricing.subtotalExGst,
    totalCost,
    gstRate,
    incomeTaxRate,
  });

  // 6. Optional Target Comparison
  let targetComparison: TargetComparison | undefined;
  if (input.targetMarginPercentage !== undefined) {
    const solved = solveTargetPrice({
      totalDirectCost: totalCost,
      targetMarginPercentage: input.targetMarginPercentage,
      gstRate,
      incomeTaxRate,
    });
    const differenceExGst = round(pricing.subtotalExGst - solved.requiredPriceExGst);
    targetComparison = {
      targetMarginPercentage: input.targetMarginPercentage,
      targetPriceExGst: solved.requiredPriceExGst,
      targetPriceIncGst: solved.requiredPriceIncGst,
      differenceExGst,
      meetsTarget: differenceExGst >= 0,
    };
  }

  return {
    costs: directCostSummary,
    pricing,
    grossProfit,
    profitMarginPercentage,
    markupPercentage,
    health,
    taxReserves,
    targetComparison,
  };
};
