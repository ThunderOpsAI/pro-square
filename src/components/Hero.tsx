'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Ruler, 
  Layers, 
  Flame,
  Waves,
  Bath,
  UtensilsCrossed,
  LayoutGrid,
  Landmark,
  PhoneCall
} from 'lucide-react';

const SPACES = [
  {
    id: 'outdoor-kitchen',
    name: 'Outdoor Kitchen',
    icon: Flame,
    category: 'Alfresco & Stone',
    image: '/images/projects/project-04-outdoor-kitchen.jpg',
    headline: 'Seamless Outdoor Living',
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
    headline: 'Architectural Waterscapes',
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
    headline: 'Master Ensuite Sanctuary',
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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const activeSpace = SPACES[selectedIdx];

  const phone = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '0467 551 492';
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * -20;
    const y = (e.clientY / window.innerHeight - 0.5) * -20;
    setMousePos({ x, y });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setSelectedIdx((prev) => (prev + 1) % SPACES.length);
    }, 9000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div 
      className="relative bg-surface-950 overflow-hidden min-h-[86vh] flex items-center transition-colors duration-500"
      onMouseMove={handleMouseMove}
    >
      {/* BACKGROUND IMAGE & PARALLAX CANVAS */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeSpace.id}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ 
              opacity: 1, 
              scale: 1.03,
              x: mousePos.x,
              y: mousePos.y
            }}
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ 
              opacity: { duration: 0.8, ease: "easeInOut" },
              scale: { duration: 0.8, ease: "easeOut" },
              x: { type: "spring", stiffness: 35, damping: 30 },
              y: { type: "spring", stiffness: 35, damping: 30 }
            }}
            className="absolute -inset-8"
          >
            <Image
              src={activeSpace.image}
              alt={activeSpace.name}
              fill
              priority={selectedIdx === 0}
              sizes="100vw"
              className="object-cover brightness-75 contrast-105"
            />
          </motion.div>
        </AnimatePresence>

        {/* Tile Pattern Grid Overlay + Vignette Gradient */}
        <div className="absolute inset-0 bg-tile-pattern-dark opacity-30 z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-surface-950/90 via-surface-950/60 to-surface-950/40 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-transparent to-surface-950/60 z-10" />
        
        {/* Soft Ambient Radial Light */}
        <div className="absolute top-1/4 right-1/4 w-[450px] h-[450px] bg-primary-500/20 blur-[130px] rounded-full pointer-events-none z-10" />
      </div>

      {/* HERO CONTENT */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-12 w-full z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT: HEADLINE & SPACE CONTROLS */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/10 text-primary-300 text-xs font-bold tracking-widest uppercase border border-white/15 mb-4 backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary-400" />
              <span>Melbourne Architectural Tiling</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]"
            >
              Master Craftsmanship for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-300 to-amber-200">
                {activeSpace.name}
              </span>
            </motion.h1>

            <motion.p 
              key={activeSpace.description}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mt-4 text-base sm:text-lg text-surface-200 max-w-xl font-light leading-relaxed drop-shadow-sm"
            >
              {activeSpace.description}
            </motion.p>

            {/* SPACE SWITCHER BUTTONS */}
            <div className="mt-6">
              <div className="flex flex-wrap gap-2">
                {SPACES.map((space, idx) => {
                  const Icon = space.icon;
                  const isSelected = selectedIdx === idx;
                  return (
                    <button
                      key={space.id}
                      onClick={() => setSelectedIdx(idx)}
                      className={`group px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center gap-2 border cursor-pointer ${
                        isSelected
                          ? 'bg-primary-600 text-white border-primary-500 shadow-lg shadow-primary-600/40 scale-105'
                          : 'bg-surface-900/70 hover:bg-surface-800 text-surface-300 border-white/10 hover:border-white/20 backdrop-blur-md'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-primary-400'}`} />
                      <span>{space.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ACTION CTAs */}
            <div className="mt-8 flex flex-wrap gap-3.5">
              <a
                href="#quote"
                className="group inline-flex items-center justify-center px-7 py-3.5 text-sm sm:text-base font-semibold rounded-xl text-white bg-primary-600 hover:bg-primary-500 shadow-xl shadow-primary-600/30 transition-all duration-300 hover:scale-[1.02]"
              >
                Get a Free Quote
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
              </a>
              <a
                href={`tel:${cleanPhone}`}
                className="inline-flex items-center justify-center px-6 py-3.5 text-sm sm:text-base font-semibold rounded-xl text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 transition-all duration-300"
              >
                <PhoneCall className="mr-2 h-4 w-4 text-primary-400" />
                Call {phone}
              </a>
            </div>
          </div>

          {/* RIGHT: SPECIFICATION CARD */}
          <div className="lg:col-span-5">
            <motion.div
              key={activeSpace.id}
              initial={{ opacity: 0, x: 20, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="bg-surface-900/80 backdrop-blur-2xl border border-white/15 p-6 rounded-3xl shadow-2xl relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${activeSpace.accent}`} />

              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-primary-400 font-bold">
                    Project Breakdown
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {activeSpace.name}
                  </h3>
                </div>
                <span className="px-2.5 py-1 bg-white/10 text-surface-200 text-xs font-semibold rounded-full border border-white/10">
                  {activeSpace.category}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-surface-950/60 border border-white/5">
                  <div className="p-2 rounded-lg bg-primary-500/20 text-primary-400 shrink-0">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-surface-400">Material Specification</p>
                    <p className="text-xs font-medium text-white">{activeSpace.specs.tileType}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-surface-950/60 border border-white/5">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-surface-400">Substrate & Waterproofing</p>
                    <p className="text-xs font-medium text-white">{activeSpace.specs.subfloor}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-surface-950/60 border border-white/5">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                    <Ruler className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-surface-400">Master Craft Execution</p>
                    <p className="text-xs font-medium text-white">{activeSpace.specs.specialty}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-surface-400">
                <span>AS 3958.1 & AS 3740 Certified</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 10-Year Warranty
                </span>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
