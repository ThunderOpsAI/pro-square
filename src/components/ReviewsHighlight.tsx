'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, ArrowRight, MessageSquareQuote } from 'lucide-react';
import { motion } from 'motion/react';

interface ReviewItem {
  id: string;
  customerName: string;
  starRating: number;
  reviewText: string;
  projectType: string | null;
  createdAt: string;
}

export function ReviewsHighlight() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reviews')
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (data.reviews && Array.isArray(data.reviews)) {
          setReviews(data.reviews);
        }
      })
      .catch((err) => {
        console.error('Failed to load reviews highlight:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading || reviews.length === 0) {
    return null;
  }

  const displayedReviews = reviews.slice(0, 4);

  return (
    <section className="py-12 relative z-10 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="inline-block py-1 px-3.5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold tracking-widest uppercase mb-2">
              Verified Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-surface-900">
              What Our Clients Say
            </h2>
          </div>
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors group"
          >
            <span>See All Reviews</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedReviews.map((rev) => (
            <motion.div
              key={rev.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-surface-200/80 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  {/* Star Rating */}
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rev.starRating ? 'fill-amber-400 text-amber-400' : 'text-surface-300'
                        }`}
                      />
                    ))}
                  </div>
                  <MessageSquareQuote className="w-5 h-5 text-primary-400/40" />
                </div>

                {rev.projectType && (
                  <span className="inline-block text-[11px] font-semibold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-md mb-2">
                    {rev.projectType}
                  </span>
                )}

                <p className="text-sm text-surface-700 leading-relaxed font-light line-clamp-4 italic">
                  &ldquo;{rev.reviewText}&rdquo;
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-surface-100 flex items-center justify-between">
                <span className="text-xs font-bold text-surface-900">{rev.customerName}</span>
                <span className="text-[10px] text-surface-400">
                  {new Date(rev.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
