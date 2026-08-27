'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Crosshair, 
  SlidersHorizontal, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Ruler, 
  ChevronRight, 
  Layers, 
  ZoomIn,
  MoveHorizontal
} from 'lucide-react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

// ==========================================
// DATA DEFINITIONS
// ==========================================

const ROOM_BACKGROUNDS = [
  {
    id: 'outdoor-kitchen',
    name: 'Outdoor Kitchen & Pavilion',
    tag: 'Alfresco & Stone',
    image: '/images/projects/project-04-outdoor-kitchen.jpg',
    description: 'Rustic luxury outdoor cooking station with large-format porcelain slabs and subway splashbacks.',
    specs: {
      tileType: 'Large-Format Slate Slabs & Gloss Subway',
      subfloor: 'Reinforced Concrete Screed',
      specialty: 'Heat & weather resistant outdoor installation',
    }
  },
  {
    id: 'pool-alfresco',
    name: 'Resort Pool & Coping',
    tag: 'Exterior & Wet Area',
    image: '/images/projects/project-11-pool-alfresco.jpg',
    description: 'Seamless travertine stone coping with glass mosaic waterline tiling.',
    specs: {
      tileType: 'Travertine Pavers & Glass Waterline Mosaic',
      subfloor: 'Engineered Pool Bond Beam',
      specialty: 'Drop-face rebated coping & saltwater seal',
    }
  },
  {
    id: 'master-ensuite',
    name: 'Luxury Master Ensuite',
    tag: 'Full Bathroom Renovation',
    image: '/images/projects/project-13-master-ensuite.jpg',
    description: 'Floor-to-ceiling Calacatta gold porcelain slab wall tiling with herringbone floor layout.',
    specs: {
      tileType: 'Calacatta Gold Slabs & Timber-look Herringbone',
      subfloor: 'AS 3740 Dual-Layer Waterproof Membrane',
      specialty: 'Mitered external corners & curbless walk-in',
    }
  },
  {
    id: 'modern-kitchen',
    name: 'Architectural Kitchen',
    tag: 'Kitchen & Island Feature',
    image: '/images/projects/project-12-modern-kitchen.jpg',
    description: 'Bookmatched marble splashback paired with curved vertical fluted feature island tiles.',
    specs: {
      tileType: 'Bookmatched Porcelain & Terracotta Kit-Kat',
      subfloor: 'Acoustic Underlayment & Screed',
      specialty: 'Curved vertical wrap & precision cutouts',
    }
  },
  {
    id: 'mosaic-vanity',
    name: 'Mosaic Feature Vanity',
    tag: 'Feature Wall',
    image: '/images/projects/project-01-vanity-mosaic.jpg',
    description: 'Micro-marble penny round mosaic feature wall with arched mirror integration.',
    specs: {
      tileType: 'Marble Finger Penny Rounds',
      subfloor: 'Fibre Cement Sheet Prep',
      specialty: 'Zero-seam mosaic sheet interlocking',
    }
  },
  {
    id: 'heritage-veranda',
    name: 'Heritage Geometric Veranda',
    tag: 'Outdoor Living',
    image: '/images/projects/project-09-veranda-geometric.jpg',
    description: 'Intricate Victorian/Moroccan pattern tile layout with border cuts around brickwork.',
    specs: {
      tileType: 'Patterned Encaustic Porcelain',
      subfloor: 'External Graded Screed',
      specialty: 'Symmetrical pattern layout & border cuts',
    }
  },
];

