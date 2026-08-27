'use client';

import React from 'react';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Percent,
  Receipt,
  PiggyBank,
  HardHat,
  Truck,
  Trash2,
  HelpCircle,
} from 'lucide-react';

export interface FinancialValues {
  materialCost: number;
  labourDays: number;
  labourDayRate: number;
  subcontractorCost: number;
  skipHireCost: number;
  equipmentHireCost: number;
  otherCost: number;
  quotedPriceExGst: number;
  markupPercent?: number;
  profitMarginPercent?: number;
}

export interface FinancialCalculationData {
  costs: {
    materialCost: number;
    labourCost: number;
    labourDays: number;
    labourDayRate: number;
    subcontractorCost: number;
    skipHireCost: number;
    equipmentHireCost: number;
    otherDirectCosts: number;
    totalDirectCost: number;
  };
  pricing: {
    subtotalExGst: number;
    gstAmount: number;
    totalIncGst: number;
    gstRate: number;
  };
  grossProfit: number;
  profitMarginPercent: number;
  markupPercent: number;
  health: {
    rating: string;
    isUnderQuoted: boolean;
    warningMessage?: string;
  };
  taxReserves: {
    totalCollectedIncGst: number;
    gstReserve: number;
    directCostCover: number;
    grossProfit: number;
    incomeTaxReserve: number;
    incomeTaxRate: number;
    realTakeHomeCash: number;
  };
  targetComparison?: {
    targetMarginPercentage: number;
    targetPriceExGst: number;
    targetPriceIncGst: number;
    differenceExGst: number;
    meetsTarget: boolean;
  };
}

export interface TargetPricingPreset {
  marginPercent: number;
  markupPercent: number;
  priceExGst: number;
  gstAmount: number;
  priceIncGst: number;
  grossProfit: number;
  takeHomeCash: number;
}

interface ProfitMarginCardProps {
  values: FinancialValues;
  onChange: (updated: Partial<FinancialValues>) => void;
  financialData?: FinancialCalculationData | null;
  targetPricingPresets?: TargetPricingPreset[];
  readOnly?: boolean;
}

