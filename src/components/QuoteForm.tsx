'use client';

import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2, Phone, ShieldCheck, Clock, Award } from 'lucide-react';
import { motion, type Variants } from 'motion/react';
import Image from 'next/image';
import { Turnstile } from '@marsidev/react-turnstile';
import { QuoteInputSchema } from '@/lib/schemas';

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  projectType: string;
  message: string;
}

const initialForm: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  projectType: '',
  message: '',
};

export function QuoteForm() {
  const [formData, setFormData] = useState<FormState>(initialForm);
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const turnstileSiteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY;
  const phoneNumber = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '0467 551 492';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setFieldErrors({});

    const validation = QuoteInputSchema.safeParse({
      ...formData,
      turnstileToken: turnstileToken || undefined,
    });

    if (!validation.success) {
      const formattedErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          formattedErrors[issue.path[0] as string] = issue.message;
        }
      });
      setFieldErrors(formattedErrors);
      setErrorMessage(validation.error.issues[0]?.message || 'Please check your inputs.');
      return;
    }

    setStatus('submitting');

    try {
      const res = await fetch('/api/leads/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          turnstileToken: turnstileToken || undefined,
          source: typeof document !== 'undefined' ? document.referrer : undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to submit quote request. Please try again.');
      }

      setStatus('success');
      setFormData(initialForm);
    } catch (err: any) {
      console.error('[QuoteForm Error]', err);
      setStatus('error');
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again or call us.');
    }
  };

  return (
    <section id="quote" className="py-20 relative overflow-hidden bg-black/[0.06] text-surface-900 transition-colors duration-500 border-t border-surface-300/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* LEFT: VALUE PROPOSITION */}
          <div className="lg:col-span-5">
            <span className="inline-block py-1 px-3.5 rounded-full bg-primary-100 text-primary-700 border-primary-200 text-xs font-bold tracking-widest uppercase mb-4 border border-primary-500/30">
              Get an Accurate Estimate
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-surface-900 leading-tight">
              Ready to Upgrade Your Space?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-surface-600 font-light leading-relaxed">
              Send us your project scope for a transparent, itemized estimate. We offer free on-site measurements across Melbourne.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/60 border border-surface-300 shadow-sm backdrop-blur-md">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-surface-900">100% Waterproof Certified</h4>
                  <p className="text-[11px] text-surface-600">Strict AS 3740 & AS 3958.1 Compliance</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/60 border border-surface-300 shadow-sm backdrop-blur-md">
                <Clock className="w-5 h-5 text-primary-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-surface-900">Fast 24-Hour Response</h4>
                  <p className="text-[11px] text-surface-600">Direct trade advice & pricing breakdown</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/60 border border-surface-300 shadow-sm backdrop-blur-md">
                <Award className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-surface-900">10-Year Craftsmanship Guarantee</h4>
                  <p className="text-[11px] text-surface-600">Backed by premium European adhesives & grouts</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-surface-300/50 flex items-center gap-3">
              <Phone className="w-4 h-4 text-primary-600" />
              <span className="text-xs text-surface-600">Prefer to speak directly? Call <a href={`tel:${phoneNumber.replace(/[^0-9+]/g, '')}`} className="font-bold text-white hover:text-primary-600 underline ml-1">{phoneNumber}</a></span>
            </div>
          </div>

          {/* RIGHT: COMPACT HIGH-CONVERTING QUOTE FORM */}
          <div className="lg:col-span-7">
            <div className="bg-white/80 backdrop-blur-xl border border-surface-300 rounded-3xl p-6 sm:p-8 shadow-xl relative">
              
              {status === 'success' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-surface-900 mb-2">Quote Request Sent!</h3>
                  <p className="text-surface-700 text-xs sm:text-sm font-light leading-relaxed mb-6">
                    Thank you. We have received your project details and will be in touch within 24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="px-6 py-2.5 bg-white hover:bg-surface-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Submit Another Request
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {status === 'error' && (
                    <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl flex items-center gap-2.5 text-red-300 text-xs">
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                      <span>{errorMessage || 'Failed to submit quote. Please check your information.'}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-xs font-medium text-surface-700 mb-1.5">
                        First Name <span className="text-red-400">*</span>
                      </label>
                      <input 
                        type="text" 
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required 
                        disabled={status === 'submitting'}
                        className={`w-full px-4 py-3 rounded-xl bg-white border text-surface-900 text-xs placeholder-surface-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${fieldErrors.firstName ? 'border-red-400 bg-red-500/10' : 'border-surface-300'}`}
                        placeholder="John" 
                      />
                      {fieldErrors.firstName && <p className="mt-1 text-[10px] text-red-400">{fieldErrors.firstName}</p>}
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-xs font-medium text-surface-700 mb-1.5">
                        Last Name <span className="text-red-400">*</span>
                      </label>
                      <input 
                        type="text" 
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required 
                        disabled={status === 'submitting'}
                        className={`w-full px-4 py-3 rounded-xl bg-white border text-surface-900 text-xs placeholder-surface-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${fieldErrors.lastName ? 'border-red-400 bg-red-500/10' : 'border-surface-300'}`}
                        placeholder="Doe" 
                      />
                      {fieldErrors.lastName && <p className="mt-1 text-[10px] text-red-400">{fieldErrors.lastName}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-xs font-medium text-surface-700 mb-1.5">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <input 
                        type="email" 
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required 
                        disabled={status === 'submitting'}
                        className={`w-full px-4 py-3 rounded-xl bg-white border text-surface-900 text-xs placeholder-surface-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${fieldErrors.email ? 'border-red-400 bg-red-500/10' : 'border-surface-300'}`}
                        placeholder="john@example.com" 
                      />
                      {fieldErrors.email && <p className="mt-1 text-[10px] text-red-400">{fieldErrors.email}</p>}
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-xs font-medium text-surface-700 mb-1.5">
                        Phone Number <span className="text-red-400">*</span>
                      </label>
                      <input 
                        type="tel" 
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required 
                        disabled={status === 'submitting'}
                        className={`w-full px-4 py-3 rounded-xl bg-white border text-surface-900 text-xs placeholder-surface-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${fieldErrors.phone ? 'border-red-400 bg-red-500/10' : 'border-surface-300'}`}
                        placeholder="0400 000 000" 
                      />
                      {fieldErrors.phone && <p className="mt-1 text-[10px] text-red-400">{fieldErrors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="projectType" className="block text-xs font-medium text-surface-700 mb-1.5">
                      Service Required <span className="text-red-400">*</span>
                    </label>
                    <select 
                      id="projectType"
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleChange}
                      required 
                      disabled={status === 'submitting'}
                      className={`w-full px-4 py-3 rounded-xl bg-surface-950/80 border text-white text-xs focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${fieldErrors.projectType ? 'border-red-400' : 'border-surface-300'}`}
                    >
                      <option value="" disabled className="bg-white">Select project scope...</option>
                      <option value="bathroom" className="bg-white">Bathroom / Ensuite Renovation</option>
                      <option value="kitchen" className="bg-white">Kitchen & Splashback Tiling</option>
                      <option value="pool" className="bg-white">Pool Coping & Waterline</option>
                      <option value="outdoor" className="bg-white">Outdoor Veranda / Patio</option>
                      <option value="floor" className="bg-white">Main Floor Slabs & Screed</option>
                      <option value="commercial" className="bg-white">Commercial / Custom Layout</option>
                      <option value="other" className="bg-white">Other (Please specify in notes)</option>
                    </select>
                    {fieldErrors.projectType && <p className="mt-1 text-[10px] text-red-400">{fieldErrors.projectType}</p>}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-xs font-medium text-surface-700 mb-1.5">
                      Project Notes & Dimensions <span className="text-red-400">*</span>
                    </label>
                    <textarea 
                      id="message" 
                      name="message"
                      rows={3} 
                      value={formData.message}
                      onChange={handleChange}
                      required 
                      disabled={status === 'submitting'}
                      placeholder="Approximate m², tile type (porcelain, stone, mosaic), location..." 
                      className={`w-full px-4 py-3 rounded-xl bg-white border text-surface-900 text-xs placeholder-surface-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none ${fieldErrors.message ? 'border-red-400' : 'border-surface-300'}`}
                    />
                    {fieldErrors.message && <p className="mt-1 text-[10px] text-red-400">{fieldErrors.message}</p>}
                  </div>

                  {turnstileSiteKey && (
                    <div className="flex justify-center my-1">
                      <Turnstile
                        siteKey={turnstileSiteKey}
                        onSuccess={(token) => setTurnstileToken(token)}
                        onError={() => setTurnstileToken('')}
                        onExpire={() => setTurnstileToken('')}
                      />
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={status === 'submitting'}
                    className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-75 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30 text-xs sm:text-sm cursor-pointer"
                  >
                    {status === 'submitting' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Submit Estimation Request
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
