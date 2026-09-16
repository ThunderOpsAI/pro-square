'use client';

import React from 'react';

/**
 * Animated Transitioning Background
 * Crossfades between Hexagon and Diamond patterns over a shifting color gradient.
 */
export function ScrollingBackground() {
  return (
    <>
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes patternFadeHex {
          0%, 10%, 90%, 100% { opacity: 0.12; }
          40%, 60% { opacity: 0; }
        }
        @keyframes patternFadeDia {
          0%, 20%, 80%, 100% { opacity: 0; }
          45%, 55% { opacity: 0.15; }
        }
        .bg-animate-gradient {
          background-size: 200% 200%;
          animation: gradientShift 15s ease infinite;
        }
        .pattern-hex {
          animation: patternFadeHex 16s ease-in-out infinite;
        }
        .pattern-dia {
          animation: patternFadeDia 16s ease-in-out infinite;
        }
      `}</style>
      <div 
        className="absolute inset-0 -z-20 pointer-events-none w-full min-h-full bg-animate-gradient"
        style={{ 
          backgroundImage: 'linear-gradient(120deg, #d6d0c6 0%, #f4f1eb 25%, #e2ddd5 50%, #c7c0b6 75%, #d6d0c6 100%)',
        }}
      >
        {/* Hexagon Pattern */}
        <svg className="w-full h-full fixed pattern-hex" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hexagons-bg" width="50" height="43.4" patternUnits="userSpaceOnUse">
              <path fill="none" stroke="#2a251f" strokeWidth="1.5" d="M25 0 L50 14.4 L50 43.3 L25 57.7 L0 43.3 L0 14.4 Z" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexagons-bg)" />
        </svg>

        {/* Diamond Pattern */}
        <svg className="w-full h-full fixed pattern-dia" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="diamonds-bg" width="40" height="40" patternUnits="userSpaceOnUse">
              <path fill="none" stroke="#111" strokeWidth="1" d="M20 0 L40 20 L20 40 L0 20 Z" />
              <path fill="none" stroke="#111" strokeWidth="0.5" d="M10 10 L30 30 M30 10 L10 30" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diamonds-bg)" />
        </svg>
      </div>
    </>
  );
}
