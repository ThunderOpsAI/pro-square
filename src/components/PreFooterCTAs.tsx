'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export function PreFooterCTAs() {
  return (
    <section className="py-10 relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Leave a Review */}
          <Link href="/reviews#leave-review" className="group block">
            <motion.div 
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="h-full p-6 sm:p-7 rounded-2xl bg-white/80 backdrop-blur border border-surface-200 shadow-sm hover:shadow-xl hover:border-primary-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-bold text-surface-900 group-hover:text-primary-600 transition-colors">
                  Leave a Review
                </h3>
                <p className="mt-2 text-sm text-surface-600 font-light leading-relaxed">
                  Share your experience with Pro Square Tiling.
                </p>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 group-hover:text-primary-700">
                <span>Write a review</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </Link>

          {/* Card 2: Request a Quote */}
          <Link href="/quote" className="group block">
            <motion.div 
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="h-full p-6 sm:p-7 rounded-2xl bg-white/80 backdrop-blur border border-surface-200 shadow-sm hover:shadow-xl hover:border-primary-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-bold text-surface-900 group-hover:text-primary-600 transition-colors">
                  Request a Quote
                </h3>
                <p className="mt-2 text-sm text-surface-600 font-light leading-relaxed">
                  Get a free, no-obligation estimate for your project.
                </p>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 group-hover:text-primary-700">
                <span>Get your estimate</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </Link>

        </div>
      </div>
    </section>
  );
}
