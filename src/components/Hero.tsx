'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ArrowRight, 
  PhoneCall, 
  ShieldCheck, 
  ChevronDown,
  Layers,
  Ruler,
  CheckCircle2,
  Flame,
  Waves,
  Bath,
  UtensilsCrossed,
  LayoutGrid,
  Landmark
} from 'lucide-react';

const SPACES = [
  {
    id: 'outdoor-kitchen',
    name: 'Outdoor Kitchen',
    icon: Flame,
    category: 'Alfresco & Stone',
    image: '/images/projects/project-04-outdoor-kitchen.jpg',
    headline: 'Seamless Outdoor Living & Hearth Craft',
    description: 'Rustic luxury outdoor cooking station with large-format porcelain slabs, custom alcove subway backsplashes, and integrated hearth junctions.',
    specs: {
      tileType: 'Large-Format Slate Slabs & Gloss Subway',
      subfloor: 'Reinforced Concrete Screed (1:80 Fall)',
      specialty: 'UV & thermal expansion heat-shielding',
    },
    accent: 'from-amber-500 to-orange-600'
  },
  {
    id: 'pool-alfresco',
    name: 'Resort Pool & Coping',
    icon: Waves,
    category: 'Pool & Exterior',
    image: '/images/projects/project-11-pool-alfresco.jpg',
    headline: 'Architectural Waterscapes & Travertine',
    description: 'Precision-cut travertine stone coping with drop-face rebated edges and iridescent glass mosaic waterline tiling.',
    specs: {
      tileType: 'Travertine Pavers & Glass Mosaics',
      subfloor: 'Engineered Pool Bond Beam Substrate',
      specialty: 'Drop-face rebated coping & saltwater seal',
    },
    accent: 'from-sky-500 to-blue-600'
  },
  {
    id: 'master-ensuite',
    name: 'Luxury Ensuite',
    icon: Bath,
    category: 'Master Bathroom',
    image: '/images/projects/project-13-master-ensuite.jpg',
    headline: 'Master Ensuite Sanctuary & Calacatta',
    description: 'Floor-to-ceiling Calacatta gold porcelain slab wall tiling paired with a seamless curbless walk-in shower and herringbone floor.',
    specs: {
      tileType: 'Calacatta Gold Slabs & Timber Herringbone',
      subfloor: 'Dual-Layer Polyurethane Membrane (AS 3740)',
      specialty: 'Mitered 45° external corners & curbless walk-in',
    },
    accent: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'modern-kitchen',
    name: 'Modern Kitchen',
    icon: UtensilsCrossed,
    category: 'Kitchen & Island',
    image: '/images/projects/project-12-modern-kitchen.jpg',
    headline: 'Contemporary Culinary Spaces',
    description: 'Bookmatched marble slab splashback seamlessly paired with a custom fluted curved kit-kat tile feature island.',
    specs: {
      tileType: 'Bookmatched Porcelain & Terracotta Kit-Kat',
      subfloor: 'Acoustic Membrane & Calibrated Screed',
      specialty: 'Curved vertical wrap & seamless benchtop joins',
    },
    accent: 'from-rose-500 to-amber-600'
  },
  {
    id: 'mosaic-vanity',
    name: 'Mosaic Vanity',
    icon: LayoutGrid,
    category: 'Feature Wall',
    image: '/images/projects/project-01-vanity-mosaic.jpg',
    headline: 'Artisanal Mosaic Detailing',
    description: 'Micro-marble penny round mosaic feature wall with flawless zero-seam sheet interlocking and arched mirror integration.',
    specs: {
      tileType: 'Marble Finger Penny Rounds',
      subfloor: 'Engineered Fibre Cement Sheet Prep',
      specialty: 'Zero-seam mosaic sheet interlocking',
    },
    accent: 'from-indigo-500 to-purple-600'
  },
  {
    id: 'heritage-veranda',
    name: 'Heritage Veranda',
    icon: Landmark,
    category: 'Heritage & Veranda',
    image: '/images/projects/project-09-veranda-geometric.jpg',
    headline: 'Timeless Victorian Symmetry',
    description: 'Intricate Victorian and Moroccan tessellated floor tile patterns with laser-aligned perimeter border cuts.',
    specs: {
      tileType: 'Patterned Encaustic Porcelain',
      subfloor: 'External Graded Screed with Fall',
      specialty: 'Symmetrical pattern layout & mitered borders',
    },
    accent: 'from-amber-600 to-stone-700'
  },
];

