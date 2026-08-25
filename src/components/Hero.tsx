'use client';

import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

const backgrounds = [
  { id: 1, url: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&q=80&w=2070', label: 'Bright Modern' },
  { id: 2, url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&q=80&w=2070', label: 'Cool Slate' },
  { id: 3, url: 'https://images.unsplash.com/photo-1552858725-2758b5fb1286?auto=format&fit=crop&q=80&w=2070', label: 'Classic Marble' },
  { id: 4, url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2070', label: 'Deep Charcoal' },
];

export function Hero() {
  const [currentBg, setCurrentBg] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * -40;
    const y = (e.clientY / window.innerHeight - 0.5) * -40;
    setMousePos({ x, y });
  };

  const nextBg = () => setCurrentBg((prev) => (prev + 1) % backgrounds.length);
  const prevBg = () => setCurrentBg((prev) => (prev - 1 + backgrounds.length) % backgrounds.length);

  useEffect(() => {
    const timer = setInterval(nextBg, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div 
      className="relative bg-surface-50 overflow-hidden min-h-screen flex items-center transition-colors duration-500"
      onMouseMove={handleMouseMove}
    >
      <div className="absolute inset-0 z-0 overflow-hidden bg-surface-900">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentBg}
            initial={{ opacity: 0, scale: 1.15 }}
            animate={{ 
              opacity: 1, 
              scale: 1.05,
              x: mousePos.x,
              y: mousePos.y
            }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ 
              opacity: { duration: 1.2, ease: "easeInOut" },
              scale: { duration: 1.2, ease: "easeOut" },
              x: { type: "spring", stiffness: 40, damping: 30 },
              y: { type: "spring", stiffness: 40, damping: 30 }
            }}
            className="absolute -inset-10"
          >
            <Image
              src={backgrounds[currentBg].url}
              alt={backgrounds[currentBg].label}
              fill
              priority={currentBg === 0}
              sizes="100vw"
              className="object-cover opacity-50 mix-blend-overlay"
            />
          </motion.div>
        </AnimatePresence>
        
        <div className="absolute inset-0 bg-gradient-to-r from-surface-50 via-surface-50/90 to-surface-50/20 z-10" />
        
        {/* Subtle light effect */}
        <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-primary-200/40 blur-[150px] rounded-full mix-blend-multiply pointer-events-none transition-colors z-10" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 mt-16 w-full z-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <span className="inline-block py-1.5 px-4 rounded-full bg-primary-100 text-primary-600 text-sm font-bold tracking-widest uppercase border border-primary-200 mb-8 shadow-sm transition-colors">
              Premium Craftsmanship
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-surface-900 tracking-tight leading-[1.1] transition-colors"
          >
            Precision Tiling for Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">Dream Space</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-8 text-lg md:text-xl text-surface-600 max-w-xl leading-relaxed font-light transition-colors"
          >
            Expert installation of ceramic, porcelain, and natural stone for residential and commercial projects. Quality craftsmanship that lasts a lifetime.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="mt-12 flex flex-col sm:flex-row gap-5"
          >
            <a
              href="#quote"
              className="group inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl text-white bg-primary-600 hover:bg-primary-500 shadow-[0_0_40px_-10px_var(--color-primary-500)] hover:shadow-[0_0_60px_-15px_var(--color-primary-500)] transition-all duration-300"
            >
              Get a Free Quote
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1.5 transition-transform duration-300" />
            </a>
            <a
              href="#gallery"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl text-surface-900 bg-white/60 hover:bg-white backdrop-blur-md border border-surface-200 shadow-sm transition-all duration-300"
            >
              View Our Work
            </a>
          </motion.div>
        </div>
      </div>

      {/* Interactive Slider Controls */}
      <div className="absolute bottom-10 left-0 right-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex gap-3">
            {backgrounds.map((bg, idx) => (
              <button 
                key={bg.id}
                onClick={() => setCurrentBg(idx)}
                aria-label={`View background ${bg.label}`}
                className="group flex flex-col items-start gap-2"
              >
                <div className={`h-1.5 rounded-full transition-all duration-500 ${currentBg === idx ? 'w-12 bg-primary-500' : 'w-6 bg-surface-300 group-hover:bg-primary-300 group-hover:w-8'}`} />
              </button>
            ))}
          </div>
          <div className="flex gap-4">
            <button onClick={prevBg} aria-label="Previous slide" className="p-3 rounded-full bg-white/60 hover:bg-white backdrop-blur-md border border-surface-200 text-surface-900 transition-all shadow-sm hover:scale-105 active:scale-95 hover:text-primary-600">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={nextBg} aria-label="Next slide" className="p-3 rounded-full bg-white/60 hover:bg-white backdrop-blur-md border border-surface-200 text-surface-900 transition-all shadow-sm hover:scale-105 active:scale-95 hover:text-primary-600">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
