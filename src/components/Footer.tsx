'use client';

import { Mail, MapPin, Phone } from 'lucide-react';
import Image from 'next/image';

export function Footer() {
  const phoneNumber = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '0467 551 492';
  const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');

  const handlePhoneClick = () => {
    try {
      fetch('/api/leads/call-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: 'footer_call_link',
          referrer: typeof document !== 'undefined' ? document.referrer : '',
        }),
      }).catch((err) => console.error('Call click tracking error:', err));
    } catch {
      // Best-effort tracking
    }
  };

  return (
    <footer className="border-t border-black/10 text-surface-700 py-12 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="rounded-xl overflow-hidden shadow-sm border border-white/20">
                <Image
                  src="/images/pro-square-logo.png"
                  alt="Pro Square Tiling"
                  width={180}
                  height={68}
                  className="h-10 w-auto object-contain"
                />
              </div>
            </div>
            <p className="leading-relaxed text-surface-600 max-w-md transition-colors">
              Owned and operated by Michael Perez. Setting the standard for quality architectural and luxury tiling services. We deliver precision, durability, and stunning aesthetics for every project.
            </p>
          </div>

          <div>
            <h3 className="text-surface-900 font-semibold mb-5 uppercase tracking-wider text-sm">Contact Info</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary-500 shrink-0 transition-colors" />
                <a 
                  href={`tel:${cleanPhone || '0467551492'}`}
                  onClick={handlePhoneClick}
                  className="transition-colors hover:text-surface-900 font-medium"
                >
                  {phoneNumber}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary-500 shrink-0 transition-colors" />
                <a href="mailto:info@prosquaretiling.com" className="transition-colors hover:text-surface-900 font-medium">
                  info@prosquaretiling.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary-500 shrink-0 mt-0.5 transition-colors" />
                <span className="transition-colors text-surface-600 font-medium">
                  663 Banksdale Road, Hansonville, VIC 3675
                </span>
              </li>
            </ul>
          </div>
          
        </div>
        
        <div className="mt-12 pt-8 border-t border-surface-300/40 text-center text-sm text-surface-500 transition-colors">
          <p className="transition-colors">&copy; {new Date().getFullYear()} Pro Square Tiling. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
