'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calculator,
  ArrowLeft,
  Save,
  Send,
  User,
  MapPin,
  FileText,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Receipt,
  Layers,
  Percent,
  Trash2,
  DollarSign,
  TrendingUp,
  CreditCard,
  Building,
  RefreshCw,
  ExternalLink,
  History,
  ShieldCheck,
  Check,
} from 'lucide-react';
import {
  TileCalculatorWidget,
  TileCalculatorValues,
  TileCalculationData,
} from '@/components/admin/quotes/TileCalculatorWidget';
import {
  ProfitMarginCard,
  FinancialValues,
  FinancialCalculationData,
  TargetPricingPreset,
} from '@/components/admin/quotes/ProfitMarginCard';
import { ProposalPreviewModal } from '@/components/admin/quotes/ProposalPreviewModal';

interface DetailedQuoteResponse {
  id: string;
  quoteNumber: string;
  leadId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  projectAddress: string | null;
  projectType: string;
  scopeDescription: string | null;
  status: 'DRAFT' | 'SENT' | 'WON' | 'LOST' | 'INVOICED' | 'PAID';
  areaM2: number;
  wastagePercent: number;
  tileLengthMm: number | null;
  tileWidthMm: number | null;
  tileThicknessMm: number | null;
  groutJointMm: number | null;
  trowelSizeMm: number | null;
  isWetArea: boolean;

  // Materials
  tilesNeededM2: number;
  tilesBoxCount: number | null;
  adhesiveBags: number;
  groutKg: number;
  siliconeTubes: number;
  waterproofingLitres: number;
  primerLitres: number;
  clipsCount: number;

  // Financials
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

  proposalText: string | null;
  depositRequired: number;
  notes: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;

  items: Array<{
    id: string;
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

  lead?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    projectType: string;
    message: string;
    status: string;
  } | null;

  transactions?: Array<{
    id: string;
    type: 'INCOME' | 'EXPENSE';
    category: string;
    amount: number;
    gstAmount: number;
    description: string;
    reference: string | null;
    date: string;
    paymentMethod: string | null;
  }>;
}

const STATUS_PROGRESSION = ['DRAFT', 'SENT', 'WON', 'INVOICED', 'PAID'] as const;

