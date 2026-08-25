'use client';

import { useState, useEffect } from 'react';
import { PhoneCall, RefreshCw, Globe, Smartphone, Shield, Calendar, AlertCircle } from 'lucide-react';

interface CallLog {
  id: string;
  intent: string;
  referrer: string | null;
  userAgent: string | null;
  ipHash: string | null;
  createdAt: string;
}

export default function AdminCallLogsPage() {
  const [logs, setLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/call-logs?limit=50');
      if (!res.ok) throw new Error('Failed to fetch call logs');
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.pagination?.total || 0);
    } catch (err: any) {
      setError(err.message || 'Error loading call logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <PhoneCall className="h-7 w-7 text-amber-500" />
            Call-to-Dial Tracking Logs
          </h1>
          <p className="text-sm text-surface-400 mt-1">
            Real-time telemetry of users clicking click-to-call links across the website.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-surface-900 hover:bg-surface-800 border border-surface-800 rounded-xl text-sm font-medium text-surface-300 hover:text-white transition-all cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh ({total})
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/50 border border-red-800 rounded-2xl flex items-center gap-3 text-red-300 text-sm">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-16 text-center text-sm text-surface-400">Loading call activity...</div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-sm text-surface-400">
            No call clicks recorded yet. Clicks on header/footer phone links will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-surface-400 border-b border-surface-800 bg-surface-950/40">
                <tr>
                  <th className="py-3.5 px-4">Action & Intent</th>
                  <th className="py-3.5 px-4">Referrer / Source</th>
                  <th className="py-3.5 px-4">Client User Agent</th>
                  <th className="py-3.5 px-4">Anonymized IP Hash</th>
                  <th className="py-3.5 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800/60 font-sans">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-400 border border-amber-800/80">
                        <PhoneCall className="h-3 w-3" />
                        {log.intent}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-surface-300 max-w-xs truncate">
                      {log.referrer ? (
                        <span className="flex items-center gap-1">
                          <Globe className="h-3.5 w-3.5 text-surface-500 shrink-0" />
                          {log.referrer}
                        </span>
                      ) : (
                        <span className="text-surface-500">Direct navigation</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-surface-400 max-w-sm truncate">
                      <span className="flex items-center gap-1">
                        <Smartphone className="h-3.5 w-3.5 text-surface-500 shrink-0" />
                        {log.userAgent || 'Unknown Device'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-surface-400">
                      <span className="flex items-center gap-1">
                        <Shield className="h-3.5 w-3.5 text-surface-500" />
                        {log.ipHash || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs text-surface-400 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(log.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
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
