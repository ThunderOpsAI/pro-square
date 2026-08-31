'use client';

import React from 'react';

/**
 * Dual-tone architectural background.
 * Color 1 (#d6d0c6) for the 1st half of the page (0% - 40%),
 * Smooth 10% fade on either side of halfway (40% - 60%),
 * Color 2 (#cac4bb) for the 2nd half (60% - 100%).
 */

const tilePatternSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Cg fill='none' stroke='%238a7d6b' stroke-width='1' opacity='0.13'%3E%3Cpath d='M0 0h24v12H0zM24 12h24v12H24zM0 24h24v12H0zM24 36h24v12H24z'/%3E%3Cpath d='M12 0v12M36 12v12M12 24v12M36 36v12'/%3E%3C/g%3E%3C/svg%3E")`;

export function ScrollingBackground() {
  return (
    <div
      className="absolute inset-0 -z-20 pointer-events-none w-full min-h-full"
      style={{
        background: 'linear-gradient(to bottom, #d6d0c6 0%, #d6d0c6 40%, #d0cac0 60%, #d0cac0 100%)',
      }}
    >
      {/* Continuous architectural tile pattern texture overlay */}
      <div className="absolute inset-0" style={{ backgroundImage: tilePatternSvg }} />
      
      {/* Subtle organic stone grain */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        }}
      />
    </div>
  );
}
