import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, ArrowRight, Phone } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { ScrollingBackground } from '@/components/ScrollingBackground';
import { FaqSection } from '@/components/FaqSection';
import { JsonLd } from '@/components/JsonLd';
import { SERVICES, BUSINESS, SITE_URL, AREA_SUMMARY, SERVICE_AREAS, breadcrumbJsonLd } from '@/lib/seo';

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) return {};
  const path = `/services/${service.slug}`;
  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: { canonical: path },
    openGraph: {
      title: service.metaTitle,
      description: service.metaDescription,
      url: path,
      type: 'website',
      images: [{ url: service.image, alt: service.imageAlt }],
    },
  };
}

export default async function ServicePage({ params }: { params: Params }) {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) notFound();

  const path = `/services/${service.slug}`;
  const related = SERVICES.filter((s) => s.slug !== service.slug);

  const serviceLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    serviceType: service.name,
    description: service.metaDescription,
    url: `${SITE_URL}${path}`,
    image: `${SITE_URL}${service.image}`,
    provider: { '@id': `${SITE_URL}/#business` },
    areaServed: SERVICE_AREAS.map((name) => ({ '@type': 'City', name })),
  };

  return (
    <div className="relative min-h-screen font-sans selection:bg-primary-200 text-surface-900 transition-colors duration-500 overflow-x-hidden">
      <JsonLd
        data={[
          serviceLd,
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Services', path: '/services' },
            { name: service.name, path },
          ]),
        ]}
      />
      <ScrollingBackground />
      <Header />
      <main className="relative z-10 pt-28">
        <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-xs text-surface-500 mb-6">
            <Link href="/" className="hover:text-primary-600">Home</Link> /{' '}
            <Link href="/services" className="hover:text-primary-600">Services</Link> /{' '}
            <span className="text-surface-700">{service.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-surface-900 leading-tight">
                {service.h1}
              </h1>
              <p className="mt-5 text-base sm:text-lg text-surface-600 leading-relaxed">{service.intro}</p>
              <ul className="mt-6 space-y-2.5">
                {service.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5 text-sm text-surface-700">
                    <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/quote"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-500 transition-colors shadow-sm"
                >
                  Get a Free Quote <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href={`tel:${BUSINESS.phoneIntl}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-surface-200 text-surface-900 font-semibold hover:border-primary-500 transition-colors"
                >
                  <Phone className="w-4 h-4" /> {BUSINESS.phoneDisplay}
                </a>
              </div>
            </div>
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-surface-200">
              <Image
                src={service.image}
                alt={service.imageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {service.sections.map((sec) => (
              <section key={sec.heading} className="p-6 rounded-3xl bg-white/90 border border-surface-200 shadow-sm">
                <h2 className="text-xl font-bold text-surface-900 mb-3">{sec.heading}</h2>
                <p className="text-sm text-surface-600 leading-relaxed">{sec.body}</p>
              </section>
            ))}
          </div>

          <section className="mt-12 p-6 sm:p-8 rounded-3xl bg-surface-900 text-white">
            <h2 className="text-2xl font-bold mb-2">Servicing {AREA_SUMMARY}</h2>
            <p className="text-surface-200 text-sm leading-relaxed">
              Based in Hansonville, we regularly work in {SERVICE_AREAS.join(', ')} and the surrounding towns.
              Whether it is a premium {service.name.toLowerCase()} project or a quick fix, get in touch for a free,
              no-obligation quote.
            </p>
          </section>
        </article>

        <FaqSection faqs={service.faqs} title={`${service.name}: FAQs`} />

        <section className="pb-16 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-surface-900 mb-4 text-center">Other Tiling Services</h2>
            <ul className="flex flex-wrap justify-center gap-3">
              {related.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-surface-200 text-sm font-medium text-surface-700 hover:border-primary-500 hover:text-primary-700 transition-colors"
                  >
                    {s.navName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
      <ThemeSwitcher />
    </div>
  );
}
