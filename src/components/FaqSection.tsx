import { ChevronDown } from 'lucide-react';
import { JsonLd } from '@/components/JsonLd';
import { faqJsonLd, type FaqItem } from '@/lib/seo';

/** Server-rendered FAQ accordion (native <details>) with FAQPage schema. */
export function FaqSection({
  faqs,
  title = 'Frequently Asked Questions',
  id = 'faq',
}: {
  faqs: FaqItem[];
  title?: string;
  id?: string;
}) {
  return (
    <section id={id} className="py-12 relative z-10">
      <JsonLd data={faqJsonLd(faqs)} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-surface-900 text-center mb-8">{title}</h2>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group bg-white/90 backdrop-blur rounded-2xl border border-surface-200 shadow-sm open:shadow-md transition-shadow"
            >
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none p-5 font-semibold text-surface-900">
                <h3 className="text-base">{f.q}</h3>
                <ChevronDown className="w-5 h-5 shrink-0 text-primary-600 transition-transform group-open:rotate-180" />
              </summary>
              <p className="px-5 pb-5 -mt-1 text-sm text-surface-600 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
