'use client';

import { Menu, X, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const phoneNumber = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '0467 551 492';
  const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePhoneClick = () => {
    try {
      fetch('/api/leads/call-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: 'header_call_button',
          referrer: typeof document !== 'undefined' ? document.referrer : '',
        }),
      }).catch((err) => console.error('Call click tracking error:', err));
    } catch {
      // Best-effort tracking
    }
  };

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-surface-50/90 backdrop-blur-xl border-b border-surface-200 shadow-sm py-2' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="rounded-xl overflow-hidden shadow-md border border-white/20 bg-surface-900">
              <Image
                src="/images/pro-square-logo.png"
                alt="Pro Square Tiling"
                width={220}
                height={80}
                className="h-12 sm:h-14 w-auto object-contain"
                priority
              />
            </div>
          </motion.div>
          
          <motion.nav 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, staggerChildren: 0.1 }}
            className="hidden md:flex items-center gap-8"
          >
            <a href="#services" className="text-surface-600 hover:text-primary-600 transition-colors font-medium">Services</a>
            <a href="#gallery" className="text-surface-600 hover:text-primary-600 transition-colors font-medium">Gallery</a>
            <a href="#quote" className="text-surface-600 hover:text-primary-600 transition-colors font-medium">Request Quote</a>
            <a 
              href={`tel:${cleanPhone || '5551234567'}`}
              onClick={handlePhoneClick}
              className="group flex items-center gap-2 px-5 py-2.5 bg-white/50 hover:bg-primary-600 border border-surface-200 hover:border-primary-500 text-surface-900 hover:text-white rounded-full font-medium transition-all duration-300 shadow-sm hover:shadow-[0_0_30px_-5px_var(--color-primary-500)] backdrop-blur-sm"
            >
              <Phone className="h-4 w-4 group-hover:animate-pulse" />
              {phoneNumber}
            </a>
          </motion.nav>

          <motion.button 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 text-surface-600 hover:text-primary-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface-50/95 backdrop-blur-xl border-t border-surface-200 overflow-hidden shadow-xl"
          >
            <div className="px-4 pt-2 pb-6 space-y-2 mt-2">
              <a href="#services" className="block px-4 py-3 text-base font-medium text-surface-600 hover:text-primary-600 hover:bg-white rounded-xl transition-colors shadow-sm" onClick={() => setIsMenuOpen(false)}>Services</a>
              <a href="#gallery" className="block px-4 py-3 text-base font-medium text-surface-600 hover:text-primary-600 hover:bg-white rounded-xl transition-colors shadow-sm" onClick={() => setIsMenuOpen(false)}>Gallery</a>
              <a href="#quote" className="block px-4 py-3 text-base font-medium text-surface-600 hover:text-primary-600 hover:bg-white rounded-xl transition-colors shadow-sm" onClick={() => setIsMenuOpen(false)}>Request Quote</a>
              <a 
                href={`tel:${cleanPhone || '5551234567'}`}
                onClick={() => {
                  handlePhoneClick();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 text-base font-semibold text-primary-600 bg-primary-50 rounded-xl transition-colors shadow-sm"
              >
                <Phone className="h-5 w-5" />
                {phoneNumber}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