const HOTSPOT_SCENES = [
  {
    id: 'outdoor-kitchen',
    title: 'Alfresco Kitchen Pavilion',
    image: '/images/projects/project-04-outdoor-kitchen.jpg',
    hotspots: [
      {
        id: 'splashback',
        x: 28,
        y: 48,
        title: 'Recessed Subway Splashback',
        category: 'Detail Work',
        description: 'White subway tile installed inside existing brick alcoves with expansion joins behind cooking stations.',
        standard: 'AS 3958.1 Thermal Expansion Tolerant'
      },
      {
        id: 'flooring',
        x: 52,
        y: 90,
        title: 'Seamless Stone Floor Slabs',
        category: 'Large Format',
        description: 'Heavy duty slip-rated porcelain slabs laid on calibrated screed to carry high-load cast iron ovens.',
        standard: 'R11 Non-Slip Outdoor Rating'
      },
      {
        id: 'hearth',
        x: 82,
        y: 54,
        title: 'Hearth Wall Integration',
        category: 'Masonry Interface',
        description: 'Flawless silicone junction between rustic exposed brickwork and precision porcelain.',
        standard: 'UV & Heat Rated High-Performance Sealant'
      }
    ]
  },
  {
    id: 'envelope-drain',
    title: 'Shower Waste Envelope Screed',
    image: '/images/projects/project-08-envelope-drain.jpg',
    hotspots: [
      {
        id: 'envelope-cuts',
        x: 50,
        y: 50,
        title: '4-Way Diagonal Falls',
        category: 'Master Craftsmanship',
        description: 'Diamond blade precision miter cuts creating a gradual 1:60 slope into the square smart floor waste without tile lippage.',
        standard: 'AS 3740 Water Drainage Compliance'
      },
      {
        id: 'smart-waste',
        x: 50,
        y: 48,
        title: 'Tile-Insert Smart Drain',
        category: 'Hardware Integration',
        description: 'Seamless tile-insert grate flush with surrounding screed for a clean invisible drainage finish.',
        standard: '316 Marine Grade Stainless Steel'
      },
      {
        id: 'wall-junction',
        x: 25,
        y: 20,
        title: 'Perimeter Movement Joint',
        category: 'Waterproofing Integrity',
        description: 'Flexible acoustic & movement buffer preventing cracking along wall-to-floor intersections.',
        standard: 'Class III Polyurethane Membrane'
      }
    ]
  },
  {
    id: 'niche-detail',
    title: 'Recessed Shower Niche',
    image: '/images/projects/project-06-niche-detail.jpg',
    hotspots: [
      {
        id: 'niche-trim',
        x: 48,
        y: 16,
        title: 'Anodized Aluminum Trim',
        category: 'Edge Finishing',
        description: 'Mitered 45-degree aluminum profile protecting external tile edges from chipping and moisture ingress.',
        standard: 'Corrosion-Proof Satin Finish'
      },
      {
        id: 'niche-shelf',
        x: 48,
        y: 84,
        title: 'Self-Draining Sill Fall',
        category: 'Water Shedding',
        description: 'Built with a subtle 3mm forward pitch ensuring water never ponds on the shelf surface.',
        standard: 'Positive Drainage Standard'
      }
    ]
  }
];

const BEFORE_AFTER_SETS = [
  {
    id: 'bath-hob',
    title: 'Bathtub Hob: Screed & Frame vs. Finished Luxury',
    subtitle: 'From timber subframe and cement sheet lining to polished stone perfection.',
    beforeImage: '/images/projects/project-03-tub-wip.jpg',
    beforeLabel: 'Phase 1: Framing & Substrate Prep',
    afterImage: '/images/projects/project-07-bath-corner.jpg',
    afterLabel: 'Phase 2: Completed Precision Finish',
    milestones: [
      'Engineered timber support & hob framing',
      'Continuous dual-coat waterproofing membrane with bond breakers',
      'Laser leveling for plumb vertical walls and flat tub lip',
      'Precision porcelain cuts with anti-fungal epoxy grout'
    ]
  },
  {
    id: 'shower-drain',
    title: 'Shower Enclosure: Screed Slopes vs. Finished Slate',
    subtitle: 'Demonstrating the technical falls underneath and the finished sleek walk-in shower.',
    beforeImage: '/images/projects/project-08-envelope-drain.jpg',
    beforeLabel: 'Phase 1: 4-Way Slope Screed Cuts',
    afterImage: '/images/projects/project-02-charcoal-shower.jpg',
    afterLabel: 'Phase 2: Completed Charcoal Shower Enclosure',
    milestones: [
      'Sub-floor screeding with 1:60 fall to waste',
      'Diagonal envelope diamond cuts for zero lippage',
      'Full floor-to-ceiling charcoal porcelain slab installation',
      'Brushed tapware fitting and star pattern decorative base'
    ]
  }
];

