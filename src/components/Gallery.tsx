'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { MoveHorizontal, CheckCircle2, SlidersHorizontal, LayoutGrid } from 'lucide-react';

const categories = ['All', 'Bathrooms', 'Kitchen & Alfresco', 'Outdoor & Verandas'] as const;
type Category = typeof categories[number];

const projectGallery = [
  {
    id: 1,
    src: '/images/projects/project-04-outdoor-kitchen.jpg',
    alt: 'Outdoor Kitchen & Brick Hearth Pavilion',
    category: 'Kitchen & Alfresco',
    tag: 'Large Format Stone & Subway'
  },
  {
    id: 2,
    src: '/images/projects/project-11-pool-alfresco.jpg',
    alt: 'Resort Swimming Pool & Travertine Coping',
    category: 'Outdoor & Verandas',
    tag: 'Travertine Pavers & Glass Waterline'
  },
  {
    id: 3,
    src: '/images/projects/project-13-master-ensuite.jpg',
    alt: 'Luxury Master Ensuite with Calacatta Slabs',
    category: 'Bathrooms',
    tag: 'Calacatta Porcelain & Herringbone Floor'
  },
  {
    id: 4,
    src: '/images/projects/project-01-vanity-mosaic.jpg',
    alt: 'Arched Vanity with Penny Round Mosaic Feature Wall',
    category: 'Bathrooms',
    tag: 'Marble Penny Mosaic'
  },
  {
    id: 5,
    src: '/images/projects/project-12-modern-kitchen.jpg',
    alt: 'Modern Kitchen Island with Curved Fluted Tile Base',
    category: 'Kitchen & Alfresco',
    tag: 'Bookmatched Slabs & Kit-Kat Tiles'
  },
  {
    id: 6,
    src: '/images/projects/project-09-veranda-geometric.jpg',
    alt: 'Front Porch Victorian Geometric Pattern Layout',
    category: 'Outdoor & Verandas',
    tag: 'Patterned Encaustic Tiles'
  },
];

const COMPARISON_SETS = [
  {
    id: 'bath-hob',
    title: 'Bathtub Hob: Substrate to Luxury Surround',
    beforeImage: '/images/projects/project-03-tub-wip.jpg',
    beforeLabel: 'Phase 1: Subframe & Screed',
    afterImage: '/images/projects/project-07-bath-corner.jpg',
    afterLabel: 'Phase 2: Polished Finish',
    milestones: ['Engineered Timber Subframe', 'AS 3740 Dual Waterproofing', 'Laser-Level Alignment', 'Epoxy Grout Seal']
  },
  {
    id: 'shower-drain',
    title: 'Walk-in Shower: Diagonal Falls to Finished Slate',
    beforeImage: '/images/projects/project-08-envelope-drain.jpg',
    beforeLabel: 'Phase 1: 4-Way Envelope Falls',
    afterImage: '/images/projects/project-02-charcoal-shower.jpg',
    afterLabel: 'Phase 2: Completed Slate Shower',
    milestones: ['1:60 Slope Screed to Waste', 'Radial Diamond Cuts', 'Floor-to-Ceiling Slabs', 'Watertight Perimeter Seals']
  }
];

