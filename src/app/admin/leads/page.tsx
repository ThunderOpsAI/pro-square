'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Users, 
  Search, 
  RefreshCw, 
  Sparkles, 
  Check, 
  Copy, 
  X, 
  Mail, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  FileText,
  AlertCircle
} from 'lucide-react';

interface QuoteLead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  projectType: string;
  message: string;
  status: 'NEW' | 'CONTACTED' | 'QUOTED' | 'WON' | 'LOST';
  aiSummary: string | null;
  aiEstimateLow: number | null;
  aiEstimateHigh: number | null;
  aiDraftProposal: string | null;
  aiTriageStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  turnstileVerified: boolean;
  ipHash: string | null;
  source: string | null;
  createdAt: string;
  updatedAt: string;
}

const statusOptions = ['ALL', 'NEW', 'CONTACTED', 'QUOTED', 'WON', 'LOST'] as const;

function LeadsManager() {
  const searchParams = useSearchParams();
  const initialSelectedId = searchParams.get('id');

  const [leads, setLeads] = useState<QuoteLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLead, setSelectedLead] = useState<QuoteLead | null>(null);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchLeads = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      params.set('limit', '50');

      const res = await fetch(`/api/admin/leads?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch leads');
      const data = await res.json();
      setLeads(data.leads || []);

      if (initialSelectedId && !selectedLead) {
        const found = (data.leads || []).find((l: QuoteLead) => l.id === initialSelectedId);
        if (found) setSelectedLead(found);
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads();
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    setUpdatingId(leadId);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');
      const data = await res.json();

      setLeads((prev) =>
        prev.map((item) => (item.id === leadId ? { ...item, status: data.lead.status } : item))
      );

      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead((prev) => (prev ? { ...prev, status: data.lead.status } : null));
      }
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCopyDraft = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 3000);
  };

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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Users className="h-7 w-7 text-primary-500" />
            Leads & Quote Pipeline
          </h1>
          <p className="text-sm text-surface-400 mt-1">
            Manage incoming customer quote requests and review AI triage estimations.
          </p>
        </div>
        <button
          onClick={fetchLeads}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-surface-900 hover:bg-surface-800 border border-surface-800 rounded-xl text-sm font-medium text-surface-300 hover:text-white transition-all cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/50 border border-red-800 rounded-2xl flex items-center gap-3 text-red-300 text-sm">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
          {statusOptions.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
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
              placeholder="Search name, email, phone..."
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

      {/* Leads Table */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-16 text-center text-sm text-surface-400">Loading leads pipeline...</div>
        ) : leads.length === 0 ? (
          <div className="py-16 text-center text-sm text-surface-400">
            No leads found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-surface-400 border-b border-surface-800 bg-surface-950/40">
                <tr>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Project Type</th>
                  <th className="py-3.5 px-4">AI Estimate</th>
                  <th className="py-3.5 px-4">Status Workflow</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800/60">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-surface-800/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white">{lead.firstName} {lead.lastName}</div>
                      <div className="text-xs text-surface-400 mt-0.5">{lead.email}</div>
                      <div className="text-xs text-surface-400">{lead.phone}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="capitalize font-medium text-surface-200">{lead.projectType}</span>
                      <p className="text-xs text-surface-400 truncate max-w-xs mt-0.5 font-light">
                        {lead.message}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      {lead.aiEstimateLow && lead.aiEstimateHigh ? (
                        <div>
                          <span className="font-mono text-xs text-emerald-400 font-semibold">
                            ${lead.aiEstimateLow.toLocaleString()} - ${lead.aiEstimateHigh.toLocaleString()}
                          </span>
                          <span className="block text-[10px] text-surface-400">AUD Ballpark</span>
                        </div>
                      ) : (
                        <span className="text-xs text-surface-500 italic">Pending triage</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={lead.status}
                        disabled={updatingId === lead.id}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`text-xs font-semibold py-1 px-3 rounded-lg border focus:outline-none transition-all cursor-pointer ${getStatusBadge(lead.status)}`}
                      >
                        <option value="NEW">NEW</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="QUOTED">QUOTED</option>
                        <option value="WON">WON</option>
                        <option value="LOST">LOST</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 text-xs text-surface-400 whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="px-3.5 py-1.5 bg-primary-600/90 hover:bg-primary-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
                      >
                        View & Triage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lead Detail Modal / Drawer */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-900 border border-surface-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-surface-800 pb-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-primary-400">Lead Inspection</span>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {selectedLead.firstName} {selectedLead.lastName}
                </h3>
                <div className="flex items-center gap-3 mt-2 text-xs text-surface-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(selectedLead.createdAt).toLocaleString()}
                  </span>
                  {selectedLead.turnstileVerified && (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <ShieldCheck className="h-3.5 w-3.5" /> Bot Verified
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-2 text-surface-400 hover:text-white rounded-full bg-surface-800/60 hover:bg-surface-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Customer Contact & Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface-950/60 p-4 rounded-2xl border border-surface-800/80 text-sm">
              <div>
                <span className="text-xs text-surface-400 uppercase font-semibold">Contact</span>
                <div className="mt-1.5 space-y-1">
                  <a href={`mailto:${selectedLead.email}`} className="flex items-center gap-2 text-primary-400 hover:underline">
                    <Mail className="h-3.5 w-3.5" /> {selectedLead.email}
                  </a>
                  <a href={`tel:${selectedLead.phone}`} className="flex items-center gap-2 text-primary-400 hover:underline">
                    <Phone className="h-3.5 w-3.5" /> {selectedLead.phone}
                  </a>
                </div>
              </div>
              <div>
                <span className="text-xs text-surface-400 uppercase font-semibold">Service Requested</span>
                <div className="mt-1.5 font-medium capitalize text-white">
                  {selectedLead.projectType} Tiling
                </div>
                <div className="text-xs text-surface-400 mt-1">
                  Status:{' '}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(selectedLead.status)}`}>
                    {selectedLead.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer's Project Message */}
            <div className="bg-surface-950/40 p-4 rounded-2xl border border-surface-800/80">
              <span className="text-xs text-surface-400 uppercase font-semibold flex items-center gap-1.5 mb-2">
                <FileText className="h-4 w-4" /> Customer Description
              </span>
              <p className="text-sm text-surface-200 leading-relaxed whitespace-pre-wrap">
                {selectedLead.message}
              </p>
            </div>

            {/* Gemini AI Triage Section */}
            <div className="bg-gradient-to-br from-emerald-950/30 via-surface-950 to-surface-950 border border-emerald-800/50 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-bold text-sm">Gemini AI Estimation & Triage</span>
                </div>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  AI Model 2.5 Flash
                </span>
              </div>

              {selectedLead.aiSummary ? (
                <>
                  <div>
                    <span className="text-xs text-surface-400 font-medium">Scope Summary:</span>
                    <p className="text-sm text-surface-200 mt-0.5">{selectedLead.aiSummary}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-surface-800">
                    <div>
                      <span className="text-xs text-surface-400">Estimated Price Range:</span>
                      <div className="font-mono text-base font-bold text-emerald-400 mt-0.5">
                        ${selectedLead.aiEstimateLow?.toLocaleString()} - ${selectedLead.aiEstimateHigh?.toLocaleString()} AUD
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-surface-400">AI Triage Status:</span>
                      <div className="text-xs font-semibold text-emerald-400 mt-1">
                        Completed
                      </div>
                    </div>
                  </div>

                  {selectedLead.aiDraftProposal && (
                    <div className="pt-3 border-t border-surface-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-surface-300">Generated Email Reply Draft:</span>
                        <button
                          type="button"
                          onClick={() => handleCopyDraft(selectedLead.aiDraftProposal!)}
                          className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                        >
                          {copiedDraft ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          {copiedDraft ? 'Copied to Clipboard' : 'Copy Draft'}
                        </button>
                      </div>
                      <div className="p-3 bg-surface-950 rounded-xl border border-surface-800 text-xs text-surface-300 leading-relaxed font-sans whitespace-pre-wrap">
                        {selectedLead.aiDraftProposal}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-surface-400 italic">
                  AI triage analysis is not available for this inquiry.
                </p>
              )}
            </div>

            {/* Convert to Detailed Quote CTA */}
            <div className="bg-primary-950/40 border border-primary-800/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary-400" />
                  Convert Lead to Formal Quote
                </h4>
                <p className="text-xs text-surface-400 mt-0.5">
                  Launch the interactive material & glue/grout calculator pre-filled with this client's details.
                </p>
              </div>
              <a
                href={`/admin/quotes/new?leadId=${selectedLead.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
              >
                Build & Price Quote &rarr;
              </a>
            </div>

            {/* Quick Status Updater */}
            <div className="border-t border-surface-800 pt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-surface-400">Update Lead Workflow Status:</span>
              <div className="flex flex-wrap gap-2">
                {(['NEW', 'CONTACTED', 'QUOTED', 'WON', 'LOST'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(selectedLead.id, st)}
                    disabled={updatingId === selectedLead.id}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedLead.status === st
                        ? 'bg-white text-surface-950 border-white'
                        : 'bg-surface-800 text-surface-300 border-surface-700 hover:bg-surface-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function AdminLeadsPage() {
  return (
    <Suspense fallback={<div className="text-center text-surface-400 py-16">Loading pipeline...</div>}>
      <LeadsManager />
    </Suspense>
  );
}
