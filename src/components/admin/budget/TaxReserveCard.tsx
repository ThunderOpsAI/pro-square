'use client';

import React from 'react';
import { PiggyBank, Wallet, Sparkles, TrendingUp, AlertCircle, Percent } from 'lucide-react';
import { TaxReserveSummary } from './types';

interface TaxReserveCardProps {
  taxReserve: TaxReserveSummary;
  netOperatingProfit: number;
  trueTakeHomeCash: number;
  netGstOwed: number;
}

export function TaxReserveCard({
  taxReserve,
  netOperatingProfit,
  trueTakeHomeCash,
  netGstOwed,
}: TaxReserveCardProps) {
  const { recommendedRate, amount: taxAmount } = taxReserve;
  const isPositiveProfit = netOperatingProfit > 0;
  const isHealthyCash = trueTakeHomeCash > 0;

  return (
    <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 relative overflow-hidden shadow-lg transition-all hover:border-surface-700">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/5 rounded-full blur-3xl -z-0 pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-800/60 text-blue-400 shadow-sm">
            <PiggyBank className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">Tax Reserve & Net Drawings</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-blue-950 text-blue-300 border border-blue-800/80">
                {recommendedRate}% Target
              </span>
            </div>
            <p className="text-xs text-surface-400 mt-0.5">
              Income tax buffer on net operating profit
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-surface-400 font-medium block">Reserve Rate</span>
          <span className="text-xs font-semibold text-blue-400 bg-surface-950 px-2 py-0.5 rounded-md border border-surface-800 inline-block mt-0.5">
            {recommendedRate}% of Profit
          </span>
        </div>
      </div>

      {/* Hero: Recommended Income Tax Buffer */}
      <div className="bg-surface-950/80 border border-surface-800/80 rounded-xl p-4 mb-5 relative z-10">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-medium text-surface-400 uppercase tracking-wider">
            Estimated Income Tax Reserve ({recommendedRate}%)
          </span>
          <span className="text-[11px] text-surface-500 font-mono">
            {isPositiveProfit ? 'EOFY Provision' : 'Nil Profit'}
          </span>
        </div>
        <div className="flex items-baseline gap-2 mt-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-blue-400 tracking-tight font-mono">
            ${taxAmount.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-surface-400 font-medium">
            set aside from ${netOperatingProfit > 0 ? netOperatingProfit.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'} profit
          </span>
        </div>

        {/* Breakdown Flow Pill */}
        <div className="mt-4 pt-3 border-t border-surface-800/80 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-surface-900/60 p-2 rounded-lg border border-surface-800">
            <span className="text-[10px] text-surface-400 uppercase block font-semibold">Net Profit</span>
            <span className="text-xs font-bold text-white font-mono">
              ${netOperatingProfit.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="bg-surface-900/60 p-2 rounded-lg border border-surface-800">
            <span className="text-[10px] text-amber-400/90 uppercase block font-semibold">- GST & Tax</span>
            <span className="text-xs font-bold text-amber-300 font-mono">
              -${(taxAmount + Math.max(0, netGstOwed)).toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="bg-surface-900/60 p-2 rounded-lg border border-surface-800">
            <span className="text-[10px] text-emerald-400/90 uppercase block font-semibold">= Safe Cash</span>
            <span className={`text-xs font-bold font-mono ${isHealthyCash ? 'text-emerald-400' : 'text-rose-400'}`}>
              ${trueTakeHomeCash.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>

      {/* Key Metric: Safe Take-Home Drawing Capacity */}
      <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-3.5 mb-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-900/40 border border-emerald-800/50 text-emerald-400">
            <Wallet className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-emerald-300 block">Safe Owner Drawing Capacity</span>
            <span className="text-[11px] text-surface-400">
              Profit after all GST & Tax obligations are fully covered
            </span>
          </div>
        </div>
        <span
          className={`text-lg font-black font-mono tracking-tight ${
            isHealthyCash ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          ${trueTakeHomeCash.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      {/* Advisory Note */}
      <div className="bg-blue-950/20 border border-blue-900/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-blue-200/90 relative z-10">
        <Sparkles className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-blue-300">Tiler Wealth Rule #1: Pay Yourself Safe</p>
          <p className="text-surface-400 text-[11px] leading-relaxed">
            Never draw more than your &quot;Safe Cash in Pocket&quot;. Transfer 25% of net job profit into a high-interest tax buffer account on every invoice paid.
          </p>
        </div>
      </div>
    </div>
  );
}