export function Gallery() {
  const [viewMode, setViewMode] = useState<'gallery' | 'before-after'>('gallery');
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  
  // Before-After slider state
  const [activeSetIdx, setActiveSetIdx] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeSet = COMPARISON_SETS[activeSetIdx];

  const filteredProjects = activeCategory === 'All'
    ? projectGallery
    : projectGallery.filter(p => p.category === activeCategory);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPos(percent);
  };

  return (
    <section id="gallery" className="py-20 relative overflow-hidden transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-8">
        
        {/* Section Header with View Mode Toggle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <span className="inline-block py-1 px-3.5 rounded-full bg-primary-100 border border-primary-200 text-primary-700 text-xs font-bold tracking-widest uppercase mb-3">
              Proven Excellence
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-surface-900 transition-colors">
              Featured Work & Substrate Quality
            </h2>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-white/60 p-1 rounded-2xl border border-surface-300/60 self-start md:self-auto backdrop-blur-md">
            <button
              onClick={() => setViewMode('gallery')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'gallery'
                  ? 'bg-white text-surface-900 shadow-sm'
                  : 'text-surface-500 hover:text-surface-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Project Showcase</span>
            </button>
            <button
              onClick={() => setViewMode('before-after')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'before-after'
                  ? 'bg-white text-surface-900 shadow-sm'
                  : 'text-surface-500 hover:text-surface-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Substrate vs. Finish</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: CURATED PROJECT SHOWCASE */}
        {viewMode === 'gallery' && (
          <div>
            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-surface-900 text-white shadow-sm'
                      : 'bg-white text-surface-600 border border-surface-200 hover:bg-surface-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Compact 6-card Gallery Grid */}
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredProjects.map((image) => (
                  <motion.div 
                    key={image.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35 }}
                    className="group relative overflow-hidden rounded-3xl aspect-[16/11] bg-surface-100 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-400 border border-surface-200"
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-106"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-950/90 via-surface-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 ease-out">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="inline-block px-2.5 py-0.5 bg-primary-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                            {image.category}
                          </span>
                          <span className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-md text-white text-[10px] font-medium rounded-full">
                            {image.tag}
                          </span>
                        </div>
                        <p className="text-white font-semibold text-base leading-tight">
                          {image.alt}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        )}

        {/* VIEW 2: COMPACT BEFORE & AFTER SLIDER */}
        {viewMode === 'before-after' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-200 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-surface-900">{activeSet.title}</h3>
                <p className="text-xs text-surface-500">Drag handle left and right to verify the underlying substrate</p>
              </div>
              <div className="flex gap-2">
                {COMPARISON_SETS.map((set, idx) => (
                  <button
                    key={set.id}
                    onClick={() => { setActiveSetIdx(idx); setSliderPos(50); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer transition-colors ${
                      activeSetIdx === idx
                        ? 'bg-surface-900 text-white border-surface-900 shadow-sm'
                        : 'bg-surface-50 text-surface-600 border-surface-200 hover:bg-surface-100 hover:text-surface-900'
                    }`}
                  >
                    {set.id === 'bath-hob' ? 'Bathtub Hob' : 'Shower Screed'}
                  </button>
                ))}
              </div>
            </div>

            <div 
              ref={containerRef}
              onMouseDown={() => { isDragging.current = true; }}
              onMouseUp={() => { isDragging.current = false; }}
              onMouseLeave={() => { isDragging.current = false; }}
              onMouseMove={(e) => { if (isDragging.current) handleMove(e.clientX); }}
              onTouchMove={(e) => handleMove(e.touches[0].clientX)}
              className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden select-none cursor-ew-resize border border-surface-200 group shadow-sm"
            >
              <div className="absolute inset-0">
                <Image src={activeSet.afterImage} alt="After" fill className="object-cover" />
                <span className="absolute top-3 right-3 z-20 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-surface-900 shadow border border-surface-100">
                  {activeSet.afterLabel}
                </span>
              </div>
              <div 
                style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
                className="absolute inset-0 z-10"
              >
                <Image src={activeSet.beforeImage} alt="Before" fill className="object-cover" />
                <span className="absolute top-3 left-3 z-20 px-3 py-1 rounded-full bg-surface-900/90 backdrop-blur-md text-[11px] font-bold text-white shadow border border-surface-800">
                  {activeSet.beforeLabel}
                </span>
              </div>
              <div style={{ left: `${sliderPos}%` }} className="absolute top-0 bottom-0 z-30 -translate-x-1/2 w-1 bg-white shadow pointer-events-none">
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 w-9 h-9 rounded-full bg-white text-surface-900 shadow-xl flex items-center justify-center border-2 border-primary-500">
                  <MoveHorizontal className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {activeSet.milestones.map((m, i) => (
                <div key={i} className="p-3 rounded-xl bg-surface-50 border border-surface-100 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-medium text-surface-700">{m}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
