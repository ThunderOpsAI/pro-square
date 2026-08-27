'use client';

import { useEffect, useState } from 'react';

/**
 * Woven Earth scroll-reactive background.
 * White herringbone tiles at the top dissolve into warm taupe basket-weave as you scroll.
 */

const whiteHerringboneSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='80'%3E%3Cg fill='none' stroke='%23000' stroke-width='0.7' opacity='0.05'%3E%3Cpath d='M20 0L0 20v40l20 20 20-20V20L20 0zm0 40L0 60m40 0L20 40M0 20l20 20m20-20L20 40'/%3E%3C/g%3E%3C/svg%3E")`;

const basketWeaveSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Cg fill='none' stroke='%238a7d6b' stroke-width='1.2' opacity='0.16'%3E%3Cpath d='M0 0h24v12H0zM24 12h24v12H24zM0 24h24v12H0zM24 36h24v12H24z'/%3E%3Cpath d='M12 0v12M36 12v12M12 24v12M36 36v12'/%3E%3C/g%3E%3C/svg%3E")`;

export function ScrollingBackground() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const raw = scrollY / (docHeight * 0.6);
      setScrollProgress(Math.min(1, Math.max(0, raw)));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const topOpacity = 1 - scrollProgress;

  return (
    <>
      {/* Bottom layer: warm taupe basket-weave (revealed as you scroll) */}
      <div className="fixed inset-0 -z-20" style={{ backgroundColor: '#c4b5a0' }}>
        <div className="absolute inset-0" style={{ backgroundImage: basketWeaveSvg }} />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
          }}
        />
      </div>

      {/* Top layer: white herringbone (fades out on scroll) */}
      <div
        className="fixed inset-0 -z-10 transition-opacity duration-100"
        style={{ backgroundColor: '#f8fafc', opacity: topOpacity }}
      >
        <div className="absolute inset-0" style={{ backgroundImage: whiteHerringboneSvg }} />
      </div>
    </>
  );
}