export function ProfitMarginCard({
  values,
  onChange,
  financialData,
  targetPricingPresets = [],
  readOnly = false,
}: ProfitMarginCardProps) {
  // Direct calculations fallback if financialData not yet loaded
  const labourCost = values.labourDays * values.labourDayRate;
  const directCost =
    values.materialCost +
    labourCost +
    values.subcontractorCost +
    values.skipHireCost +
    values.equipmentHireCost +
    values.otherCost;

  const quotedExGst = financialData?.pricing.subtotalExGst ?? values.quotedPriceExGst;
  const grossProfit = financialData?.grossProfit ?? (quotedExGst - directCost);
  const marginPercent =
    financialData?.profitMarginPercent ??
    (quotedExGst > 0 ? Math.round((grossProfit / quotedExGst) * 100) : 0);
  const markupPercent =
    financialData?.markupPercent ??
    (directCost > 0 ? Math.round((grossProfit / directCost) * 100) : 0);
  const gstAmount = financialData?.pricing.gstAmount ?? Math.round(quotedExGst * 0.1);
  const totalIncGst = financialData?.pricing.totalIncGst ?? (quotedExGst + gstAmount);

  // Health color logic:
  // Green for >30%, Amber for 20-30%, Red for <20%
  const getMarginBadge = (margin: number) => {
    if (margin >= 30) {
      return {
        badgeClass: 'bg-emerald-950/80 text-emerald-400 border-emerald-800',
        textClass: 'text-emerald-400',
        label: 'Healthy Margin (>30%)',
      };
    }
    if (margin >= 20) {
      return {
        badgeClass: 'bg-amber-950/80 text-amber-400 border-amber-800',
        textClass: 'text-amber-400',
        label: 'Moderate (20-30%)',
      };
    }
    return {
      badgeClass: 'bg-red-950/80 text-red-400 border-red-800',
      textClass: 'text-red-400',
      label: 'Low Margin / Underquoted (<20%)',
    };
  };

  const currentHealth = getMarginBadge(marginPercent);

  // Apply quick target margin price
  const handleApplyPresetMargin = (targetMargin: number) => {
    if (directCost <= 0) return;
    const targetPriceExGst = Math.round(directCost / (1 - targetMargin / 100));
    onChange({
      quotedPriceExGst: targetPriceExGst,
      profitMarginPercent: targetMargin,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Warning Banner if under-quoted */}
      {marginPercent < 20 && quotedExGst > 0 && (
        <div className="p-4 bg-red-950/40 border border-red-800/80 rounded-2xl flex items-start gap-3 text-red-300 text-xs shadow-lg">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-red-200">
              Low Profit Margin Warning ({marginPercent}%)
            </div>
            <p className="leading-relaxed">
              This quote is below the recommended 20% trade safety threshold. Unexpected site delays,
              substrate irregularities, or tile breakages may eliminate profitability. Recommended minimum margin is 30%.
            </p>
          </div>
        </div>
      )}

      {/* Main Financial Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Direct Cost Breakdown Inputs (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-surface-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HardHat className="h-4 w-4 text-primary-400" />
                Direct Job Costs
              </h3>
              <span className="font-mono text-xs font-bold text-surface-300">
                Total Cost: <span className="text-white">${directCost.toLocaleString()}</span>
              </span>
            </div>

            {/* Material Cost Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-surface-300 flex items-center gap-1.5">
                  <Receipt className="h-3.5 w-3.5 text-primary-400" />
                  Estimated Material Cost (AUD)
                </label>
                <span className="text-[11px] text-surface-400">Adhesive, grout, trims, pails</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 font-mono text-sm">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  disabled={readOnly}
                  value={values.materialCost || ''}
                  onChange={(e) =>
                    onChange({ materialCost: Math.max(0, parseFloat(e.target.value) || 0) })
                  }
                  className="w-full pl-8 pr-4 py-2 bg-surface-950 border border-surface-700/80 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Labour Estimator: Days & Day Rate */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-surface-800/80">
              <div>
                <label className="block text-[11px] font-semibold text-surface-300 mb-1">
                  Labour Days (Est.)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  disabled={readOnly}
                  value={values.labourDays || ''}
                  onChange={(e) =>
                    onChange({ labourDays: Math.max(0, parseFloat(e.target.value) || 0) })
                  }
                  className="w-full px-3 py-2 bg-surface-950 border border-surface-700/80 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="2"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-surface-300 mb-1">
                  Trade Day Rate ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 font-mono text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    disabled={readOnly}
                    value={values.labourDayRate || ''}
                    onChange={(e) =>
                      onChange({ labourDayRate: Math.max(0, parseFloat(e.target.value) || 650) })
                    }
                    className="w-full pl-7 pr-3 py-2 bg-surface-950 border border-surface-700/80 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="650"
                  />
                </div>
              </div>
            </div>

            {/* Subcontractor & Skip Hire Costs */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-surface-800/80">
              <div>
                <label className="block text-[11px] font-semibold text-surface-300 mb-1 flex items-center gap-1">
                  <Truck className="h-3 w-3 text-surface-400" />
                  Subcontractors ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 font-mono text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    disabled={readOnly}
                    value={values.subcontractorCost || ''}
                    onChange={(e) =>
                      onChange({
                        subcontractorCost: Math.max(0, parseFloat(e.target.value) || 0),
                      })
                    }
                    className="w-full pl-7 pr-3 py-2 bg-surface-950 border border-surface-700/80 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-surface-300 mb-1 flex items-center gap-1">
                  <Trash2 className="h-3 w-3 text-surface-400" />
                  Skip Bin / Rubbish ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 font-mono text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    disabled={readOnly}
                    value={values.skipHireCost || ''}
                    onChange={(e) =>
                      onChange({ skipHireCost: Math.max(0, parseFloat(e.target.value) || 0) })
                    }
                    className="w-full pl-7 pr-3 py-2 bg-surface-950 border border-surface-700/80 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Other Direct Costs */}
            <div className="pt-2 border-t border-surface-800/80">
              <label className="block text-[11px] font-semibold text-surface-300 mb-1">
                Equipment Hire & Other Expenses ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 font-mono text-xs">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  disabled={readOnly}
                  value={values.otherCost || ''}
                  onChange={(e) =>
                    onChange({ otherCost: Math.max(0, parseFloat(e.target.value) || 0) })
                  }
                  className="w-full pl-7 pr-3 py-2 bg-surface-950 border border-surface-700/80 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Quick Target Margin Solver Buttons */}
          {!readOnly && directCost > 0 && (
            <div className="bg-surface-900 border border-surface-800 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-surface-300 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                  Target Margin Solvers
                </span>
                <span className="text-[11px] text-surface-400">Click to set price</span>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {[20, 25, 30, 35, 40].map((tgt) => {
                  const reqPrice = Math.round(directCost / (1 - tgt / 100));
                  const isMatch = Math.abs(marginPercent - tgt) < 1;
                  return (
                    <button
                      key={tgt}
                      type="button"
                      onClick={() => handleApplyPresetMargin(tgt)}
                      className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                        isMatch
                          ? 'bg-emerald-950 border-emerald-600 ring-1 ring-emerald-500 text-white font-bold'
                          : 'bg-surface-950/60 border-surface-800 hover:border-surface-700 text-surface-300 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold">{tgt}%</div>
                      <div className="text-[10px] text-surface-400 font-mono mt-0.5">
                        ${reqPrice}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Profit Margin & GST Breakdown (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-gradient-to-br from-surface-900 via-surface-900 to-surface-950 border border-surface-800 rounded-2xl p-5 space-y-5 shadow-xl">
            {/* Header with Health Badge */}
            <div className="flex items-center justify-between border-b border-surface-800 pb-3">
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Financial & Margin Breakdown</h3>
              </div>
              <span
                className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${currentHealth.badgeClass}`}
              >
                {currentHealth.label}
              </span>
            </div>

            {/* Quoted Price Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-surface-200">
                  Quoted Selling Price (Ex GST)
                </label>
                <span className="text-[11px] text-surface-400 font-mono">
                  + 10% GST = ${totalIncGst.toLocaleString()} inc GST
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 font-mono text-base font-bold">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  disabled={readOnly}
                  value={values.quotedPriceExGst || ''}
                  onChange={(e) =>
                    onChange({
                      quotedPriceExGst: Math.max(0, parseFloat(e.target.value) || 0),
                    })
                  }
                  className="w-full pl-9 pr-4 py-2.5 bg-surface-950 border border-surface-700/80 rounded-xl text-lg font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Profit & Margin Metrics Cards */}
            <div className="grid grid-cols-2 gap-3">
              {/* Gross Profit */}
              <div className="bg-surface-950/70 p-3.5 rounded-xl border border-surface-800/80">
                <span className="text-[10px] text-surface-400 uppercase font-semibold">
                  Gross Profit (AUD)
                </span>
                <div
                  className={`text-xl font-extrabold font-mono mt-1 ${
                    grossProfit >= 0 ? currentHealth.textClass : 'text-red-400'
                  }`}
                >
                  ${grossProfit.toLocaleString()}
                </div>
                <span className="text-[10px] text-surface-400 mt-0.5 block">
                  Markup: <strong className="text-surface-200 font-mono">{markupPercent}%</strong> on cost
                </span>
              </div>

              {/* Profit Margin % */}
              <div className="bg-surface-950/70 p-3.5 rounded-xl border border-surface-800/80">
                <span className="text-[10px] text-surface-400 uppercase font-semibold">
                  Profit Margin %
                </span>
                <div className={`text-xl font-extrabold font-mono mt-1 ${currentHealth.textClass}`}>
                  {marginPercent}%
                </div>
                <span className="text-[10px] text-surface-400 mt-0.5 block">
                  Trade Target: <strong className="text-emerald-400 font-mono">&ge; 30%</strong>
                </span>
              </div>
            </div>

            {/* ATO & Cash Allocation Buckets */}
            <div className="space-y-2 pt-2 border-t border-surface-800/80 text-xs">
              <span className="text-[10px] text-surface-400 uppercase font-semibold flex items-center gap-1">
                <PiggyBank className="h-3.5 w-3.5 text-primary-400" />
                ATO Tax Reserve & Take-Home Cash Allocation
              </span>

              <div className="grid grid-cols-3 gap-2 text-center">
                {/* GST Bucket */}
                <div className="p-2.5 bg-surface-950/40 rounded-xl border border-surface-800/60">
                  <span className="text-[10px] text-surface-400 block">GST Bucket (10%)</span>
                  <span className="font-mono text-xs font-bold text-amber-400 mt-0.5 block">
                    ${(financialData?.taxReserves.gstReserve ?? gstAmount).toLocaleString()}
                  </span>
                  <span className="text-[9px] text-surface-500">To ATO BAS</span>
                </div>

                {/* Direct Costs */}
                <div className="p-2.5 bg-surface-950/40 rounded-xl border border-surface-800/60">
                  <span className="text-[10px] text-surface-400 block">Suppliers / Wages</span>
                  <span className="font-mono text-xs font-bold text-surface-200 mt-0.5 block">
                    ${(financialData?.taxReserves.directCostCover ?? directCost).toLocaleString()}
                  </span>
                  <span className="text-[9px] text-surface-500">Materials & Subs</span>
                </div>

                {/* Real Take-Home Cash */}
                <div className="p-2.5 bg-emerald-950/30 rounded-xl border border-emerald-800/50">
                  <span className="text-[10px] text-emerald-400 block font-semibold">
                    Real Take-Home
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-300 mt-0.5 block">
                    $
                    {(
                      financialData?.taxReserves.realTakeHomeCash ??
                      Math.max(0, Math.round(grossProfit * 0.75))
                    ).toLocaleString()}
                  </span>
                  <span className="text-[9px] text-emerald-500/80">After 25% tax</span>
                </div>
              </div>
            </div>

            {/* Bottom GST Summary Line */}
            <div className="pt-2 border-t border-surface-800/80 flex items-center justify-between text-xs text-surface-400">
              <span className="flex items-center gap-1 text-[11px]">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Australian GST (10%) Compliant
              </span>
              <span className="font-mono font-bold text-white text-sm">
                Total Inc GST: ${totalIncGst.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
