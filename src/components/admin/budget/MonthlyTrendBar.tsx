'use client';

import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Calendar, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { MonthlyTrendData } from './types';

interface MonthlyTrendBarProps {
  data: MonthlyTrendData[];
  year: number;
}

export function MonthlyTrendBar({ data, year }: MonthlyTrendBarProps) {
  const [hoveredMonth, setHoveredMonth] = useState<MonthlyTrendData | null>(null);

  // Compute maximum value for bar height scaling
  const maxMonthlyVal = Math.max(
    ...data.map((m) => Math.max(m.income, m.expenses)),
    1000 // minimum scale baseline
  );

  // Annual Totals
  const totalAnnualIncome = data.reduce((acc, m) => acc + m.income, 0);
  const totalAnnualExpenses = data.reduce((acc, m) => acc + m.expenses, 0);
  const netAnnualProfit = totalAnnualIncome - totalAnnualExpenses;

  // Best revenue month
  const bestMonth = [...data].sort((a, b) => b.income - a.income)[0];
  const activeMonthsCount = data.filter((m) => m.income > 0 || m.expenses > 0).length || 1;
  const avgMonthlyIncome = totalAnnualIncome / activeMonthsCount;

  return (
    <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 relative overflow-hidden shadow-lg transition-all hover:border-surface-700">
      {/* Background Accent */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl -z-0 pointer-events-none" />

      {/* Header & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white shadow-sm">
            <BarChart3 className="h-5 w-5 text-primary-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                12-Month Income vs Expense Trend
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-surface-800 text-surface-300 border border-surface-700">
                {year} Calendar Year
              </span>
            </div>
            <p className="text-xs text-surface-400 mt-0.5">
              Monthly cash flow comparison and profitability curve
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-emerald-500 inline-block shadow-sm shadow-emerald-500/20" />
            <span className="text-surface-300 font-medium">Income ($)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-rose-500 inline-block shadow-sm shadow-rose-500/20" />
            <span className="text-surface-300 font-medium">Expenses ($)</span>
          </div>
        </div>
      </div>

      {/* Top Annual Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 relative z-10">
        <div className="bg-surface-950/60 border border-surface-800/80 rounded-xl p-3">
          <span className="text-[11px] text-surface-400 font-medium block">Total Invoiced</span>
          <span className="text-base font-extrabold text-emerald-400 font-mono mt-0.5 block">
            ${totalAnnualIncome.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </div>

        <div className="bg-surface-950/60 border border-surface-800/80 rounded-xl p-3">
          <span className="text-[11px] text-surface-400 font-medium block">Total Expenses</span>
          <span className="text-base font-extrabold text-rose-400 font-mono mt-0.5 block">
            ${totalAnnualExpenses.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </div>

        <div className="bg-surface-950/60 border border-surface-800/80 rounded-xl p-3">
          <span className="text-[11px] text-surface-400 font-medium block">Net Operating Profit</span>
          <span
            className={`text-base font-extrabold font-mono mt-0.5 block ${
              netAnnualProfit >= 0 ? 'text-white' : 'text-rose-400'
            }`}
          >
            ${netAnnualProfit.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </div>

        <div className="bg-surface-950/60 border border-surface-800/80 rounded-xl p-3">
          <span className="text-[11px] text-surface-400 font-medium block">Peak Month</span>
          <span className="text-base font-extrabold text-primary-400 font-mono mt-0.5 block truncate">
            {bestMonth && bestMonth.income > 0 ? `${bestMonth.monthName} ($${(bestMonth.income / 1000).toFixed(1)}k)` : 'N/A'}
          </span>
        </div>
      </div>

      {/* Visual Chart Area */}
      <div className="relative z-10 pt-4 pb-2">
        {/* Hovered Month Tooltip Card */}
        <div className="min-h-[44px] mb-3 flex items-center justify-center">
          {hoveredMonth ? (
            <div className="bg-surface-950 border border-surface-700/80 px-4 py-2 rounded-xl shadow-xl flex items-center gap-4 text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="font-bold text-white flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-primary-400" />
                <span>{hoveredMonth.monthName} {year}</span>
              </div>
              <div className="h-3 w-px bg-surface-700" />
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-medium">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>Income: ${hoveredMonth.income.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-400 font-mono font-medium">
                <ArrowDownRight className="h-3.5 w-3.5" />
                <span>Expenses: ${hoveredMonth.expenses.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center gap-1.5 text-white font-mono font-semibold">
                <span>Net: ${hoveredMonth.netProfit.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          ) : (
            <span className="text-xs text-surface-500 italic">
              Hover over any month bar to inspect exact revenue, expenses, and net profit
            </span>
          )}
        </div>

        {/* 12-Month Bars Container */}
        <div className="grid grid-cols-12 gap-1.5 sm:gap-3 h-52 items-end border-b border-surface-800 pb-2 px-1">
          {data.map((m) => {
            const incomeHeight = maxMonthlyVal > 0 ? (m.income / maxMonthlyVal) * 100 : 0;
            const expenseHeight = maxMonthlyVal > 0 ? (m.expenses / maxMonthlyVal) * 100 : 0;
            const isHovered = hoveredMonth?.month === m.month;
            const hasData = m.income > 0 || m.expenses > 0;

            return (
              <div
                key={m.month}
                onMouseEnter={() => setHoveredMonth(m)}
                onMouseLeave={() => setHoveredMonth(null)}
                className={`flex flex-col items-center h-full justify-end group cursor-pointer transition-all duration-200 ${
                  isHovered ? 'scale-105' : ''
                }`}
              >
                {/* Bar Pairs */}
                <div className="w-full flex items-end justify-center gap-1 h-full pb-1">
                  {/* Income Bar */}
                  <div
                    className="w-1/2 max-w-[14px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t transition-all duration-500 shadow-sm group-hover:brightness-110"
                    style={{
                      height: `${Math.max(incomeHeight > 0 ? 4 : 0, incomeHeight)}%`,
                      opacity: hasData ? 1 : 0.2,
                    }}
                    title={`${m.monthName} Income: $${m.income.toFixed(2)}`}
                  />

                  {/* Expense Bar */}
                  <div
                    className="w-1/2 max-w-[14px] bg-gradient-to-t from-rose-600 to-rose-400 rounded-t transition-all duration-500 shadow-sm group-hover:brightness-110"
                    style={{
                      height: `${Math.max(expenseHeight > 0 ? 4 : 0, expenseHeight)}%`,
                      opacity: hasData ? 1 : 0.2,
                    }}
                    title={`${m.monthName} Expenses: $${m.expenses.toFixed(2)}`}
                  />
                </div>

                {/* Month Name Label */}
                <span
                  className={`text-[10px] sm:text-xs font-medium tracking-tight mt-1 transition-colors ${
                    isHovered ? 'text-primary-400 font-bold' : hasData ? 'text-surface-300' : 'text-surface-600'
                  }`}
                >
                  {m.monthName}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