export function Hero() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showSpecs, setShowSpecs] = useState(false);
  const activeSpace = SPACES[selectedIdx];

  const phone = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '0467 551 492';
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  useEffect(() => {
    const timer = setInterval(() => {
      setSelectedIdx((prev) => (prev + 1) % SPACES.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative bg-surface-950 text-white min-h-[92vh] flex flex-col justify-between overflow-hidden">
      
      {/* FULL BLEED LUMINOUS PHOTO BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeSpace.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1.01 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <Image
              src={activeSpace.image}
              alt={activeSpace.name}
              fill
              priority
              sizes="100vw"
              className="object-cover brightness-[1.02] contrast-100"
            />
          </motion.div>
        </AnimatePresence>

        {/* Minimal natural top/bottom gradient allowing stone/tile photo details to pop */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/25 to-surface-950/80 z-10" />
      </div>

      {/* TOP: GRAND BRAND EMBLEM & HEADER BAR */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 w-full text-center">
        
        {/* Prominent Center Brand Lockup with distinct signature purple logo */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex flex-col sm:flex-row items-center gap-3.5 p-2 sm:px-5 sm:py-2.5 rounded-2xl sm:rounded-full bg-surface-900/90 backdrop-blur-xl border border-primary-500/30 shadow-2xl mx-auto mb-6"
        >
          <div className="rounded-xl overflow-hidden shadow-md border border-white/10 shrink-0">
            <Image
              src="/images/pro-square-logo.png"
              alt="Pro Square Tiling"
              width={200}
              height={70}
              className="h-9 sm:h-11 w-auto object-contain"
              priority
            />
          </div>
          <span className="hidden sm:block h-5 w-px bg-white/25" />
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-primary-300">
            Local Architectural & Luxury Tiling
          </span>
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          key={activeSpace.headline}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-6xl font-black tracking-tight text-white drop-shadow-lg max-w-4xl mx-auto leading-tight"
        >
          {activeSpace.headline}
        </motion.h1>

        <motion.p
          key={activeSpace.description}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-3 text-base sm:text-lg text-surface-100 max-w-2xl mx-auto font-medium drop-shadow-md bg-surface-950/50 p-2.5 rounded-xl backdrop-blur-md inline-block"
        >
          {activeSpace.description}
        </motion.p>
      </div>

      {/* BOTTOM: FLOATING CONTROL DOCK & SPEC ACCORDION */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 w-full">
        <div className="bg-surface-900/90 backdrop-blur-2xl border border-white/20 rounded-3xl p-4 sm:p-5 shadow-2xl ring-1 ring-white/10">
          
          {/* TOP ROW: SPACE PILLS & ACTION CTAs */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Space Navigation Chips */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              {SPACES.map((space, idx) => {
                const Icon = space.icon;
                const isSelected = selectedIdx === idx;
                return (
                  <button
                    key={space.id}
                    onClick={() => setSelectedIdx(idx)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/50 scale-105 ring-2 ring-primary-400'
                        : 'bg-white/10 hover:bg-white/20 text-surface-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{space.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setShowSpecs(!showSpecs)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-surface-200 border border-white/10 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <span>{showSpecs ? 'Hide Specs' : 'View Specs'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSpecs ? 'rotate-180' : ''}`} />
              </button>

              <a
                href="#quote"
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-600/30 flex items-center gap-1.5 transition-all hover:scale-105"
              >
                Free Quote
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              <a
                href={`tel:${cleanPhone}`}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-primary-300 border border-white/10"
                title={`Call ${phone}`}
              >
                <PhoneCall className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* EXPANDABLE SPEC DRAWER */}
          <AnimatePresence>
            {showSpecs && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3"
              >
                <div className="p-3 rounded-xl bg-surface-950/70 border border-white/10 flex items-center gap-3">
                  <Layers className="w-4 h-4 text-primary-400 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-surface-400">Material Specification</p>
                    <p className="text-xs font-semibold text-white">{activeSpace.specs.tileType}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface-950/70 border border-white/10 flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-surface-400">Substrate & Membrane</p>
                    <p className="text-xs font-semibold text-white">{activeSpace.specs.subfloor}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface-950/70 border border-white/10 flex items-center gap-3">
                  <Ruler className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-surface-400">Artisan Craft Detail</p>
                    <p className="text-xs font-semibold text-white">{activeSpace.specs.specialty}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

    </div>
  );
}
