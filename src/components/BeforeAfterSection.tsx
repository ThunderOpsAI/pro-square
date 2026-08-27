'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { SlidersHorizontal, MoveHorizontal, CheckCircle2, ShieldCheck, Layers, Sparkles } from 'lucide-react';

const COMPARISON_SETS = [
  {
    id: 'bath-hob',
    title: 'Bathtub Hob: Substrate Framing to Master Finish',
    subtitle: 'From timber framework & continuous waterproofing membrane to precision stone installation.',
    beforeImage: '/images/projects/project-03-tub-wip.jpg',
    beforeLabel: 'Phase 1: Substrate & Hob Prep',
    afterImage: '/images/projects/project-07-bath-corner.jpg',
    afterLabel: 'Phase 2: Completed Luxury Surround',
    milestones: [
      { step: '01', title: 'Engineered Subframe', desc: 'Structural timber support & fibre cement sheeting.' },
      { step: '02', title: 'AS 3740 Waterproofing', desc: 'Dual-coat polyurethane membrane with bond breakers.' },
      { step: '03', title: 'Laser-Level Alignment', desc: 'Micro-calibrated planes for zero tub lippage.' },
      { step: '04', title: 'Epoxy Grout Seal', desc: 'Anti-fungal, moisture-impervious grout finish.' },
    ]
  },
  {
    id: 'shower-drain',
    title: 'Walk-in Shower: Diagonal Screed Falls to Finished Slate',
    subtitle: 'Demonstrating the technical water falls engineered beneath before the sleek charcoal slate is laid.',
    beforeImage: '/images/projects/project-08-envelope-drain.jpg',
    beforeLabel: 'Phase 1: 4-Way Envelope Screed',
    afterImage: '/images/projects/project-02-charcoal-shower.jpg',
    afterLabel: 'Phase 2: Completed Shower Enclosure',
    milestones: [
      { step: '01', title: '1:60 Slope Screeding', desc: 'Precision water shedding to square smart waste.' },
      { step: '02', title: 'Envelope Diamond Cuts', desc: 'Radial cuts ensuring zero water pooling.' },
      { step: '03', title: 'Full Slab Cladding', desc: 'Floor-to-ceiling charcoal stone slabs.' },
      { step: '04', title: 'Brushed Fixture Seal', desc: 'Watertight silicone seals around mixers & shower.' },
    ]
  }
];

export function BeforeAfterSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [sliderPos, setSliderPos] = useState(50); // percentage 0 - 100
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeSet = COMPARISON_SETS[activeIdx];

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPos(percent);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      handleMove(e.clientX);
    }
  };

  return (
    <section className="py-32 bg-surface-100/70 relative overflow-hidden transition-colors duration-500">
      
      {/* Background Decor */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary-200/40 rounded-full blur-[140px] pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-amber-200/30 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary-100 text-primary-700 text-xs font-bold tracking-widest uppercase border border-primary-200/60 mb-4">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Transparent Craftsmanship
          </div>

          <h2 className="text-4xl font-bold tracking-tight text-surface-900 sm:text-5xl">
            The Anatomy of Precision
          </h2>

          <p className="mt-4 text-lg text-surface-600 font-light leading-relaxed">
            Flawless aesthetics depend on uncompromised structural prep. Slide below to compare our engineered subfloor waterproofing with the final master finish.
          </p>

          {/* Set Toggle Switcher */}
          <div className="mt-8 flex justify-center gap-3">
            {COMPARISON_SETS.map((set, idx) => (
              <button
                key={set.id}
                onClick={() => {
                  setActiveIdx(idx);
                  setSliderPos(50);
                }}
                className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 border ${
                  activeIdx === idx
                    ? 'bg-surface-900 text-white border-surface-900 shadow-md scale-105'
                    : 'bg-white text-surface-700 border-surface-200 hover:bg-surface-50'
                }`}
              >
                {set.title.split(':')[0]}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Interactive Draggable Split Viewer */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          ref={containerRef}
          onMouseDown={() => { isDragging.current = true; }}
          onMouseUp={() => { isDragging.current = false; }}
          onMouseLeave={() => { isDragging.current = false; }}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          className="relative w-full max-w-5xl mx-auto aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl shadow-surface-900/10 select-none cursor-ew-resize group"
        >
          {/* AFTER IMAGE (Background) */}
          <div className="absolute inset-0">
            <Image
              src={activeSet.afterImage}
              alt={activeSet.afterLabel}
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover"
            />
            {/* After Tag */}
            <div className="absolute top-5 right-5 z-20 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-surface-200 text-xs font-bold text-surface-900 shadow-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {activeSet.afterLabel}
            </div>
          </div>

          {/* BEFORE IMAGE (Clipped overlay) */}
          <div 
            style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
            className="absolute inset-0 z-10 transition-none"
          >
            <Image
              src={activeSet.beforeImage}
              alt={activeSet.beforeLabel}
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover brightness-95"
            />
            {/* Before Tag */}
            <div className="absolute top-5 left-5 z-20 px-4 py-1.5 rounded-full bg-surface-900/90 backdrop-blur-md border border-surface-700 text-xs font-bold text-white shadow-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {activeSet.beforeLabel}
            </div>
          </div>

          {/* DRAGGABLE DIVIDER LINE & HANDLE */}
          <div 
            style={{ left: `${sliderPos}%` }}
            className="absolute top-0 bottom-0 z-30 -translate-x-1/2 w-1 bg-white shadow-[0_0_15px_rgba(0,0,0,0.3)] pointer-events-none"
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 w-12 h-12 rounded-full bg-white text-surface-900 shadow-2xl flex items-center justify-center border-2 border-primary-500 group-hover:scale-110 transition-transform">
              <MoveHorizontal className="w-5 h-5 text-surface-900" />
            </div>
          </div>
        </motion.div>

        {/* Milestone Steps Breakdown Below */}
        <div className="mt-10 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeSet.milestones.map((m, idx) => (
            <div 
              key={idx}
              className="bg-white p-5 rounded-2xl border border-surface-200/80 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-md">
                  Step {m.step}
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <h4 className="text-sm font-bold text-surface-900">{m.title}</h4>
              <p className="text-xs text-surface-600 mt-1 font-light leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