// ==========================================
// COMPONENT: MAIN PROTOTYPE SWITCHER
// ==========================================

function PrototypeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read variant from URL or default to 'room-selector'
  const variantParam = searchParams?.get('variant') || 'room-selector';
  const [activeVariant, setActiveVariant] = useState<'room-selector' | 'tile-inspector' | 'stage-slider'>(
    (variantParam as 'room-selector' | 'tile-inspector' | 'stage-slider') || 'room-selector'
  );

  const switchVariant = (newVariant: 'room-selector' | 'tile-inspector' | 'stage-slider') => {
    setActiveVariant(newVariant);
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('variant', newVariant);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Keyboard shortcut listener for fast toggling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1') switchVariant('room-selector');
      if (e.key === '2') switchVariant('tile-inspector');
      if (e.key === '3') switchVariant('stage-slider');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative min-h-[90vh] flex flex-col justify-between overflow-hidden bg-surface-950 text-white">
      {/* RENDER THE ACTIVE PROTOTYPE VARIANT */}
      <div className="relative flex-1 flex">
        {activeVariant === 'room-selector' && <RoomSelectorHero />}
        {activeVariant === 'tile-inspector' && <TileInspectorHero />}
        {activeVariant === 'stage-slider' && <StageSliderHero />}
      </div>

      {/* FLOATING PROTOTYPE CONTROLLER BAR (Bottom) */}
      <div className="sticky bottom-6 z-50 px-4 max-w-4xl mx-auto w-full pointer-events-auto">
        <div className="bg-surface-900/90 backdrop-blur-2xl border border-white/10 p-2.5 rounded-2xl shadow-2xl shadow-black/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Variant Label & Info */}
          <div className="flex items-center gap-3 px-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500"></span>
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-400">
                Interactive Background Prototype
              </p>
              <p className="text-xs text-surface-400 font-light hidden md:block">
                Press [1], [2], or [3] to toggle variations instantly
              </p>
            </div>
          </div>

          {/* Switcher Buttons */}
          <div className="flex items-center bg-surface-950/80 p-1 rounded-xl border border-white/5 w-full sm:w-auto">
            <button
              onClick={() => switchVariant('room-selector')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                activeVariant === 'room-selector'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                  : 'text-surface-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>1. Space Switcher</span>
            </button>

            <button
              onClick={() => switchVariant('tile-inspector')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                activeVariant === 'tile-inspector'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                  : 'text-surface-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>2. Craft Hotspots</span>
            </button>

            <button
              onClick={() => switchVariant('stage-slider')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                activeVariant === 'stage-slider'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                  : 'text-surface-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>3. Before & After</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InteractiveBackgroundPrototype() {
  return (
    <Suspense fallback={<div className="h-[90vh] bg-surface-950 flex items-center justify-center text-white">Loading Prototype...</div>}>
      <PrototypeContent />
    </Suspense>
  );
}

// ==========================================
// VARIANT 1: ROOM / SPACE SELECTOR HERO
// ==========================================

function RoomSelectorHero() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const activeRoom = ROOM_BACKGROUNDS[selectedIdx];

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * -30;
    const y = (e.clientY / window.innerHeight - 0.5) * -30;
    setMousePos({ x, y });
  };

  return (
    <div 
      className="relative w-full min-h-[90vh] flex items-center overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Background with Parallax and Crossfade */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-surface-950">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeRoom.id}
            initial={{ opacity: 0, scale: 1.12 }}
            animate={{ 
              opacity: 1, 
              scale: 1.04,
              x: mousePos.x,
              y: mousePos.y
            }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ 
              opacity: { duration: 0.9, ease: "easeInOut" },
              scale: { duration: 0.9, ease: "easeOut" },
              x: { type: "spring", stiffness: 45, damping: 35 },
              y: { type: "spring", stiffness: 45, damping: 35 }
            }}
            className="absolute -inset-12"
          >
            <Image
              src={activeRoom.image}
              alt={activeRoom.name}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-60 mix-blend-luminosity brightness-90 contrast-110"
            />
          </motion.div>
        </AnimatePresence>

        {/* Ambient Dark Gradient Overlays for Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-surface-950 via-surface-950/80 to-surface-950/30 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-transparent to-surface-950/40 z-10" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-600/20 blur-[160px] rounded-full pointer-events-none z-10" />
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 w-full z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Hero Text */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary-500/10 text-primary-400 text-xs font-bold tracking-widest uppercase border border-primary-500/20 mb-6 backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Precision Architectural Tiling
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08]"
            >
              Transforming <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-300 to-amber-200">
                {activeRoom.name}
              </span>
            </motion.h1>

            <motion.p 
              key={activeRoom.description}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-6 text-lg text-surface-300 max-w-xl font-light leading-relaxed"
            >
              {activeRoom.description}
            </motion.p>

            {/* Quick Interactive Space Switcher Pills */}
            <div className="mt-8 flex flex-wrap gap-2.5">
              {ROOM_BACKGROUNDS.map((room, idx) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedIdx(idx)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center gap-2 border ${
                    selectedIdx === idx
                      ? 'bg-white text-surface-950 border-white shadow-lg shadow-white/10 scale-105'
                      : 'bg-white/5 text-surface-300 border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${selectedIdx === idx ? 'bg-primary-600' : 'bg-surface-500'}`} />
                  {room.name}
                </button>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#quote"
                className="group inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold rounded-xl text-white bg-primary-600 hover:bg-primary-500 shadow-xl shadow-primary-600/30 transition-all duration-300 hover:scale-[1.02]"
              >
                Request Free Estimation
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#gallery"
                className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold rounded-xl text-surface-200 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 transition-all duration-300"
              >
                Explore All 13 Projects
              </a>
            </div>
          </div>

          {/* Right Column: Live Space Specification Card */}
          <div className="lg:col-span-5">
            <motion.div
              key={activeRoom.id}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-surface-900/80 backdrop-blur-xl border border-white/15 p-6 rounded-3xl shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                <div>
                  <span className="text-xs uppercase tracking-wider text-primary-400 font-bold">Space Breakdown</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{activeRoom.name}</h3>
                </div>
                <span className="px-3 py-1 bg-white/10 text-xs font-semibold rounded-full border border-white/10">
                  {activeRoom.tag}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary-500/10 border border-primary-500/20 text-primary-400 mt-0.5">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-surface-400">Material Specification</p>
                    <p className="text-sm font-medium text-white">{activeRoom.specs.tileType}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-surface-400">Substrate & Waterproofing</p>
                    <p className="text-sm font-medium text-white">{activeRoom.specs.subfloor}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 mt-0.5">
                    <Ruler className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-surface-400">Execution Craft</p>
                    <p className="text-sm font-medium text-white">{activeRoom.specs.specialty}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-surface-400">
                <span>Certified Australian Standard (AS 3958.1)</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 10-Yr Guarantee
                </span>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ==========================================
// VARIANT 2: TILE HOTSPOTS & INSPECTOR HERO
// ==========================================

function TileInspectorHero() {
  const [sceneIdx, setSceneIdx] = useState(0);
  const activeScene = HOTSPOT_SCENES[sceneIdx];
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(activeScene.hotspots[0].id);

  const selectedHotspot = activeScene.hotspots.find(h => h.id === activeHotspotId) || activeScene.hotspots[0];

  return (
    <div className="relative w-full min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image with Hotspot Overlays */}
      <div className="absolute inset-0 z-0 bg-surface-950">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeScene.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <Image
              src={activeScene.image}
              alt={activeScene.title}
              fill
              priority
              sizes="100vw"
              className="object-cover brightness-75 contrast-105"
            />
          </motion.div>
        </AnimatePresence>

        {/* Dark Vignette & Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-surface-950/90 via-surface-950/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-transparent to-surface-950/50 z-10" />
      </div>

      {/* Interactive Pulsing Hotspots Layer */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <div className="relative w-full h-full max-w-7xl mx-auto">
          {activeScene.hotspots.map((spot) => {
            const isActive = activeHotspotId === spot.id;
            return (
              <div
                key={spot.id}
                style={{ top: `${spot.y}%`, left: `${spot.x}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer"
                onClick={() => setActiveHotspotId(spot.id)}
              >
                <div className="relative flex items-center justify-center group">
                  {/* Radar Ripple */}
                  <span className={`animate-ping absolute inline-flex h-12 w-12 rounded-full ${isActive ? 'bg-primary-400 opacity-75' : 'bg-white/40 opacity-30'}`} />
                  
                  {/* Center Dot */}
                  <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                    isActive 
                      ? 'bg-primary-600 border-white text-white scale-125 shadow-xl shadow-primary-500/50' 
                      : 'bg-surface-900/80 border-primary-400/80 text-primary-400 group-hover:scale-110'
                  }`}>
                    <Crosshair className="w-4 h-4" />
                  </div>

                  {/* Floating Tag On Hover */}
                  <div className={`absolute left-10 whitespace-nowrap px-3 py-1 rounded-lg bg-surface-950/90 backdrop-blur-md border border-white/20 text-xs font-semibold text-white shadow-xl transition-all duration-300 ${
                    isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                  }`}>
                    {spot.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hero UI and Hotspot Detail Drawer */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 w-full z-30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          
          {/* Left Column: Heading & Scene Toggle */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary-500/20 text-primary-300 text-xs font-bold tracking-widest uppercase border border-primary-500/30 mb-6 backdrop-blur-md">
              <Crosshair className="w-3.5 h-3.5" />
              Interactive Craftsmanship Inspector
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
              Excellence is in the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-amber-300">
                Hidden Details
              </span>
            </h1>

            <p className="mt-4 text-base text-surface-300 max-w-xl font-light leading-relaxed">
              Click any pulsing marker on the project photography to inspect the screeding, water falls, expansion joints, and miter tolerances.
            </p>

            {/* Scene Selector Tabs */}
            <div className="mt-8 flex flex-wrap gap-3">
              {HOTSPOT_SCENES.map((scene, idx) => (
                <button
                  key={scene.id}
                  onClick={() => {
                    setSceneIdx(idx);
                    setActiveHotspotId(HOTSPOT_SCENES[idx].hotspots[0].id);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center gap-2 border ${
                    sceneIdx === idx
                      ? 'bg-primary-600 text-white border-primary-500 shadow-lg shadow-primary-600/30'
                      : 'bg-surface-900/60 backdrop-blur-md text-surface-300 border-white/10 hover:bg-surface-800'
                  }`}
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  {scene.title}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Selected Hotspot Inspection Card */}
          <div className="lg:col-span-5">
            <motion.div
              key={selectedHotspot.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-surface-950/85 backdrop-blur-2xl border border-primary-500/30 p-6 rounded-3xl shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary-600 text-white">
                    <Crosshair className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary-400">{selectedHotspot.category}</span>
                    <h3 className="text-base font-bold text-white">{selectedHotspot.title}</h3>
                  </div>
                </div>
              </div>

              <p className="text-sm text-surface-300 leading-relaxed font-light mb-5">
                {selectedHotspot.description}
              </p>

              <div className="bg-surface-900/80 rounded-2xl p-4 border border-white/5 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-surface-400 uppercase font-semibold">Standard & Quality Check</p>
                  <p className="text-xs font-medium text-emerald-300">{selectedHotspot.standard}</p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between text-xs text-surface-400">
                <span>Inspecting point {activeScene.hotspots.findIndex(h => h.id === selectedHotspot.id) + 1} of {activeScene.hotspots.length}</span>
                <button 
                  onClick={() => {
                    const currIndex = activeScene.hotspots.findIndex(h => h.id === selectedHotspot.id);
                    const nextIndex = (currIndex + 1) % activeScene.hotspots.length;
                    setActiveHotspotId(activeScene.hotspots[nextIndex].id);
                  }}
                  className="text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-1"
                >
                  Next Marker <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ==========================================
// VARIANT 3: BEFORE & AFTER STAGE SLIDER HERO
// ==========================================

function StageSliderHero() {
  const [activeSetIdx, setActiveSetIdx] = useState(0);
  const activeSet = BEFORE_AFTER_SETS[activeSetIdx];
  const [sliderPos, setSliderPos] = useState(50); // percentage 0 - 100
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
    <div className="relative w-full min-h-[90vh] flex flex-col justify-center overflow-hidden py-16">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-surface-950 z-0">
        <div className="absolute top-10 left-1/3 w-96 h-96 bg-primary-600/15 blur-[180px] rounded-full pointer-events-none" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20 my-auto">
        
        {/* Header Content */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary-500/10 text-primary-400 text-xs font-bold tracking-widest uppercase border border-primary-500/20 mb-4 backdrop-blur-md">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Stage by Stage Verification
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Substrate Preparation to Master Finish
          </h1>
          <p className="mt-3 text-sm sm:text-base text-surface-300 font-light">
            Drag the slider to reveal the underlying waterproofing & screed engineering vs. final result.
          </p>

          {/* Set Switcher */}
          <div className="mt-6 flex justify-center gap-3">
            {BEFORE_AFTER_SETS.map((set, idx) => (
              <button
                key={set.id}
                onClick={() => {
                  setActiveSetIdx(idx);
                  setSliderPos(50);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 border ${
                  activeSetIdx === idx
                    ? 'bg-primary-600 text-white border-primary-500 shadow-lg shadow-primary-600/25'
                    : 'bg-white/5 text-surface-400 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {set.title.split(':')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Draggable Split Canvas */}
        <div 
          ref={containerRef}
          onMouseDown={() => { isDragging.current = true; }}
          onMouseUp={() => { isDragging.current = false; }}
          onMouseLeave={() => { isDragging.current = false; }}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          className="relative w-full max-w-5xl mx-auto aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden border border-white/15 shadow-2xl select-none cursor-ew-resize group"
        >
          {/* AFTER IMAGE (Background - Full Width) */}
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
            <div className="absolute top-5 right-5 z-20 px-3.5 py-1.5 rounded-full bg-surface-950/80 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {activeSet.afterLabel}
            </div>
          </div>

          {/* BEFORE IMAGE (Clipped overlay based on sliderPos) */}
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
              className="object-cover brightness-90"
            />
            {/* Before Tag */}
            <div className="absolute top-5 left-5 z-20 px-3.5 py-1.5 rounded-full bg-surface-950/80 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {activeSet.beforeLabel}
            </div>
          </div>

          {/* DRAGGABLE DIVIDER LINE & HANDLE */}
          <div 
            style={{ left: `${sliderPos}%` }}
            className="absolute top-0 bottom-0 z-30 -translate-x-1/2 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] pointer-events-none"
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 w-11 h-11 rounded-full bg-white text-surface-950 shadow-2xl flex items-center justify-center border-2 border-primary-500 group-hover:scale-110 transition-transform">
              <MoveHorizontal className="w-5 h-5 text-surface-950" />
            </div>
          </div>
        </div>

        {/* Milestone Steps Below Slider */}
        <div className="mt-8 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeSet.milestones.map((milestone, idx) => (
            <div 
              key={idx}
              className="bg-surface-900/60 backdrop-blur-md border border-white/10 p-3.5 rounded-2xl flex items-start gap-3"
            >
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 text-xs font-bold shrink-0">
                {idx + 1}
              </span>
              <p className="text-xs text-surface-300 font-medium leading-snug">
                {milestone}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
