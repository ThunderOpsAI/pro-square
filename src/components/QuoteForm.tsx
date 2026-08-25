'use client';

import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, type Variants } from 'motion/react';
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

const stepVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

export function QuoteForm() {
  const [formData, setFormData] = useState<FormState>(initialForm);
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const turnstileSiteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY;

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
    <section id="quote" className="py-32 bg-surface-100 relative overflow-hidden transition-colors duration-500">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-primary-500/10 via-surface-100 to-surface-100 pointer-events-none transition-colors" />
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-primary-200/50 blur-[120px] rounded-full pointer-events-none mix-blend-multiply transition-colors duration-500" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.2 } }
            }}
          >
            <motion.h2 
              variants={stepVariants}
              className="text-4xl font-bold tracking-tight text-surface-900 sm:text-5xl leading-tight transition-colors"
            >
              Ready to start your project?
            </motion.h2>
            <motion.p 
              variants={stepVariants}
              className="mt-6 text-xl text-surface-600 leading-relaxed font-light transition-colors"
            >
              Fill out the form with details about your space. We'll get back to you within 24 hours to schedule a free on-site consultation and measurement.
            </motion.p>
            
            <div className="mt-16 space-y-10">
              {[
                { step: '1', title: 'Request a Quote', desc: 'Tell us about your project, tile preferences, and vision.' },
                { step: '2', title: 'On-Site Measure & Estimate', desc: 'We assess the space, calculate materials, and provide a transparent quote.' },
                { step: '3', title: 'Master Craftsmanship', desc: 'Precision installation with 100% waterproof guarantee.' }
              ].map((item, i) => (
                <motion.div key={i} variants={stepVariants} className="flex gap-6 group">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-surface-200 flex items-center justify-center shrink-0 group-hover:bg-primary-600 group-hover:border-primary-500 transition-all duration-500 shadow-sm group-hover:shadow-primary-600/30 group-hover:scale-110">
                      <span className="text-primary-600 group-hover:text-white font-bold text-xl transition-colors duration-300">{item.step}</span>
                    </div>
                    {i !== 2 && (
                      <div className="absolute top-14 bottom-[-40px] left-1/2 w-px bg-gradient-to-b from-surface-300 to-transparent -translate-x-1/2 transition-colors duration-500" />
                    )}
                  </div>
                  <div className="pt-2">
                    <h4 className="text-surface-900 font-semibold text-xl mb-2 transition-colors">{item.title}</h4>
                    <p className="text-surface-500 font-light transition-colors">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50, rotateY: -10 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ perspective: 1000 }}
            className="bg-white/90 backdrop-blur-xl border border-white rounded-[2.5rem] p-8 sm:p-12 shadow-2xl shadow-surface-300/50 relative transition-colors duration-500"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent rounded-[2.5rem] -z-10 blur-xl pointer-events-none transition-colors" />

            {status === 'success' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                  className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner shadow-emerald-100"
                >
                  <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                </motion.div>
                <h3 className="text-3xl font-bold text-surface-900 mb-4 transition-colors">Quote Request Sent!</h3>
                <p className="text-surface-600 text-lg font-light leading-relaxed mb-8">
                  Thank you. We have received your project details and dispatched a confirmation to your email. Our team will contact you shortly!
                </p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="px-8 py-3.5 bg-surface-100 hover:bg-surface-200 text-surface-800 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Submit Another Request
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {status === 'error' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm"
                  >
                    <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
                    <span>{errorMessage || 'Failed to submit quote. Please check your information and try again.'}</span>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-surface-700 mb-2 ml-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required 
                      disabled={status === 'submitting'}
                      className={`w-full px-5 py-4 rounded-2xl bg-surface-50 border text-surface-900 placeholder-surface-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all shadow-inner shadow-surface-200/20 ${fieldErrors.firstName ? 'border-red-400 bg-red-50/30' : 'border-surface-200'}`}
                      placeholder="John" 
                    />
                    {fieldErrors.firstName && <p className="mt-1 text-xs text-red-600 ml-1">{fieldErrors.firstName}</p>}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-surface-700 mb-2 ml-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required 
                      disabled={status === 'submitting'}
                      className={`w-full px-5 py-4 rounded-2xl bg-surface-50 border text-surface-900 placeholder-surface-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all shadow-inner shadow-surface-200/20 ${fieldErrors.lastName ? 'border-red-400 bg-red-50/30' : 'border-surface-200'}`}
                      placeholder="Doe" 
                    />
                    {fieldErrors.lastName && <p className="mt-1 text-xs text-red-600 ml-1">{fieldErrors.lastName}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-surface-700 mb-2 ml-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="email" 
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required 
                      disabled={status === 'submitting'}
                      className={`w-full px-5 py-4 rounded-2xl bg-surface-50 border text-surface-900 placeholder-surface-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all shadow-inner shadow-surface-200/20 ${fieldErrors.email ? 'border-red-400 bg-red-50/30' : 'border-surface-200'}`}
                      placeholder="john@example.com" 
                    />
                    {fieldErrors.email && <p className="mt-1 text-xs text-red-600 ml-1">{fieldErrors.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-surface-700 mb-2 ml-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="tel" 
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required 
                      disabled={status === 'submitting'}
                      className={`w-full px-5 py-4 rounded-2xl bg-surface-50 border text-surface-900 placeholder-surface-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all shadow-inner shadow-surface-200/20 ${fieldErrors.phone ? 'border-red-400 bg-red-50/30' : 'border-surface-200'}`}
                      placeholder="(0400) 000-000" 
                    />
                    {fieldErrors.phone && <p className="mt-1 text-xs text-red-600 ml-1">{fieldErrors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="projectType" className="block text-sm font-medium text-surface-700 mb-2 ml-1">
                    Project Type <span className="text-red-500">*</span>
                  </label>
                  <select 
                    id="projectType"
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleChange}
                    required 
                    disabled={status === 'submitting'}
                    className={`w-full px-5 py-4 rounded-2xl bg-surface-50 border text-surface-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all appearance-none shadow-inner shadow-surface-200/20 ${fieldErrors.projectType ? 'border-red-400 bg-red-50/30' : 'border-surface-200'}`}
                  >
                    <option value="" disabled>Select a service...</option>
                    <option value="bathroom">Bathroom Renovation</option>
                    <option value="kitchen">Kitchen Backsplash</option>
                    <option value="floor">Floor Tiling</option>
                    <option value="outdoor">Outdoor / Patio</option>
                    <option value="commercial">Commercial Space</option>
                    <option value="other">Other Tiling Project</option>
                  </select>
                  {fieldErrors.projectType && <p className="mt-1 text-xs text-red-600 ml-1">{fieldErrors.projectType}</p>}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-surface-700 mb-2 ml-1">
                    Project Details <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    id="message" 
                    name="message"
                    rows={4} 
                    value={formData.message}
                    onChange={handleChange}
                    required 
                    disabled={status === 'submitting'}
                    placeholder="Tell us about room dimensions, preferred tile material (ceramic/porcelain/stone), current condition, and timeline..." 
                    className={`w-full px-5 py-4 rounded-2xl bg-surface-50 border text-surface-900 placeholder-surface-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none shadow-inner shadow-surface-200/20 ${fieldErrors.message ? 'border-red-400 bg-red-50/30' : 'border-surface-200'}`}
                  />
                  {fieldErrors.message && <p className="mt-1 text-xs text-red-600 ml-1">{fieldErrors.message}</p>}
                </div>

                {turnstileSiteKey && (
                  <div className="flex justify-center my-2">
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
                  className="group w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-75 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_0_40px_-10px_var(--color-primary-500)] hover:shadow-[0_0_60px_-15px_var(--color-primary-500)] mt-8 cursor-pointer"
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-300" />
                      Request Free Quote
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
