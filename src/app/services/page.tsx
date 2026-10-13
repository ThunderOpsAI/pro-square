import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { ScrollingBackground } from '@/components/ScrollingBackground';
import { FaqSection } from '@/components/FaqSection';
import { JsonLd } from '@/components/JsonLd';
import { SERVICES, GENERAL_FAQS, AREA_SUMMARY, breadcrumbJsonLd } from '@/lib/seo';

const title = 'Tiling Services | Wangaratta & North East VIC | Pro Square Tiling';
const description = `French cut mitred tiling, bathrooms, kitchen splashbacks, pool & outdoor tiling, waterproofing and small repairs across ${AREA_SUMMARY}.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/services' },
  openGraph: {
    title,
    description,
    url: '/services',
    type: 'website',
    images: [{ url: '/images/projects/project-13-master-ensuite.jpg', alt: 'Luxury ensuite tiled by Pro Square Tiling' }],
  },
};

export default function ServicesIndexPage() {
  return (
    <div className="relative min-h-screen font-sans selection:bg-primary-200 text-surface-900 transition-colors duration-500 overflow-x-hidden">
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }])} />
      <ScrollingBackground />
      <Header />
      <main className="relative z-10 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-surface-900">
              Tiling Services in Wangaratta & North East Victoria
            </h1>
            <p className="mt-4 text-base sm:text-lg text-surface-600 leading-relaxed">
              From specialist French cut mitred edges and slab walls to quick repairs and splashbacks, here is
              everything we do.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="group bg-white rounded-3xl overflow-hidden border border-surface-200 shadow-sm hover:shadow-xl transition-all flex flex-col"
              >
                <div className="relative h-48">
                  <Image src={s.image} alt={s.imageAlt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h2 className="text-lg font-bold text-surface-900 group-hover:text-primary-600 transition-colors">{s.name}</h2>
                  <p className="mt-2 text-sm text-surface-600 leading-relaxed flex-1">{s.metaDescription}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600">
                    Learn more <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <FaqSection faqs={GENERAL_FAQS} />
      </main>
      <Footer />
      <ThemeSwitcher />
    </div>
  );
}
