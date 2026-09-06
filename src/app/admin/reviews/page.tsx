'use client';

import { useState, useEffect, Suspense } from 'react';
import { 
  Star, 
  RefreshCw, 
  Check, 
  X, 
  AlertCircle, 
  MessageSquare, 
  CheckCircle2, 
  XCircle,
  Calendar,
  User,
  Clock
} from 'lucide-react';

interface ReviewItem {
  id: string;
  customerName: string;
  starRating: number;
  reviewText: string;
  projectType: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
}

const statusOptions = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const;

function AdminReviewsManager() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [error, setError] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/reviews?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [statusFilter]);

  const handleStatusUpdate = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update review status');
      }

      const data = await res.json();

      setReviews((prev) =>
        prev.map((item) => (item.id === id ? data.review : item))
      );

      if (selectedReview && selectedReview.id === id) {
        setSelectedReview(data.review);
      }
    } catch (err: any) {
      alert(err.message || 'Error updating review status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: ReviewItem['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-950 text-amber-400 border-amber-800';
      case 'APPROVED':
        return 'bg-emerald-950 text-emerald-400 border-emerald-800';
      case 'REJECTED':
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
            <MessageSquare className="h-7 w-7 text-primary-500" />
            Customer Reviews Moderation
          </h1>
          <p className="text-sm text-surface-400 mt-1">
            Review, approve, or reject public client feedback submitted on the website.
          </p>
        </div>
        <button
          onClick={fetchReviews}
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

      {/* Filter Tabs */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto">
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
        <div className="text-xs text-surface-400 font-medium">
          Total: <span className="text-white font-bold">{reviews.length}</span>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-16 text-center text-sm text-surface-400">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center text-sm text-surface-400">
            No reviews found matching status: <span className="font-semibold text-white">{statusFilter}</span>.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-surface-400 border-b border-surface-800 bg-surface-950/40">
                <tr>
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Review Text</th>
                  <th className="py-3.5 px-4">Project Type</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800/60">
                {reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-surface-800/30 transition-colors">
                    <td className="py-4 px-4 font-semibold text-white whitespace-nowrap">
                      {rev.customerName}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.starRating ? 'fill-amber-400 text-amber-400' : 'text-surface-700'
                            }`}
                          />
                        ))}
                        <span className="ml-1.5 text-xs font-mono text-surface-300 font-bold">
                          {rev.starRating}/5
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 max-w-xs sm:max-w-md">
                      <p 
                        onClick={() => setSelectedReview(rev)}
                        className="text-xs text-surface-300 truncate cursor-pointer hover:text-white"
                        title="Click to read full review"
                      >
                        {rev.reviewText}
                      </p>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      {rev.projectType ? (
                        <span className="px-2 py-0.5 text-xs rounded-md bg-surface-800 text-surface-300 border border-surface-700">
                          {rev.projectType}
                        </span>
                      ) : (
                        <span className="text-xs text-surface-500 italic">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider border ${getStatusBadge(rev.status)}`}>
                        {rev.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-surface-400 whitespace-nowrap">
                      {new Date(rev.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      {rev.status === 'PENDING' ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleStatusUpdate(rev.id, 'APPROVED')}
                            disabled={updatingId === rev.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                            title="Approve review"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(rev.id, 'REJECTED')}
                            disabled={updatingId === rev.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                            title="Reject review"
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => setSelectedReview(rev)}
                            className="px-3 py-1 text-xs text-surface-400 hover:text-white bg-surface-800 hover:bg-surface-700 rounded-lg transition-colors cursor-pointer"
                          >
                            View
                          </button>
                          {rev.status === 'APPROVED' && (
                            <button
                              onClick={() => handleStatusUpdate(rev.id, 'REJECTED')}
                              disabled={updatingId === rev.id}
                              className="px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                              title="Revoke approval"
                            >
                              Reject
                            </button>
                          )}
                          {rev.status === 'REJECTED' && (
                            <button
                              onClick={() => handleStatusUpdate(rev.id, 'APPROVED')}
                              disabled={updatingId === rev.id}
                              className="px-2 py-1 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
                              title="Re-approve"
                            >
                              Approve
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-900 border border-surface-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 relative space-y-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-surface-800 pb-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-primary-400">Review Details</span>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {selectedReview.customerName}
                </h3>
                <div className="flex items-center gap-3 mt-2 text-xs text-surface-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(selectedReview.createdAt).toLocaleString()}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(selectedReview.status)}`}>
                    {selectedReview.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedReview(null)}
                className="p-2 text-surface-400 hover:text-white rounded-full bg-surface-800/60 hover:bg-surface-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < selectedReview.starRating ? 'fill-amber-400 text-amber-400' : 'text-surface-700'
                  }`}
                />
              ))}
              <span className="ml-2 font-bold text-white text-sm">{selectedReview.starRating} of 5 Stars</span>
            </div>

            {selectedReview.projectType && (
              <div className="bg-surface-950/60 p-3 rounded-xl border border-surface-800 text-xs">
                <span className="text-surface-400">Project Type:</span>{' '}
                <span className="text-white font-medium">{selectedReview.projectType}</span>
              </div>
            )}

            <div className="bg-surface-950 p-4 rounded-2xl border border-surface-800">
              <span className="text-xs text-surface-400 uppercase font-semibold block mb-2">Review Content:</span>
              <p className="text-sm text-surface-200 leading-relaxed whitespace-pre-wrap">
                {selectedReview.reviewText}
              </p>
            </div>

            {selectedReview.approvedAt && (
              <div className="text-xs text-surface-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Approved at: {new Date(selectedReview.approvedAt).toLocaleString()}
              </div>
            )}

            <div className="border-t border-surface-800 pt-4 flex items-center justify-end gap-3">
              <button
                onClick={() => handleStatusUpdate(selectedReview.id, 'REJECTED')}
                disabled={updatingId === selectedReview.id || selectedReview.status === 'REJECTED'}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Reject
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedReview.id, 'APPROVED')}
                disabled={updatingId === selectedReview.id || selectedReview.status === 'APPROVED'}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AdminReviewsPage() {
  return (
    <Suspense fallback={<div className="text-center text-surface-400 py-16">Loading moderation pipeline...</div>}>
      <AdminReviewsManager />
    </Suspense>
  );
}
