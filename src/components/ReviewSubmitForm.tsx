'use client';

import { useState } from 'react';
import { Star, CheckCircle2, AlertCircle, Loader2, Send } from 'lucide-react';

const PROJECT_TYPES = [
  'Bathroom & Ensuite Renovation',
  'Kitchen & Splashback',
  'Outdoor Patio & Alfresco',
  'Pool Coping & Mosaic',
  'Heritage & Victorian Tessellated',
  'Commercial / Architectural',
  'Other Tiling Project',
];

export function ReviewSubmitForm() {
  const [customerName, setCustomerName] = useState('');
  const [starRating, setStarRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [projectType, setProjectType] = useState('');
  const [reviewText, setReviewText] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (customerName.trim().length < 2) {
      setError('Please provide your name (at least 2 characters).');
      return;
    }

    if (reviewText.trim().length < 10) {
      setError('Please provide a review with at least 10 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          starRating,
          projectType: projectType || undefined,
          reviewText: reviewText.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setSubmitted(true);
      setCustomerName('');
      setStarRating(5);
      setProjectType('');
      setReviewText('');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="leave-review" className="py-16 relative z-10 scroll-mt-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 backdrop-blur-xl border border-surface-200 rounded-3xl p-8 sm:p-10 shadow-xl">
          
          <div className="text-center mb-8">
            <span className="inline-block py-1 px-3.5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold tracking-widest uppercase mb-2">
              Share Your Feedback
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-surface-900">
              Leave a Review
            </h2>
            <p className="mt-2 text-sm text-surface-600 font-light max-w-md mx-auto">
              Tell us about your experience working with Pro Square Tiling. We value your feedback!
            </p>
          </div>

          {submitted ? (
            <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-emerald-900">Thank You for Your Review!</h3>
              <p className="text-sm text-emerald-800 font-light max-w-md mx-auto">
                Your feedback has been received and will appear on our website once reviewed and approved by our team.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
              >
                Submit another review
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Star Rating Picker */}
              <div>
                <label className="block text-sm font-semibold text-surface-800 mb-2">
                  Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setStarRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-surface-300 hover:scale-110 transition-transform focus:outline-none cursor-pointer"
                      aria-label={`Rate ${star} out of 5 stars`}
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= (hoverRating || starRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-surface-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-3 text-sm font-bold text-surface-700">
                    {hoverRating || starRating} of 5 Stars
                  </span>
                </div>
              </div>

              {/* Customer Name */}
              <div>
                <label htmlFor="customerName" className="block text-sm font-semibold text-surface-800 mb-2">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="customerName"
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-4 py-3 bg-white border border-surface-300 rounded-xl text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-all shadow-sm"
                />
              </div>

              {/* Project Type */}
              <div>
                <label htmlFor="projectType" className="block text-sm font-semibold text-surface-800 mb-2">
                  Project Type <span className="text-xs text-surface-500 font-normal">(Optional)</span>
                </label>
                <select
                  id="projectType"
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-surface-300 rounded-xl text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-all shadow-sm cursor-pointer"
                >
                  <option value="">Select project type...</option>
                  {PROJECT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Review Text */}
              <div>
                <label htmlFor="reviewText" className="block text-sm font-semibold text-surface-800 mb-2">
                  Your Review <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="reviewText"
                  required
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share details of the tiling service, finish quality, and communication..."
                  maxLength={1000}
                  className="w-full px-4 py-3 bg-white border border-surface-300 rounded-xl text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-all shadow-sm resize-none"
                />
                <p className="mt-1 text-xs text-surface-400 text-right">
                  {reviewText.length} / 1000 characters
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-6 rounded-xl shadow-lg shadow-primary-600/30 text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-60 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting Review...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Review
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </section>
  );
}
