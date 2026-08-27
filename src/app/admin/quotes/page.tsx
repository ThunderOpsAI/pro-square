'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calculator,
  Search,
  RefreshCw,
  Plus,
  ArrowUpRight,
  Send,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { ProposalPreviewModal } from '@/components/admin/quotes/ProposalPreviewModal';

interface DetailedQuoteItem {
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
  tileLengthMm: number | null;
  tileWidthMm: number | null;
  tileThicknessMm: number | null;
  groutJointMm: number | null;
  isWetArea: boolean;
  materialCost: number;
  labourCost: number;
  subtotalExGst: number;
  gstAmount: number;
  totalIncGst: number;
  profitMarginPercent: number;
  markupPercent: number;
  grossProfit: number;
  proposalText: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
  lead?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

const statusOptions = ['ALL', 'DRAFT', 'SENT', 'WON', 'LOST', 'INVOICED', 'PAID'] as const;

function QuotesTableManager() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<DetailedQuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuotes, setTotalQuotes] = useState(0);
  const [error, setError] = useState('');

  // Proposal modal state
  const [previewQuote, setPreviewQuote] = useState<DetailedQuoteItem | null>(null);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      params.set('page', currentPage.toString());
      params.set('limit', '15');

      const res = await fetch(`/api/admin/quotes?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch quotes');
      const data = await res.json();

      setQuotes(data.quotes || []);
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages || 1);
        setTotalQuotes(data.pagination.total || 0);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error fetching quotes';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, currentPage]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchQuotes();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
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

  const getMarginBadgeClass = (margin: number) => {
    if (margin >= 30) return 'text-emerald-400 font-bold';
    if (margin >= 20) return 'text-amber-400 font-bold';
    return 'text-red-400 font-bold';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Calculator className="h-7 w-7 text-primary-500" />
            Quotes & Estimator Pipeline
          </h1>
          <p className="text-sm text-surface-400 mt-1">
            Build precision tile estimates, track profit margins, and dispatch proposals to clients.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchQuotes}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-surface-900 hover:bg-surface-800 border border-surface-800 rounded-xl text-sm font-medium text-surface-300 hover:text-white transition-all cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <Link
            href="/admin/quotes/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-600/30 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Create New Quote
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/50 border border-red-800 rounded-2xl flex items-center gap-3 text-red-300 text-sm">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
          {statusOptions.map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === s
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-surface-800/60 text-surface-400 hover:text-white hover:bg-surface-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1 md:w-72">
            <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search quote #, customer, project..."
              className="w-full pl-10 pr-4 py-2 bg-surface-950 border border-surface-700/80 rounded-xl text-xs text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Quotes Table */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center text-sm text-surface-400 flex flex-col items-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin text-primary-500" />
            <span>Loading quotes ledger...</span>
          </div>
        ) : quotes.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <FileSpreadsheet className="h-10 w-10 text-surface-600 mx-auto" />
            <div className="text-base font-semibold text-white">No quotes found</div>
            <p className="text-xs text-surface-400 max-w-sm mx-auto">
              No quotes match your filter criteria. Create your first quote with the real-time tile calculator!
            </p>
            <Link
              href="/admin/quotes/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              New Quote
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-surface-400 border-b border-surface-800 bg-surface-950/40">
                <tr>
                  <th className="py-3.5 px-4">Quote #</th>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Project / Area</th>
                  <th className="py-3.5 px-4">Total (Inc GST)</th>
                  <th className="py-3.5 px-4">Margin %</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800/60">
                {quotes.map((quote) => (
                  <tr
                    key={quote.id}
                    className="hover:bg-surface-800/30 transition-colors group cursor-pointer"
                    onClick={() => router.push(`/admin/quotes/${quote.id}`)}
                  >
                    {/* Quote # */}
                    <td className="py-4 px-4">
                      <span className="font-mono font-bold text-primary-400 group-hover:underline">
                        {quote.quoteNumber}
                      </span>
                      {quote.leadId && (
                        <span className="block text-[10px] text-surface-500 mt-0.5">
                          From Lead #{quote.leadId.slice(-4)}
                        </span>
                      )}
                    </td>

                    {/* Customer Name */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white">{quote.customerName}</div>
                      <div className="text-xs text-surface-400 mt-0.5">{quote.customerEmail}</div>
                      {quote.customerPhone && (
                        <div className="text-xs text-surface-500">{quote.customerPhone}</div>
                      )}
                    </td>

                    {/* Project & Area */}
                    <td className="py-4 px-4">
                      <div className="font-medium text-surface-200 capitalize">
                        {quote.projectType}
                      </div>
                      <div className="text-xs text-surface-400 mt-0.5 font-mono">
                        {quote.areaM2} m² {quote.isWetArea ? '(Wet Area)' : ''}
                      </div>
                    </td>

                    {/* Total Price */}
                    <td className="py-4 px-4">
                      <div className="font-mono text-sm font-bold text-white">
                        ${quote.totalIncGst.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-surface-400 font-mono">
                        ${quote.subtotalExGst.toLocaleString()} ex GST
                      </div>
                    </td>

                    {/* Margin % */}
                    <td className="py-4 px-4">
                      <span className={`font-mono text-xs ${getMarginBadgeClass(quote.profitMarginPercent)}`}>
                        {quote.profitMarginPercent}%
                      </span>
                      <span className="block text-[10px] text-surface-500 font-mono">
                        +${Math.round(quote.grossProfit).toLocaleString()} profit
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(
                          quote.status
                        )}`}
                      >
                        {quote.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-xs text-surface-400 whitespace-nowrap font-mono">
                      {new Date(quote.createdAt).toLocaleDateString('en-AU', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td
                      className="py-4 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewQuote(quote)}
                          title="Send Proposal Email"
                          className="p-1.5 bg-surface-800 hover:bg-primary-600 text-surface-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>

                        <Link
                          href={`/admin/quotes/${quote.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-surface-800 hover:bg-surface-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                        >
                          Inspect
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 bg-surface-950/60 border-t border-surface-800 flex items-center justify-between text-xs text-surface-400">
            <div>
              Showing Page <strong className="text-white">{currentPage}</strong> of{' '}
              <strong className="text-white">{totalPages}</strong> ({totalQuotes} total quotes)
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-surface-800 hover:bg-surface-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 bg-surface-800 hover:bg-surface-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Proposal Preview Modal */}
      {previewQuote && (
        <ProposalPreviewModal
          isOpen={!!previewQuote}
          onClose={() => setPreviewQuote(null)}
          quoteId={previewQuote.id}
          quoteNumber={previewQuote.quoteNumber}
          customerName={previewQuote.customerName}
          customerEmail={previewQuote.customerEmail}
          customerPhone={previewQuote.customerPhone}
          projectAddress={previewQuote.projectAddress}
          projectType={previewQuote.projectType}
          scopeDescription={previewQuote.scopeDescription}
          areaM2={previewQuote.areaM2}
          subtotalExGst={previewQuote.subtotalExGst}
          gstAmount={previewQuote.gstAmount}
          totalIncGst={previewQuote.totalIncGst}
          proposalText={previewQuote.proposalText}
          tileLengthMm={previewQuote.tileLengthMm}
          tileWidthMm={previewQuote.tileWidthMm}
          tileThicknessMm={previewQuote.tileThicknessMm}
          groutJointMm={previewQuote.groutJointMm}
          isWetArea={previewQuote.isWetArea}
          onSendSuccess={() => {
            fetchQuotes();
          }}
        />
      )}
    </div>
  );
}

export default function AdminQuotesPage() {
  return (
    <Suspense fallback={<div className="text-center text-surface-400 py-20">Loading quotes...</div>}>
      <QuotesTableManager />
    </Suspense>
  );
}
