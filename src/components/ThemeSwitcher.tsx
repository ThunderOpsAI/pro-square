'use client';

import { Palette } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const themes = [
  { id: 'default', name: 'Slate & Blue (Default)', color: 'bg-blue-600' },
  { id: 'theme-emerald', name: 'Emerald & Charcoal', color: 'bg-emerald-600' },
  { id: 'theme-terracotta', name: 'Terracotta & Stone', color: 'bg-orange-600' },
  { id: 'theme-copper', name: 'Copper & Concrete', color: 'bg-amber-600' },
];

const THEME_STORAGE_KEY = 'pro-square-theme';

export function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState('default');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme && ['default', 'theme-emerald', 'theme-terracotta', 'theme-copper'].includes(savedTheme)) {
      setActiveTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (themeId: string) => {
    document.documentElement.classList.remove('theme-terracotta', 'theme-emerald', 'theme-copper', 'default');
    if (themeId !== 'default') {
      document.documentElement.classList.add(themeId);
    }
  };

  const handleSelectTheme = (themeId: string) => {
    setActiveTheme(themeId);
    applyTheme(themeId);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
    } catch {
      // Storage access may be restricted
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-16 right-0 mb-4 w-60 bg-surface-900 rounded-2xl shadow-2xl shadow-black/50 border border-surface-800 overflow-hidden"
          >
            <div className="p-4 border-b border-surface-800">
              <h3 className="text-white font-medium text-sm">Select a Theme</h3>
            </div>
            <div className="p-2">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleSelectTheme(theme.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    activeTheme === theme.id ? 'bg-surface-800 text-white' : 'text-surface-400 hover:bg-surface-800/50 hover:text-white'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full shadow-inner ${theme.color}`} />
                  {theme.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle theme switcher"
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-surface-900 text-white shadow-xl shadow-black/30 border border-surface-800 flex items-center justify-center hover:bg-surface-800 transition-colors cursor-pointer"
      >
        <Palette className="w-6 h-6" />
      </motion.button>
    </div>
  );
}
