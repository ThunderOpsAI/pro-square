'use client';

import { useState, useEffect } from 'react';
import { PhoneForwarded, PhoneCall, Copy, Check, X, Smartphone, Info, RefreshCw } from 'lucide-react';

interface DivertCode {
  title: string;
  code: string;
  description: string;
  badge?: string;
  recommended?: boolean;
}

const divertCodes: DivertCode[] = [
  {
    title: 'Recommended: All-In-One Divert',
    code: '**004*0434980250*11*15#',
    description: 'Diverts after 15s of ringing, or instantly if busy, declined, or phone is off.',
    badge: 'Best Choice',
    recommended: true,
  },
  {
    title: 'Fast Divert (10 Seconds)',
    code: '**61*0434980250*11*10#',
    description: 'Rings for only 10 seconds (~2 rings) before forwarding to wife.',
  },
  {
    title: 'Standard Divert (15 Seconds)',
    code: '**61*0434980250*11*15#',
    description: 'Rings for standard 15 seconds (~3-4 rings) before forwarding to wife.',
  },
  {
    title: 'Extended Divert (20 Seconds)',
    code: '**61*0434980250*11*20#',
    description: 'Rings for 20 seconds to give you more time to answer before forwarding.',
  },
  {
    title: 'Instant Divert on Busy / Decline',
    code: '**67*0434980250#',
    description: 'If you tap "Decline" or you are on another call, immediately transfers to wife.',
  },
  {
    title: 'Divert when Switched Off / No Service',
    code: '**62*0434980250#',
    description: 'Diverts straight to wife if your phone battery dies or has no reception.',
  },
  {
    title: 'Cancel & Revert to Voicemail',
    code: '##002#',
    description: 'Removes all diversions and restores your standard mobile voicemail.',
    badge: 'Reset Code',
  },
];

export default function CallDivertBanner() {
  const [dismissed, setDismissed] = useState(true); // default true to prevent SSR hydration flicker
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showAllCodes, setShowAllCodes] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('prosquare_call_divert_dismissed');
    if (isDismissed !== 'true') {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('prosquare_call_divert_dismissed', 'true');
    setDismissed(true);
  };

  const handleRestore = () => {
    localStorage.removeItem('prosquare_call_divert_dismissed');
    setDismissed(false);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  if (dismissed) {
    return (
      <div className="flex justify-end">
        <button
          onClick={handleRestore}
          className="text-xs text-surface-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2.5 rounded-lg hover:bg-surface-800/60"
        >
          <PhoneForwarded className="h-3 w-3" />
          <span>Show Call Divert Instructions</span>
        </button>
      </div>
    );
  }

  const primaryCode = divertCodes[0];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950/40 via-surface-900 to-surface-900 border-2 border-amber-500/50 shadow-xl shadow-amber-950/20 p-5 sm:p-6 mb-2">
      {/* Top Background Glow Effect */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Header bar */}
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400 shrink-0">
            <PhoneForwarded className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Action Required
              </span>
              <span className="text-xs text-surface-400">
                From: <span className="font-semibold text-white">0467 551 492</span> → Divert to Wife: <span className="font-semibold text-amber-300">0434 980 250</span>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
              Setup Immediate Call Divert When Phone Unanswered
            </h2>
            <p className="text-sm text-surface-300 mt-1 max-w-2xl">
              Prevent missed jobs and inquiries. If you don&apos;t answer or are busy on a job, incoming client calls can immediately divert to your wife&apos;s phone. Dial the code below directly from your phone.
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          title="Dismiss banner"
          className="text-surface-400 hover:text-white p-1.5 rounded-xl hover:bg-surface-800 transition-colors shrink-0"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Primary Recommended Code Box */}
      <div className="mt-5 p-4 sm:p-5 rounded-xl bg-surface-950/80 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              One-Step Setup (Recommended)
            </span>
            <span className="text-[10px] font-bold bg-amber-400 text-black px-1.5 py-0.2 rounded font-mono">
              ALL-IN-ONE
            </span>
          </div>
          <div className="font-mono text-xl sm:text-2xl font-black text-amber-300 tracking-wider">
            {primaryCode.code}
          </div>
          <p className="text-xs text-surface-400">
            {primaryCode.description}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:self-center">
          <button
            onClick={() => handleCopy(primaryCode.code)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-white font-medium text-xs border border-surface-700 transition-all cursor-pointer shadow-sm"
          >
            {copiedCode === primaryCode.code ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-surface-300" />
                <span>Copy Code</span>
              </>
            )}
          </button>

          <a
            href={`tel:${primaryCode.code.replace(/#/g, '%23')}`}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow-md shadow-amber-500/20"
          >
            <PhoneCall className="h-4 w-4 text-black" />
            <span>Dial Now</span>
          </a>
        </div>
      </div>

      {/* Toggle View More Codes */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 pt-2 border-t border-surface-800/80">
        <button
          onClick={() => setShowAllCodes(!showAllCodes)}
          className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer self-start"
        >
          <Smartphone className="h-3.5 w-3.5" />
          <span>{showAllCodes ? 'Hide custom timer & cancel codes' : 'View alternative ring timers & cancel codes'}</span>
        </button>

        <button
          onClick={handleDismiss}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-800/80 hover:bg-surface-700 text-surface-300 hover:text-white text-xs font-medium border border-surface-700 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          <span>Dismiss (I&apos;ve completed setup)</span>
        </button>
      </div>

      {/* Expanded Table of Codes */}
      {showAllCodes && (
        <div className="mt-4 space-y-2 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {divertCodes.slice(1).map((item) => (
              <div
                key={item.code}
                className="p-3 rounded-xl bg-surface-950/60 border border-surface-800 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-white truncate">{item.title}</span>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-800 text-surface-300 border border-surface-700">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-sm font-bold text-amber-400 mt-0.5 tracking-wider">
                    {item.code}
                  </div>
                  <p className="text-[11px] text-surface-400 truncate mt-0.5">{item.description}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleCopy(item.code)}
                    title="Copy code"
                    className="p-2 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-white transition-colors"
                  >
                    {copiedCode === item.code ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <a
                    href={`tel:${item.code.replace(/#/g, '%23')}`}
                    title="Dial on phone"
                    className="p-2 rounded-lg bg-surface-800 hover:bg-amber-500 hover:text-black text-amber-400 transition-colors"
                  >
                    <PhoneCall className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
