'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  Receipt,
  PiggyBank,
  Landmark,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Plus,
  Wallet,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { GstVaultCard } from '@/components/admin/budget/GstVaultCard';
import { TaxReserveCard } from '@/components/admin/budget/TaxReserveCard';
import { MonthlyTrendBar } from '@/components/admin/budget/MonthlyTrendBar';
import { TransactionModal } from '@/components/admin/budget/TransactionModal';
import { TransactionTable } from '@/components/admin/budget/TransactionTable';
import {
  BudgetSummary,
  BudgetTransaction,
  TransactionType,
} from '@/components/admin/budget/types';

export default function AdminBudgetPage() {
  // Financial Year / Period state
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [periodPreset, setPeriodPreset] = useState<'ALL_YEAR' | 'Q1' | 'Q2' | 'Q3' | 'Q4'>('ALL_YEAR');

  // Summary and Transaction data
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [transactions, setTransactions] = useState<BudgetTransaction[]>([]);
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Table filter states
  const [search, setSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | TransactionType>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [personalFilter, setPersonalFilter] = useState<'false' | 'true' | 'all'>('false');

  // UI state
  const [loadingSummary, setLoadingSummary] = useState<boolean>(true);
  const [loadingTransactions, setLoadingTransactions] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<BudgetTransaction | null>(null);

  // Fetch Budget Summary (Metric Cards, GST Vault, Tax Reserve, Monthly Trends)
  const fetchSummary = useCallback(async () => {
    setLoadingSummary(true);
    setError('');
    try {
      let url = `/api/admin/budget/summary?year=${selectedYear}`;

      if (periodPreset === 'Q1') {
        url += `&startDate=${selectedYear}-07-01&endDate=${selectedYear}-09-30`;
      } else if (periodPreset === 'Q2') {
        url += `&startDate=${selectedYear}-10-01&endDate=${selectedYear}-12-31`;
      } else if (periodPreset === 'Q3') {
        url += `&startDate=${selectedYear}-01-01&endDate=${selectedYear}-03-31`;
      } else if (periodPreset === 'Q4') {
        url += `&startDate=${selectedYear}-04-01&endDate=${selectedYear}-06-30`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to load financial summary');
      }
      const data = await res.json();
      setSummary(data.summary);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error fetching summary';
      setError(message);
    } finally {
      setLoadingSummary(false);
    }
  }, [selectedYear, periodPreset]);

  // Fetch Ledger Transactions
  const fetchTransactions = useCallback(async () => {
    setLoadingTransactions(true);
    try {
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', '20');

      if (search.trim()) {
        params.set('search', search.trim());
      }
      if (typeFilter !== 'ALL') {
        params.set('type', typeFilter);
      }
      if (categoryFilter !== 'ALL') {
        params.set('category', categoryFilter);
      }
      params.set('isPersonal', personalFilter);

      // Apply Year filter to transaction query
      if (periodPreset === 'ALL_YEAR') {
        params.set('startDate', `${selectedYear}-01-01`);
        params.set('endDate', `${selectedYear}-12-31`);
      } else if (periodPreset === 'Q1') {
        params.set('startDate', `${selectedYear}-07-01`);
        params.set('endDate', `${selectedYear}-09-30`);
      } else if (periodPreset === 'Q2') {
        params.set('startDate', `${selectedYear}-10-01`);
        params.set('endDate', `${selectedYear}-12-31`);
      } else if (periodPreset === 'Q3') {
        params.set('startDate', `${selectedYear}-01-01`);
        params.set('endDate', `${selectedYear}-03-31`);
      } else if (periodPreset === 'Q4') {
        params.set('startDate', `${selectedYear}-04-01`);
        params.set('endDate', `${selectedYear}-06-30`);
      }

      const res = await fetch(`/api/admin/budget/transactions?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to load ledger transactions');
      }
      const data = await res.json();
      setTransactions(data.transactions || []);
      setTotalTransactions(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err: unknown) {
      console.error('Error loading transactions', err);
    } finally {
      setLoadingTransactions(false);
    }
  }, [currentPage, search, typeFilter, categoryFilter, personalFilter, selectedYear, periodPreset]);

  // Initial and reactive load
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Handlers for modal actions
  const handleAddNew = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEdit = (tx: BudgetTransaction) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    fetchSummary();
    fetchTransactions();
  };

  const handlePageRefresh = () => {
    fetchSummary();
    fetchTransactions();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header & Period Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Business Budget & Ledger
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
              Live Bookkeeping
            </span>
          </div>
          <p className="text-sm text-surface-400 mt-1">
            Real-time cash flow, ATO GST vault, 25% tax reserves &amp; personal expense separation
          </p>
        </div>

        {/* Year and Quarter Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Year selector */}
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(parseInt(e.target.value, 10));
              setCurrentPage(1);
            }}
            className="bg-surface-900 border border-surface-700 text-white rounded-xl px-3 py-2 text-sm font-semibold focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all cursor-pointer shadow-sm"
          >
            {[currentYear + 1, currentYear, currentYear - 1, currentYear - 2].map((yr) => (
              <option key={yr} value={yr}>
                {yr} Financial Year
              </option>
            ))}
          </select>

          {/* Period Preset Pills */}
          <div className="flex items-center bg-surface-900 p-1 rounded-xl border border-surface-800 text-xs font-semibold">
            <button
              onClick={() => {
                setPeriodPreset('ALL_YEAR');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                periodPreset === 'ALL_YEAR'
                  ? 'bg-surface-800 text-white shadow-sm'
                  : 'text-surface-400 hover:text-white'
              }`}
            >
              Full Year
            </button>
            <button
              onClick={() => {
                setPeriodPreset('Q1');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                periodPreset === 'Q1'
                  ? 'bg-surface-800 text-white shadow-sm'
                  : 'text-surface-400 hover:text-white'
              }`}
            >
              Q1 (Jul-Sep)
            </button>
            <button
              onClick={() => {
                setPeriodPreset('Q2');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                periodPreset === 'Q2'
                  ? 'bg-surface-800 text-white shadow-sm'
                  : 'text-surface-400 hover:text-white'
              }`}
            >
              Q2 (Oct-Dec)
            </button>
            <button
              onClick={() => {
                setPeriodPreset('Q3');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                periodPreset === 'Q3'
                  ? 'bg-surface-800 text-white shadow-sm'
                  : 'text-surface-400 hover:text-white'
              }`}
            >
              Q3 (Jan-Mar)
            </button>
            <button
              onClick={() => {
                setPeriodPreset('Q4');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                periodPreset === 'Q4'
                  ? 'bg-surface-800 text-white shadow-sm'
                  : 'text-surface-400 hover:text-white'
              }`}
            >
              Q4 (Apr-Jun)
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handlePageRefresh}
            disabled={loadingSummary || loadingTransactions}
            className="p-2 bg-surface-900 border border-surface-700 text-surface-300 hover:text-white hover:bg-surface-800 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            title="Refresh budget data"
          >
            <RefreshCw
              className={`h-4 w-4 ${loadingSummary || loadingTransactions ? 'animate-spin' : ''}`}
            />
          </button>

          {/* New Transaction Button */}
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-primary-950 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-2xl text-red-200 text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={handlePageRefresh}
            className="px-3 py-1 bg-red-900/60 hover:bg-red-800 rounded-lg text-xs font-semibold text-white transition-all cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* HERO BANNER: "Real Cash in Pocket" Highlight Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-900 via-surface-900 to-surface-950 border border-surface-800 p-6 sm:p-8 shadow-2xl">
        {/* Background Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-950/80 border border-emerald-800/80 rounded-xl text-emerald-400 shadow-sm">
                <Wallet className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                True Take-Home Clarity
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Real Cash in Pocket
            </h2>
            <p className="text-xs sm:text-sm text-surface-300 max-w-xl leading-relaxed">
              Your exact safe-to-spend owner profit after deducting direct trade expenses, quarantining 10% ATO GST, and setting aside 25% for income tax.
            </p>
          </div>

          {/* Right Hero Number & Formula Breakdown */}
          <div className="bg-surface-950/90 border border-surface-800 rounded-2xl p-5 sm:p-6 lg:min-w-[340px] text-right">
            <span className="text-xs font-medium text-surface-400 block uppercase tracking-wider">
              Safe Owner Drawing Capacity
            </span>
            <div className="flex items-baseline justify-end gap-2 mt-1">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-emerald-400">
                ${summary ? summary.trueTakeHomeCash.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
              </span>
            </div>

            {/* Formula explanation pill */}
            <div className="mt-3 pt-3 border-t border-surface-800/80 text-[11px] text-surface-400 flex items-center justify-end gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Net Profit - 25% Tax - ATO GST</span>
            </div>
          </div>
        </div>
      </div>

      {/* METRIC CARDS GRID (5 Key Indicators) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Total Business Revenue */}
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5 shadow-lg relative overflow-hidden transition-all hover:border-surface-700">
          <div className="flex items-center justify-between text-surface-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Revenue (Inc GST)</span>
            <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono tracking-tight">
            ${summary ? summary.totalIncome.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
          </p>
          <span className="text-[11px] text-surface-500 block mt-1">
            {summary ? `${summary.transactionCounts.income} invoiced payments` : '0 payments'}
          </span>
        </div>

        {/* 2. Total Business Expenses */}
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5 shadow-lg relative overflow-hidden transition-all hover:border-surface-700">
          <div className="flex items-center justify-between text-surface-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Business Expenses</span>
            <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-400">
              <ArrowDownRight className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono tracking-tight">
            ${summary ? summary.totalExpenses.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
          </p>
          <span className="text-[11px] text-surface-500 block mt-1">
            {summary ? `${summary.transactionCounts.expenses} deductible claims` : '0 purchases'}
          </span>
        </div>

        {/* 3. Net Operating Profit */}
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5 shadow-lg relative overflow-hidden transition-all hover:border-surface-700">
          <div className="flex items-center justify-between text-surface-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Net Operating Profit</span>
            <div className="p-2 rounded-xl bg-primary-950/60 border border-primary-800/60 text-primary-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p
            className={`text-2xl font-black font-mono tracking-tight ${
              summary && summary.netOperatingProfit >= 0 ? 'text-white' : 'text-rose-400'
            }`}
          >
            ${summary ? summary.netOperatingProfit.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
          </p>
          <span className="text-[11px] text-surface-500 block mt-1">
            Pre-tax business margin
          </span>
        </div>

        {/* 4. GST Vault (ATO Liability) */}
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5 shadow-lg relative overflow-hidden transition-all hover:border-surface-700">
          <div className="flex items-center justify-between text-surface-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">GST Vault (ATO)</span>
            <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-800/60 text-amber-400">
              <Landmark className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono tracking-tight">
            ${summary ? summary.gstVault.netGstOwed.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
          </p>
          <span className="text-[11px] text-surface-500 block mt-1">
            Quarantined for BAS return
          </span>
        </div>

        {/* 5. Recommended Tax Reserve (25%) */}
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5 shadow-lg relative overflow-hidden transition-all hover:border-surface-700">
          <div className="flex items-center justify-between text-surface-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Tax Reserve (25%)</span>
            <div className="p-2 rounded-xl bg-blue-950/60 border border-blue-800/60 text-blue-400">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-400 font-mono tracking-tight">
            ${summary ? summary.taxReserve.amount.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
          </p>
          <span className="text-[11px] text-surface-500 block mt-1">
            Set aside for EOFY tax bill
          </span>
        </div>
      </div>

      {/* TWO-COLUMN SECTION: GST Vault Card + Tax Reserve Card */}
      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GstVaultCard gstVault={summary.gstVault} />
          <TaxReserveCard
            taxReserve={summary.taxReserve}
            netOperatingProfit={summary.netOperatingProfit}
            trueTakeHomeCash={summary.trueTakeHomeCash}
            netGstOwed={summary.gstVault.netGstOwed}
          />
        </div>
      )}

      {/* 12-MONTH VISUAL INCOME VS EXPENSE TREND */}
      {summary && summary.monthlyTrends && (
        <MonthlyTrendBar data={summary.monthlyTrends} year={selectedYear} />
      )}

      {/* FILTERABLE TRANSACTION LEDGER TABLE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-surface-900 border border-surface-800 rounded-xl text-primary-400">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Transaction Bookkeeping Ledger
              </h2>
              <p className="text-xs text-surface-400">
                Detailed audit trail of all trade invoices, equipment expenses, and receipts
              </p>
            </div>
          </div>
        </div>

        <TransactionTable
          transactions={transactions}
          totalCount={totalTransactions}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onEdit={handleEdit}
          onDeleteSuccess={handleModalSuccess}
          onAddNew={handleAddNew}
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          typeFilter={typeFilter}
          onTypeFilterChange={(val) => {
            setTypeFilter(val);
            setCurrentPage(1);
          }}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={(val) => {
            setCategoryFilter(val);
            setCurrentPage(1);
          }}
          personalFilter={personalFilter}
          onPersonalFilterChange={(val) => {
            setPersonalFilter(val);
            setCurrentPage(1);
          }}
          loading={loadingTransactions}
        />
      </div>

      {/* CREATE / EDIT TRANSACTION MODAL */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        transactionToEdit={editingTransaction}
      />
    </div>
  );
}