export default function QuoteInspectorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const quoteId = resolvedParams.id;
  const router = useRouter();

  const [quote, setQuote] = useState<DetailedQuoteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [syncingBudget, setSyncingBudget] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Editable Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [projectAddress, setProjectAddress] = useState('');
  const [projectType, setProjectType] = useState('');
  const [scopeDescription, setScopeDescription] = useState('');
  const [notes, setNotes] = useState('');

  // Tile Specs
  const [tileSpecs, setTileSpecs] = useState<TileCalculatorValues>({
    areaM2: 0,
    tileLengthMm: 600,
    tileWidthMm: 600,
    tileThicknessMm: 10,
    groutJointMm: 2,
    trowelSizeMm: 10,
    wastagePercent: 10,
    isWetArea: false,
  });

  // Financials
  const [financials, setFinancials] = useState<FinancialValues>({
    materialCost: 0,
    labourDays: 0,
    labourDayRate: 650,
    subcontractorCost: 0,
    skipHireCost: 0,
    equipmentHireCost: 0,
    otherCost: 0,
    quotedPriceExGst: 0,
  });

  // Live Calculator API Data
  const [tileCalculationData, setTileCalculationData] = useState<TileCalculationData | null>(null);
  const [financialCalculationData, setFinancialCalculationData] =
    useState<FinancialCalculationData | null>(null);
  const [targetPricingPresets, setTargetPricingPresets] = useState<TargetPricingPreset[]>([]);

  // Send Modal
  const [showSendModal, setShowSendModal] = useState(false);

  // 1. Fetch Quote Details
  const fetchQuoteDetails = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/quotes/${quoteId}`);
      if (!res.ok) {
        throw new Error('Quote not found or error loading quote data');
      }
      const data = await res.json();
      const q: DetailedQuoteResponse = data.quote;
      setQuote(q);

      // Populate form state
      setCustomerName(q.customerName);
      setCustomerEmail(q.customerEmail);
      setCustomerPhone(q.customerPhone || '');
      setProjectAddress(q.projectAddress || '');
      setProjectType(q.projectType);
      setScopeDescription(q.scopeDescription || '');
      setNotes(q.notes || '');

      setTileSpecs({
        areaM2: q.areaM2,
        tileLengthMm: q.tileLengthMm || 600,
        tileWidthMm: q.tileWidthMm || 600,
        tileThicknessMm: q.tileThicknessMm || 10,
        groutJointMm: q.groutJointMm || 2,
        trowelSizeMm: q.trowelSizeMm || 10,
        wastagePercent: q.wastagePercent || 10,
        isWetArea: q.isWetArea,
      });

      setFinancials({
        materialCost: q.materialCost,
        labourDays: q.labourDays,
        labourDayRate: q.labourDayRate || 650,
        subcontractorCost: 0,
        skipHireCost: 0,
        equipmentHireCost: 0,
        otherCost: q.otherCost,
        quotedPriceExGst: q.subtotalExGst,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error fetching quote';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [quoteId]);

  useEffect(() => {
    fetchQuoteDetails();
  }, [fetchQuoteDetails]);

  // 2. Live Calculation Call on spec change
  const runLiveCalculation = useCallback(async () => {
    setCalculating(true);
    try {
      const res = await fetch('/api/admin/calculator/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          areaM2: tileSpecs.areaM2,
          tileLengthMm: tileSpecs.tileLengthMm,
          tileWidthMm: tileSpecs.tileWidthMm,
          tileThicknessMm: tileSpecs.tileThicknessMm,
          groutJointMm: tileSpecs.groutJointMm,
          trowelSizeMm: tileSpecs.trowelSizeMm,
          wastagePercent: tileSpecs.wastagePercent,
          isWetArea: tileSpecs.isWetArea,
          materialCost: financials.materialCost,
          labourDays: financials.labourDays,
          labourDayRate: financials.labourDayRate,
          subcontractorCost: financials.subcontractorCost,
          skipHireCost: financials.skipHireCost,
          equipmentHireCost: financials.equipmentHireCost,
          otherCost: financials.otherCost,
          quotedPriceExGst: financials.quotedPriceExGst,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setTileCalculationData(data.tileCalculation);
          setFinancialCalculationData(data.financialSummary);
          setTargetPricingPresets(data.targetPricingPresets || []);
        }
      }
    } catch (err: unknown) {
      console.error('Recalculation error:', err);
    } finally {
      setCalculating(false);
    }
  }, [tileSpecs, financials]);

  useEffect(() => {
    if (!loading && quote) {
      const timer = setTimeout(() => {
        runLiveCalculation();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [tileSpecs, financials, loading, quote, runLiveCalculation]);

  // 3. Status Workflow Updater
  const handleStatusChange = async (newStatus: DetailedQuoteResponse['status']) => {
    if (!quote) return;
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await fetch(`/api/admin/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update quote status');
      }

      setQuote((prev) => (prev ? { ...prev, status: newStatus } : null));
      setSuccessMessage(`Quote status advanced to ${newStatus}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error updating status';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  // 4. Save Quote Changes
  const handleSaveQuoteChanges = async () => {
    if (!customerName.trim() || !customerEmail.trim()) {
      setError('Customer name and email are required.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const payload = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim() || null,
        projectAddress: projectAddress.trim() || null,
        projectType,
        scopeDescription: scopeDescription.trim() || null,
        notes: notes.trim() || null,

        // Tile Specs
        areaM2: tileSpecs.areaM2,
        wastagePercent: tileSpecs.wastagePercent,
        tileLengthMm: tileSpecs.tileLengthMm,
        tileWidthMm: tileSpecs.tileWidthMm,
        tileThicknessMm: tileSpecs.tileThicknessMm,
        groutJointMm: tileSpecs.groutJointMm,
        trowelSizeMm: tileSpecs.trowelSizeMm,
        isWetArea: tileSpecs.isWetArea,

        // Financial Breakdown
        materialCost: financials.materialCost,
        labourDays: financials.labourDays,
        labourDayRate: financials.labourDayRate,
        otherCost:
          financials.subcontractorCost +
          financials.skipHireCost +
          financials.equipmentHireCost +
          financials.otherCost,
        subtotalExGst: financials.quotedPriceExGst,
        profitMarginPercent: financialCalculationData?.profitMarginPercent,
        markupPercent: financialCalculationData?.markupPercent,
      };

      const res = await fetch(`/api/admin/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update quote');
      }

      setQuote(data.quote);
      setSuccessMessage('Quote updated and recalculated successfully!');
      setTimeout(() => setSuccessMessage(''), 3500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error saving quote';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  // 5. Sync to Business Budget Ledger
  const handleSyncToBudget = async (actionType: 'WON' | 'INVOICE_PAID' | 'LOG_MATERIAL_EXPENSE') => {
    if (!quote) return;
    setSyncingBudget(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/admin/budget/sync-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId: quote.id,
          action: actionType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sync quote with budget ledger');
      }

      setSuccessMessage(`Successfully logged transaction into Business Budget ledger!`);
      fetchQuoteDetails();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Budget sync error';
      setError(message);
    } finally {
      setSyncingBudget(false);
    }
  };

  // 6. Delete Quote
  const handleDeleteQuote = async () => {
    if (!quote) return;
    if (!confirm(`Are you sure you want to delete quote ${quote.quoteNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/quotes/${quote.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete quote');
      router.push('/admin/quotes');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error deleting quote';
      alert(message);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <RefreshCw className="h-8 w-8 animate-spin text-primary-500 mx-auto" />
        <div className="text-sm font-semibold text-white">Loading quote inspector...</div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="py-20 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-red-400 mx-auto" />
        <div className="text-lg font-bold text-white">Quote Not Found</div>
        <p className="text-xs text-surface-400">The requested quote does not exist or has been deleted.</p>
        <Link
          href="/admin/quotes"
          className="inline-flex items-center gap-2 px-4 py-2 bg-surface-800 hover:bg-surface-700 text-white text-xs font-semibold rounded-xl"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Quotes List
        </Link>
      </div>
    );
  }

  const getStatusBadgeClass = (st: string) => {
    switch (st) {
      case 'DRAFT':
        return 'bg-surface-800 text-surface-300 border-surface-700';
      case 'SENT':
        return 'bg-blue-950 text-blue-400 border-blue-800';
      case 'WON':
        return 'bg-emerald-950 text-emerald-400 border-emerald-800';
      case 'LOST':
        return 'bg-red-950 text-red-400 border-red-800';
      case 'INVOICED':
        return 'bg-purple-950 text-purple-400 border-purple-800';
      case 'PAID':
        return 'bg-cyan-950 text-cyan-400 border-cyan-800';
      default:
        return 'bg-surface-800 text-surface-400 border-surface-700';
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Top Header & Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-surface-800 pb-6">
        <div>
          <Link
            href="/admin/quotes"
            className="inline-flex items-center gap-1 text-xs text-surface-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Quotes Pipeline
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
              {quote.quoteNumber}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusBadgeClass(
                quote.status
              )}`}
            >
              {quote.status}
            </span>
          </div>
          <p className="text-xs text-surface-400 mt-1">
            Created on {new Date(quote.createdAt).toLocaleDateString('en-AU')} &bull; Last updated{' '}
            {new Date(quote.updatedAt).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowSendModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
            Send Proposal via Email
          </button>

          <button
            type="button"
            onClick={handleSaveQuoteChanges}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? 'Saving...' : 'Save & Recalculate'}
          </button>

          <button
            type="button"
            onClick={handleDeleteQuote}
            className="p-2.5 bg-red-950/40 hover:bg-red-950 text-red-400 border border-red-900/60 rounded-xl transition-colors cursor-pointer"
            title="Delete Quote"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-red-950/50 border border-red-800 rounded-2xl flex items-center gap-3 text-red-300 text-sm">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-950/50 border border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-300 text-sm">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Workflow Status Progression Bar */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-surface-400 flex items-center gap-1.5">
            <History className="h-3.5 w-3.5 text-primary-400" />
            Quote Progression Workflow
          </span>
          <span className="text-xs text-surface-400 font-mono">
            Current Stage: <strong className="text-white">{quote.status}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {STATUS_PROGRESSION.map((st, idx) => {
            const isCurrent = quote.status === st;
            const isPast =
              STATUS_PROGRESSION.indexOf(quote.status as (typeof STATUS_PROGRESSION)[number]) > idx;

            return (
              <button
                key={st}
                type="button"
                onClick={() => handleStatusChange(st)}
                disabled={saving}
                className={`py-2 px-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  isCurrent
                    ? 'bg-primary-600 text-white border-primary-500 shadow-md ring-1 ring-primary-400/50'
                    : isPast
                    ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
                    : 'bg-surface-950/60 border-surface-800 text-surface-400 hover:text-white hover:bg-surface-800'
                }`}
              >
                {isPast && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                <span>{st}</span>
              </button>
            );
          })}

          {/* Lost Option */}
          <button
            type="button"
            onClick={() => handleStatusChange('LOST')}
            disabled={saving}
            className={`py-2 px-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
              quote.status === 'LOST'
                ? 'bg-red-600 text-white border-red-500'
                : 'bg-surface-950/60 border-surface-800 text-surface-400 hover:text-red-300 hover:border-red-800'
            }`}
          >
            LOST
          </button>
        </div>
      </div>

      {/* Budget Integration Card (Enabled on WON or PAID) */}
      {(quote.status === 'WON' || quote.status === 'PAID') && (
        <div className="bg-gradient-to-r from-emerald-950/40 via-surface-900 to-surface-900 border border-emerald-800/60 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-950/80 border border-emerald-800 rounded-xl text-emerald-400">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Synchronize to Business Budget Ledger
                </h3>
                <p className="text-xs text-surface-300 mt-0.5">
                  Record quote contract value ($
                  {quote.totalIncGst.toLocaleString()} AUD) into the business income ledger with automatic 10% GST allocation.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSyncToBudget(quote.status === 'PAID' ? 'INVOICE_PAID' : 'WON')}
                disabled={syncingBudget}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                <DollarSign className="h-3.5 w-3.5" />
                {syncingBudget
                  ? 'Syncing...'
                  : quote.status === 'PAID'
                  ? 'Sync Paid Revenue ($' + quote.totalIncGst.toLocaleString() + ')'
                  : 'Sync Won Revenue ($' + quote.totalIncGst.toLocaleString() + ')'}
              </button>

              <button
                type="button"
                onClick={() => handleSyncToBudget('LOG_MATERIAL_EXPENSE')}
                disabled={syncingBudget}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                <Receipt className="h-3.5 w-3.5" />
                Log Material Cost (${quote.materialCost.toLocaleString()})
              </button>
            </div>
          </div>

          {/* Display Linked Ledger Transactions */}
          {quote.transactions && quote.transactions.length > 0 && (
            <div className="pt-3 border-t border-surface-800/80 space-y-2">
              <span className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider block">
                Linked Budget Transactions ({quote.transactions.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quote.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 bg-surface-950/60 rounded-xl border border-surface-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span
                        className={`font-bold ${
                          tx.type === 'INCOME' ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toLocaleString()} AUD
                      </span>
                      <p className="text-[11px] text-surface-400 truncate max-w-xs">{tx.description}</p>
                    </div>
                    <span className="text-[10px] text-surface-500 font-mono">
                      {new Date(tx.date).toLocaleDateString('en-AU')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Customer & Scope Details Form */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-surface-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <User className="h-4 w-4 text-primary-400" />
            Customer & Project Details
          </h2>
          {quote.lead && (
            <Link
              href={`/admin/leads?id=${quote.lead.id}`}
              className="text-xs text-primary-400 hover:underline flex items-center gap-1"
            >
              <span>View Originating Lead</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-surface-300 mb-1.5">
              Customer Full Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3.5 py-2 bg-surface-950 border border-surface-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full px-3.5 py-2 bg-surface-950 border border-surface-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-300 mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-3.5 py-2 bg-surface-950 border border-surface-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-300 mb-1.5">
              Service / Project Type
            </label>
            <input
              type="text"
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              className="w-full px-3.5 py-2 bg-surface-950 border border-surface-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2 border-t border-surface-800/80">
          <div>
            <label className="block text-xs font-semibold text-surface-300 mb-1.5 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-surface-400" />
              Project Site Address
            </label>
            <input
              type="text"
              value={projectAddress}
              onChange={(e) => setProjectAddress(e.target.value)}
              className="w-full px-3.5 py-2 bg-surface-950 border border-surface-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-surface-300 mb-1.5 flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-surface-400" />
              Scope of Works & Customer Requirements
            </label>
            <textarea
              rows={2}
              value={scopeDescription}
              onChange={(e) => setScopeDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-surface-950 border border-surface-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Tile Calculator & BOM Widget */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary-400" />
            Tile Calculator & Material Specifications
          </h2>
        </div>

        <TileCalculatorWidget
          values={tileSpecs}
          onChange={(updated) => setTileSpecs((prev) => ({ ...prev, ...updated }))}
          calculatedData={tileCalculationData}
          isLoading={calculating}
        />
      </div>

      {/* Financial Margin & Costing Card */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Percent className="h-5 w-5 text-emerald-400" />
            Financial Breakdown & Profit Margins
          </h2>
        </div>

        <ProfitMarginCard
          values={financials}
          onChange={(updated) => setFinancials((prev) => ({ ...prev, ...updated }))}
          financialData={financialCalculationData}
          targetPricingPresets={targetPricingPresets}
        />
      </div>

      {/* Quote Items Table (If items exist) */}
      {quote.items && quote.items.length > 0 && (
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-surface-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary-400" />
              Itemized Quote Breakdown
            </h3>
            <span className="text-xs text-surface-400">{quote.items.length} line items</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="uppercase tracking-wider text-surface-400 border-b border-surface-800 bg-surface-950/40">
                <tr>
                  <th className="py-2.5 px-3">Item</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Qty</th>
                  <th className="py-2.5 px-3">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Total Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800/60 font-mono">
                {quote.items.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-800/20">
                    <td className="py-2.5 px-3 font-sans font-medium text-white">{item.name}</td>
                    <td className="py-2.5 px-3 font-sans capitalize text-surface-400">
                      {item.category.toLowerCase()}
                    </td>
                    <td className="py-2.5 px-3 text-surface-300">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-2.5 px-3 text-surface-300">${item.unitPrice.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                      ${item.totalPrice.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Internal Notes */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 space-y-3">
        <label className="block text-xs font-bold text-white uppercase tracking-wider">
          Internal Job Notes
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Private technician notes, site access codes, material supplier invoices..."
          className="w-full px-3.5 py-2 bg-surface-950 border border-surface-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono"
        />
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="sticky bottom-4 z-30 bg-surface-900/95 backdrop-blur-xl border border-surface-700/80 rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-surface-400">Total Price:</span>
            <span className="font-mono text-base font-extrabold text-white ml-1.5">
              $
              {(
                financialCalculationData?.pricing.totalIncGst ?? quote.totalIncGst
              ).toLocaleString()}{' '}
              <span className="text-[10px] text-surface-400 font-normal">Inc GST</span>
            </span>
          </div>

          <div className="h-4 w-px bg-surface-700" />

          <div>
            <span className="text-surface-400">Profit Margin:</span>
            <span className="font-mono text-sm font-bold text-emerald-400 ml-1.5">
              {financialCalculationData?.profitMarginPercent ?? quote.profitMarginPercent}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowSendModal(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            Send Proposal
          </button>

          <button
            type="button"
            onClick={handleSaveQuoteChanges}
            disabled={saving}
            className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-primary-600/30 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Proposal Preview & Send Modal */}
      {showSendModal && (
        <ProposalPreviewModal
          isOpen={showSendModal}
          onClose={() => setShowSendModal(false)}
          quoteId={quote.id}
          quoteNumber={quote.quoteNumber}
          customerName={customerName}
          customerEmail={customerEmail}
          customerPhone={customerPhone}
          projectAddress={projectAddress}
          projectType={projectType}
          scopeDescription={scopeDescription}
          areaM2={tileSpecs.areaM2}
          subtotalExGst={financialCalculationData?.pricing.subtotalExGst ?? quote.subtotalExGst}
          gstAmount={financialCalculationData?.pricing.gstAmount ?? quote.gstAmount}
          totalIncGst={financialCalculationData?.pricing.totalIncGst ?? quote.totalIncGst}
          proposalText={quote.proposalText}
          tileLengthMm={tileSpecs.tileLengthMm}
          tileWidthMm={tileSpecs.tileWidthMm}
          tileThicknessMm={tileSpecs.tileThicknessMm}
          groutJointMm={tileSpecs.groutJointMm}
          isWetArea={tileSpecs.isWetArea}
          onSendSuccess={() => {
            fetchQuoteDetails();
          }}
        />
      )}
    </div>
  );
}
