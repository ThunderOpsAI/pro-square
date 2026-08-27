'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Wrench,
  Percent,
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

interface DetailedQuoteFormState {
  // Customer & Lead
  leadId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  projectAddress: string;
  projectType: string;
  scopeDescription: string;
  notes: string;
  proposalTone: 'confident' | 'formal' | 'concise' | 'detailed';

  // Tile & Area Specs
  tileSpecs: TileCalculatorValues;

  // Financials
  financials: FinancialValues;
}

const INITIAL_STATE: DetailedQuoteFormState = {
  leadId: null,
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  projectAddress: '',
  projectType: 'Bathroom Tiling',
  scopeDescription: '',
  notes: '',
  proposalTone: 'confident',

  tileSpecs: {
    areaM2: 20,
    tileLengthMm: 600,
    tileWidthMm: 600,
    tileThicknessMm: 10,
    groutJointMm: 2,
    trowelSizeMm: 10,
    wastagePercent: 10,
    isWetArea: true,
  },

  financials: {
    materialCost: 0,
    labourDays: 2,
    labourDayRate: 650,
    subcontractorCost: 0,
    skipHireCost: 0,
    equipmentHireCost: 0,
    otherCost: 0,
    quotedPriceExGst: 2800,
  },
};

function NewQuoteBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadIdParam = searchParams.get('leadId');

  const [formData, setFormData] = useState<DetailedQuoteFormState>(INITIAL_STATE);
  const [loadingLead, setLoadingLead] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Calculation Results from API
  const [tileCalculationData, setTileCalculationData] = useState<TileCalculationData | null>(null);
  const [financialCalculationData, setFinancialCalculationData] =
    useState<FinancialCalculationData | null>(null);
  const [targetPricingPresets, setTargetPricingPresets] = useState<TargetPricingPreset[]>([]);

  // Send Modal after save
  const [savedQuoteForSend, setSavedQuoteForSend] = useState<{
    id: string;
    quoteNumber: string;
    subtotalExGst: number;
    gstAmount: number;
    totalIncGst: number;
    proposalText: string | null;
  } | null>(null);

  // 1. Fetch Lead details if ?leadId is provided
  useEffect(() => {
    if (!leadIdParam) return;

    async function loadLead() {
      setLoadingLead(true);
      try {
        const res = await fetch(`/api/admin/leads`);
        if (!res.ok) throw new Error('Failed to load lead details');
        const data = await res.json();
        const found = (data.leads || []).find((l: { id: string }) => l.id === leadIdParam);

        if (found) {
          setFormData((prev) => ({
            ...prev,
            leadId: found.id,
            customerName: `${found.firstName || ''} ${found.lastName || ''}`.trim(),
            customerEmail: found.email || '',
            customerPhone: found.phone || '',
            projectType: found.projectType
              ? `${found.projectType.charAt(0).toUpperCase() + found.projectType.slice(1)} Tiling`
              : prev.projectType,
            scopeDescription: found.message || prev.scopeDescription,
          }));
        }
      } catch (err: unknown) {
        console.error('Error auto-populating from lead:', err);
      } finally {
        setLoadingLead(false);
      }
    }

    loadLead();
  }, [leadIdParam]);

  // 2. Real-time Calculation Call to /api/admin/calculator/calculate
  const runCalculation = useCallback(async () => {
    setCalculating(true);
    try {
      const res = await fetch('/api/admin/calculator/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          areaM2: formData.tileSpecs.areaM2,
          tileLengthMm: formData.tileSpecs.tileLengthMm,
          tileWidthMm: formData.tileSpecs.tileWidthMm,
          tileThicknessMm: formData.tileSpecs.tileThicknessMm,
          groutJointMm: formData.tileSpecs.groutJointMm,
          trowelSizeMm: formData.tileSpecs.trowelSizeMm,
          wastagePercent: formData.tileSpecs.wastagePercent,
          isWetArea: formData.tileSpecs.isWetArea,
          materialCost: formData.financials.materialCost,
          labourDays: formData.financials.labourDays,
          labourDayRate: formData.financials.labourDayRate,
          subcontractorCost: formData.financials.subcontractorCost,
          skipHireCost: formData.financials.skipHireCost,
          equipmentHireCost: formData.financials.equipmentHireCost,
          otherCost: formData.financials.otherCost,
          quotedPriceExGst: formData.financials.quotedPriceExGst,
          profitMarginPercent: formData.financials.profitMarginPercent,
        }),
      });

      if (!res.ok) {
        throw new Error('Calculator engine error');
      }

      const data = await res.json();
      if (data.success) {
        setTileCalculationData(data.tileCalculation);
        setFinancialCalculationData(data.financialSummary);
        setTargetPricingPresets(data.targetPricingPresets || []);
      }
    } catch (err: unknown) {
      console.error('Live calculation error:', err);
    } finally {
      setCalculating(false);
    }
  }, [formData.tileSpecs, formData.financials]);

  // Debounced execution of calculation when specs change
  useEffect(() => {
    const timer = setTimeout(() => {
      runCalculation();
    }, 250);

    return () => clearTimeout(timer);
  }, [runCalculation]);

  // Handlers for Updating Specs
  const handleTileSpecsChange = (updated: Partial<TileCalculatorValues>) => {
    setFormData((prev) => ({
      ...prev,
      tileSpecs: { ...prev.tileSpecs, ...updated },
    }));
  };

  const handleFinancialsChange = (updated: Partial<FinancialValues>) => {
    setFormData((prev) => ({
      ...prev,
      financials: { ...prev.financials, ...updated },
    }));
  };

  // Submit Handler
  const handleSaveQuote = async (sendImmediately: boolean = false) => {
    setError('');
    setSuccessMessage('');

    if (!formData.customerName.trim()) {
      setError('Please provide the Customer Name.');
      return;
    }
    if (!formData.customerEmail.trim() || !formData.customerEmail.includes('@')) {
      setError('Please provide a valid Customer Email address.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        leadId: formData.leadId,
        updateLeadStatus: true,
        customerName: formData.customerName.trim(),
        customerEmail: formData.customerEmail.trim(),
        customerPhone: formData.customerPhone.trim() || null,
        projectAddress: formData.projectAddress.trim() || null,
        projectType: formData.projectType,
        scopeDescription: formData.scopeDescription.trim() || null,
        status: 'DRAFT',

        // Tile & Area Specifications
        areaM2: formData.tileSpecs.areaM2,
        wastagePercent: formData.tileSpecs.wastagePercent,
        tileLengthMm: formData.tileSpecs.tileLengthMm,
        tileWidthMm: formData.tileSpecs.tileWidthMm,
        tileThicknessMm: formData.tileSpecs.tileThicknessMm,
        groutJointMm: formData.tileSpecs.groutJointMm,
        trowelSizeMm: formData.tileSpecs.trowelSizeMm,
        isWetArea: formData.tileSpecs.isWetArea,

        // Financial Breakdown
        materialCost: formData.financials.materialCost,
        labourDays: formData.financials.labourDays,
        labourDayRate: formData.financials.labourDayRate,
        otherCost:
          formData.financials.subcontractorCost +
          formData.financials.skipHireCost +
          formData.financials.equipmentHireCost +
          formData.financials.otherCost,
        subtotalExGst: formData.financials.quotedPriceExGst,
        profitMarginPercent: financialCalculationData?.profitMarginPercent,
        markupPercent: financialCalculationData?.markupPercent,
        proposalTone: formData.proposalTone,
        notes: formData.notes.trim() || null,
      };

      const res = await fetch('/api/admin/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create detailed quote');
      }

      const createdQuote = data.quote;
      setSuccessMessage(`Quote ${createdQuote.quoteNumber} created successfully!`);

      if (sendImmediately) {
        setSavedQuoteForSend({
          id: createdQuote.id,
          quoteNumber: createdQuote.quoteNumber,
          subtotalExGst: createdQuote.subtotalExGst,
          gstAmount: createdQuote.gstAmount,
          totalIncGst: createdQuote.totalIncGst,
          proposalText: createdQuote.proposalText,
        });
      } else {
        setTimeout(() => {
          router.push(`/admin/quotes/${createdQuote.id}`);
        }, 1000);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error creating quote';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-800 pb-6">
        <div>
          <Link
            href="/admin/quotes"
            className="inline-flex items-center gap-1 text-xs text-surface-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Quotes Pipeline
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Calculator className="h-7 w-7 text-primary-500" />
            Interactive Quote Builder & Estimator
          </h1>
          <p className="text-sm text-surface-400 mt-1">
            Configure tile dimensions, estimate live Australian Standards materials, and calibrate gross profit margins.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSaveQuote(false)}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-800 hover:bg-surface-700 text-white rounded-xl text-sm font-semibold border border-surface-700 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Save as Draft
          </button>

          <button
            type="button"
            onClick={() => handleSaveQuote(true)}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Save & Send Proposal
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

      {/* Section 1: Customer Details & Job Scope */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-surface-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <User className="h-4 w-4 text-primary-400" />
            1. Customer Information & Scope of Works
          </h2>
          {formData.leadId && (
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary-950 text-primary-300 border border-primary-800">
              Linked to Lead #{formData.leadId.slice(-4)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-surface-300 mb-1.5">
              Customer Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              placeholder="e.g. Sarah Jenkins"
              className="w-full px-3.5 py-2 bg-surface-950 border border-surface-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-300 mb-1.5">
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.customerEmail}
              onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
              placeholder="sarah@example.com"
              className="w-full px-3.5 py-2 bg-surface-950 border border-surface-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-300 mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              placeholder="0400 123 456"
              className="w-full px-3.5 py-2 bg-surface-950 border border-surface-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-300 mb-1.5">
              Service / Project Type
            </label>
            <select
              value={formData.projectType}
              onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
              className="w-full px-3.5 py-2 bg-surface-950 border border-surface-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
              <option value="Bathroom Tiling">Bathroom Tiling</option>
              <option value="Kitchen Splashback">Kitchen Splashback</option>
              <option value="Main Floor Tiling">Main Floor Tiling</option>
              <option value="Outdoor / Balcony Tiling">Outdoor / Balcony Tiling</option>
              <option value="Commercial Tiling">Commercial Tiling</option>
              <option value="Pool / Wet Deck">Pool / Wet Deck</option>
              <option value="Tile Repair & Regrouting">Tile Repair & Regrouting</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2 border-t border-surface-800/80">
          <div className="lg:col-span-1">
            <label className="block text-xs font-semibold text-surface-300 mb-1.5 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-surface-400" />
              Project Site Address
            </label>
            <input
              type="text"
              value={formData.projectAddress}
              onChange={(e) => setFormData({ ...formData, projectAddress: e.target.value })}
              placeholder="e.g. 42 Ocean Parade, Manly NSW"
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
              value={formData.scopeDescription}
              onChange={(e) => setFormData({ ...formData, scopeDescription: e.target.value })}
              placeholder="Provide key requirements, surface conditions, niche specifications, or removal of old tiles..."
              className="w-full px-3.5 py-2 bg-surface-950 border border-surface-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Tile & Material Calculator Engine */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary-400" />
            2. Tile Calculator & Bill of Materials
          </h2>
          <span className="text-xs text-surface-400 font-mono">
            {formData.tileSpecs.areaM2} m² @ {formData.tileSpecs.tileLengthMm}x
            {formData.tileSpecs.tileWidthMm}mm
          </span>
        </div>

        <TileCalculatorWidget
          values={formData.tileSpecs}
          onChange={handleTileSpecsChange}
          calculatedData={tileCalculationData}
          isLoading={calculating}
        />
      </div>

      {/* Section 3: Financials & Profit Margin Engine */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Percent className="h-5 w-5 text-emerald-400" />
            3. Financial Costing & Profit Margin Calibration
          </h2>
          <span className="text-xs text-surface-400 font-mono">
            Quoted: ${formData.financials.quotedPriceExGst.toLocaleString()} Ex GST
          </span>
        </div>

        <ProfitMarginCard
          values={formData.financials}
          onChange={handleFinancialsChange}
          financialData={financialCalculationData}
          targetPricingPresets={targetPricingPresets}
        />
      </div>

      {/* Section 4: Internal Notes & Proposal Tone */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-surface-800 pb-3">
          <Sparkles className="h-4 w-4 text-primary-400" />
          4. Proposal Formulation & Internal Notes
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-surface-300 mb-1.5">
              Client Proposal Tone
            </label>
            <select
              value={formData.proposalTone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  proposalTone: e.target.value as DetailedQuoteFormState['proposalTone'],
                })
              }
              className="w-full px-3.5 py-2 bg-surface-950 border border-surface-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
              <option value="confident">Confident & Professional (Default)</option>
              <option value="formal">Formal Master Builder</option>
              <option value="concise">Concise & Direct</option>
              <option value="detailed">Exhaustive Architectural</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-surface-300 mb-1.5">
              Private Internal Notes (Not sent to client)
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Client requested start in 2 weeks, access code 4821"
              className="w-full px-3.5 py-2 bg-surface-950 border border-surface-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 z-30 bg-surface-900/95 backdrop-blur-xl border border-surface-700/80 rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-surface-400">Total Price:</span>
            <span className="font-mono text-base font-extrabold text-white ml-1.5">
              $
              {(
                financialCalculationData?.pricing.totalIncGst ??
                Math.round(formData.financials.quotedPriceExGst * 1.1)
              ).toLocaleString()}{' '}
              <span className="text-[10px] text-surface-400 font-normal">Inc GST</span>
            </span>
          </div>

          <div className="h-4 w-px bg-surface-700" />

          <div>
            <span className="text-surface-400">Profit Margin:</span>
            <span className="font-mono text-sm font-bold text-emerald-400 ml-1.5">
              {financialCalculationData?.profitMarginPercent ?? 30}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleSaveQuote(false)}
            disabled={saving}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-surface-800 hover:bg-surface-700 text-white rounded-xl text-xs font-semibold border border-surface-700 transition-all cursor-pointer disabled:opacity-50"
          >
            Save as Draft
          </button>

          <button
            type="button"
            onClick={() => handleSaveQuote(true)}
            disabled={saving}
            className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-primary-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save & Send Proposal'}
          </button>
        </div>
      </div>

      {/* Proposal Dispatch Modal when Save & Send is triggered */}
      {savedQuoteForSend && (
        <ProposalPreviewModal
          isOpen={!!savedQuoteForSend}
          onClose={() => {
            setSavedQuoteForSend(null);
            router.push(`/admin/quotes/${savedQuoteForSend.id}`);
          }}
          quoteId={savedQuoteForSend.id}
          quoteNumber={savedQuoteForSend.quoteNumber}
          customerName={formData.customerName}
          customerEmail={formData.customerEmail}
          customerPhone={formData.customerPhone}
          projectAddress={formData.projectAddress}
          projectType={formData.projectType}
          scopeDescription={formData.scopeDescription}
          areaM2={formData.tileSpecs.areaM2}
          subtotalExGst={savedQuoteForSend.subtotalExGst}
          gstAmount={savedQuoteForSend.gstAmount}
          totalIncGst={savedQuoteForSend.totalIncGst}
          proposalText={savedQuoteForSend.proposalText}
          tileLengthMm={formData.tileSpecs.tileLengthMm}
          tileWidthMm={formData.tileSpecs.tileWidthMm}
          tileThicknessMm={formData.tileSpecs.tileThicknessMm}
          groutJointMm={formData.tileSpecs.groutJointMm}
          isWetArea={formData.tileSpecs.isWetArea}
          onSendSuccess={() => {
            router.push(`/admin/quotes/${savedQuoteForSend.id}`);
          }}
        />
      )}
    </div>
  );
}

export default function NewQuotePage() {
  return (
    <Suspense fallback={<div className="text-center text-surface-400 py-20">Loading Quote Builder...</div>}>
      <NewQuoteBuilder />
    </Suspense>
  );
}
