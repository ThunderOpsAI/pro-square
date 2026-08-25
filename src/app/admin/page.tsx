'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  PhoneCall, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  ArrowUpRight, 
  Sparkles,
  RefreshCw,
  Layers,
  AlertCircle
} from 'lucide-react';

interface StatsResponse {
  totalQuotes: number;
  newQuotes: number;
  contactedQuotes: number;
  quotedQuotes: number;
  wonQuotes: number;
  lostQuotes: number;
  totalCallClicks: number;
  pipelineValue: number;
  statusDistribution: {
    NEW: number;
    CONTACTED: number;
    QUOTED: number;
    WON: number;
    LOST: number;
  };
}

interface RecentQuote {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  projectType: string;
  status: 'NEW' | 'CONTACTED' | 'QUOTED' | 'WON' | 'LOST';
  aiEstimateLow: number | null;
  aiEstimateHigh: number | null;
  createdAt: string;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [recentQuotes, setRecentQuotes] = useState<RecentQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Failed to load stats');
      const data = await res.json();
      setStats(data.stats);
      setRecentQuotes(data.recentQuotes || []);
    } catch (err: any) {
      setError(err.message || 'Error connecting to database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-950 text-blue-400 border-blue-800';
      case 'CONTACTED':
        return 'bg-amber-950 text-amber-400 border-amber-800';
      case 'QUOTED':
        return 'bg-purple-950 text-purple-400 border-purple-800';
      case 'WON':
        return 'bg-emerald-950 text-emerald-400 border-emerald-800';
      case 'LOST':
        return 'bg-red-950 text-red-400 border-red-800';
      default:
        return 'bg-surface-800 text-surface-400 border-surface-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-surface-400 mt-1">
            Real-time insights on leads, call analytics, and AI triage estimates.
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-surface-900 hover:bg-surface-800 border border-surface-800 rounded-xl text-sm font-medium text-surface-300 hover:text-white transition-all cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/50 border border-red-800 rounded-2xl flex items-center gap-3 text-red-300 text-sm">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Leads */}
        <div className="bg-surface-900 border border-surface-800/80 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-surface-400">Total Leads</span>
            <div className="p-2.5 bg-blue-950/60 border border-blue-800/50 rounded-xl">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white">
              {loading ? '—' : stats?.totalQuotes ?? 0}
            </span>
            <p className="text-xs text-blue-400 mt-1 font-medium flex items-center gap-1">
              <span>{stats?.newQuotes ?? 0} requiring action</span>
            </p>
          </div>
        </div>

        {/* Card 2: Pipeline Value */}
        <div className="bg-surface-900 border border-surface-800/80 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-surface-400">Est. Active Pipeline</span>
            <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/50 rounded-xl">
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white">
              {loading ? '—' : `$${(stats?.pipelineValue ?? 0).toLocaleString()} AUD`}
            </span>
            <p className="text-xs text-emerald-400 mt-1 font-medium">
              Calculated via Gemini AI triage
            </p>
          </div>
        </div>

        {/* Card 3: Call Clicks */}
        <div className="bg-surface-900 border border-surface-800/80 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-surface-400">Call-to-Dial Clicks</span>
            <div className="p-2.5 bg-amber-950/60 border border-amber-800/50 rounded-xl">
              <PhoneCall className="h-5 w-5 text-amber-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white">
              {loading ? '—' : stats?.totalCallClicks ?? 0}
            </span>
            <p className="text-xs text-amber-400 mt-1 font-medium">
              Direct phone inquiries
            </p>
          </div>
        </div>

        {/* Card 4: Won Projects */}
        <div className="bg-surface-900 border border-surface-800/80 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-surface-400">Jobs Won</span>
            <div className="p-2.5 bg-purple-950/60 border border-purple-800/50 rounded-xl">
              <CheckCircle className="h-5 w-5 text-purple-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white">
              {loading ? '—' : stats?.wonQuotes ?? 0}
            </span>
            <p className="text-xs text-purple-400 mt-1 font-medium">
              {stats?.totalQuotes ? `${Math.round(((stats.wonQuotes || 0) / stats.totalQuotes) * 100)}% conversion` : '0% conversion'}
            </p>
          </div>
        </div>

      </div>

      {/* Status Breakdown & AI Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Status Pipeline Distribution */}
        <div className="lg:col-span-2 bg-surface-900 border border-surface-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary-400" />
                Lead Status Pipeline
              </h2>
              <p className="text-xs text-surface-400 mt-0.5">Workflow distribution of current customer inquiries</p>
            </div>
            <Link
              href="/admin/leads"
              className="text-xs text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-1"
            >
              Open Pipeline &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'New', count: stats?.statusDistribution?.NEW ?? 0, color: 'border-blue-700/60 bg-blue-950/40 text-blue-400' },
              { label: 'Contacted', count: stats?.statusDistribution?.CONTACTED ?? 0, color: 'border-amber-700/60 bg-amber-950/40 text-amber-400' },
              { label: 'Quoted', count: stats?.statusDistribution?.QUOTED ?? 0, color: 'border-purple-700/60 bg-purple-950/40 text-purple-400' },
              { label: 'Won', count: stats?.statusDistribution?.WON ?? 0, color: 'border-emerald-700/60 bg-emerald-950/40 text-emerald-400' },
              { label: 'Lost', count: stats?.statusDistribution?.LOST ?? 0, color: 'border-red-700/60 bg-red-950/40 text-red-400' },
            ].map((item) => (
              <div key={item.label} className={`p-4 rounded-xl border ${item.color} text-center`}>
                <div className="text-2xl font-bold text-white">{item.count}</div>
                <div className="text-xs font-medium uppercase tracking-wider mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Triage Information Card */}
        <div className="bg-gradient-to-br from-primary-950/40 via-surface-900 to-surface-900 border border-primary-900/50 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-primary-400 mb-3">
              <Sparkles className="h-5 w-5" />
              <h3 className="font-bold text-white">Gemini AI Estimation</h3>
            </div>
            <p className="text-xs text-surface-300 leading-relaxed">
              Every incoming quote is automatically analyzed by <strong>Gemini 2.5 Flash</strong>. It extracts job scope, calculates non-binding AUD estimate ranges ($50-120/m²), and prepares draft responses for fast turnaround.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-surface-800 flex items-center justify-between text-xs">
            <span className="text-surface-400">Triage Engine: Active</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
              Ready
            </span>
          </div>
        </div>

      </div>

      {/* Recent Incoming Leads */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-surface-400" />
              Recent Quote Requests
            </h2>
            <p className="text-xs text-surface-400 mt-0.5">Latest customer submissions</p>
          </div>
          <Link
            href="/admin/leads"
            className="text-xs text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-1"
          >
            View All ({stats?.totalQuotes ?? 0}) &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-surface-400">Loading incoming inquiries...</div>
        ) : recentQuotes.length === 0 ? (
          <div className="py-12 text-center text-sm text-surface-400 bg-surface-950/40 rounded-xl border border-surface-800/60">
            No quote inquiries received yet. New submissions will appear here automatically.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-surface-400 border-b border-surface-800 bg-surface-950/30">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Est. Range</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800/60">
                {recentQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-surface-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{quote.firstName} {quote.lastName}</div>
                      <div className="text-xs text-surface-400">{quote.email} &bull; {quote.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium capitalize text-surface-200">
                      {quote.projectType}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusBadge(quote.status)}`}>
                        {quote.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-surface-300 font-mono text-xs">
                      {quote.aiEstimateLow && quote.aiEstimateHigh
                        ? `$${quote.aiEstimateLow.toLocaleString()} - $${quote.aiEstimateHigh.toLocaleString()}`
                        : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-surface-400">
                      {new Date(quote.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/leads?id=${quote.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-surface-800 hover:bg-surface-700 text-xs font-medium text-white rounded-lg transition-colors"
                      >
                        Inspect
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
