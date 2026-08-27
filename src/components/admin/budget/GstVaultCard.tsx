'use client';

import React from 'react';
import { Landmark, ShieldAlert, CheckCircle2, ArrowDownRight, ArrowUpRight, HelpCircle } from 'lucide-react';
import { GstVaultSummary } from './types';

interface GstVaultCardProps {
  gstVault: GstVaultSummary;
}

export function GstVaultCard({ gstVault }: GstVaultCardProps) {
  const { gstCollected, gstPaid, netGstOwed } = gstVault;
  const isLiability = netGstOwed >= 0;
  const collectedSafe = Math.max(0, gstCollected);
  const paidRatio = collectedSafe > 0 ? Math.min(100, (gstPaid / collectedSafe) * 100) : 0;

  // Determine current Australian Financial Quarter
  const currentMonth = new Date().getMonth(); // 0 to 11
  let currentQuarter = 'Q3 (Jan - Mar)';
  let dueDate = '28 Apr';
  if (currentMonth >= 6 && currentMonth <= 8) {
    currentQuarter = 'Q1 (Jul - Sep)';
    dueDate = '28 Oct';
  } else if (currentMonth >= 9 && currentMonth <= 11) {
    currentQuarter = 'Q2 (Oct - Dec)';
    dueDate = '28 Feb';
  } else if (currentMonth >= 0 && currentMonth <= 2) {
    currentQuarter = 'Q3 (Jan - Mar)';
    dueDate = '28 Apr';
  } else {
    currentQuarter = 'Q4 (Apr - Jun)';
    dueDate = '28 Jul';
  }

  return (
    <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 relative overflow-hidden shadow-lg transition-all hover:border-surface-700">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl -z-0 pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-800/60 text-amber-400 shadow-sm">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">GST Vault (BAS)</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-950 text-amber-300 border border-amber-800/80">
                ATO Quarantined
              </span>
            </div>
            <p className="text-xs text-surface-400 mt-0.5">
              10% GST collected vs input credits paid
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-surface-400 font-medium block">Current Cycle</span>
          <span className="text-xs font-semibold text-amber-400 bg-surface-950 px-2 py-0.5 rounded-md border border-surface-800 inline-block mt-0.5">
            {currentQuarter}
          </span>
        </div>
      </div>

      {/* Primary Net GST Owed Hero Metric */}
      <div className="bg-surface-950/80 border border-surface-800/80 rounded-xl p-4 mb-5 relative z-10">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-medium text-surface-400 uppercase tracking-wider">
            {isLiability ? 'Net GST Payable to ATO' : 'Estimated ATO GST Refund'}
          </span>
          <span className="text-[11px] text-surface-500 font-mono">
            BAS Due: {dueDate}
          </span>
        </div>
        <div className="flex items-baseline gap-2 mt-1.5">
          <span
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isLiability ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            ${Math.abs(netGstOwed).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-surface-400 font-medium">
            {isLiability ? 'quarantined for ATO' : 'refundable credit'}
          </span>
        </div>

        {/* Visual Bar: Collected vs Paid credits */}
        <div className="mt-3.5 space-y-1.5">
          <div className="flex justify-between text-[11px] text-surface-400 font-medium">
            <span>Input Credit Offset</span>
            <span className="font-mono text-surface-300">{paidRatio.toFixed(0)}% claimable</span>
          </div>
          <div className="h-2 w-full bg-surface-800 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${paidRatio}%` }}
              title={`GST Paid on materials/tools: $${gstPaid.toFixed(2)}`}
            />
            <div
              className="h-full bg-amber-500 transition-all duration-500"
              style={{ width: `${100 - paidRatio}%` }}
              title={`Net GST Owed to ATO: $${Math.max(0, netGstOwed).toFixed(2)}`}
            />
          </div>
        </div>
      </div>

      {/* Detailed Two-Column Breakdown */}
      <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
        {/* GST Collected */}
        <div className="bg-surface-950/50 border border-surface-800 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-surface-400 mb-1">
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
            <span>GST Collected</span>
          </div>
          <p className="text-lg font-bold text-white font-mono">
            ${gstCollected.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-surface-500 block mt-0.5">
            From client invoices
          </span>
        </div>

        {/* GST Paid */}
        <div className="bg-surface-950/50 border border-surface-800 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-surface-400 mb-1">
            <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" />
            <span>GST Paid (Credits)</span>
          </div>
          <p className="text-lg font-bold text-white font-mono">
            ${gstPaid.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-surface-500 block mt-0.5">
            Materials, fuel & tools
          </span>
        </div>
      </div>

      {/* Advisory Note */}
      <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-200/90 relative z-10">
        <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-amber-300">Keep This Money In A Sub-Account</p>
          <p className="text-surface-400 text-[11px] leading-relaxed">
            GST collected on customer invoices is not your income—it belongs to the ATO. Transfer this net amount to your business tax vault weekly.
          </p>
        </div>
      </div>
    </div>
  );
}
