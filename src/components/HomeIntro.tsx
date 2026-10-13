import Link from 'next/link';
import { ArrowRight, Gem, Wrench, MapPin } from 'lucide-react';
import { SERVICES, SERVICE_AREAS } from '@/lib/seo';

/**
 * Server-rendered, crawlable intro: positions the business for high-end work
 * (French cut / mitred) while making clear small jobs are welcome, and links
 * to every service page.
 */
export function HomeIntro() {
  return (
    <section className="py-14 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-surface-900">
            North East Victoria&apos;s Specialist for High-End Tiling, and Every Job in Between
          </h2>
          <p className="mt-4 text-base sm:text-lg text-surface-600 leading-relaxed">
            Pro Square Tiling is owned and run by Michael Perez, one of the only tilers in the region who
            regularly delivers <strong>French cut (45° mitred) edges</strong>, large-format slab walls, bookmatched
            stone-look porcelain and intricate herringbone layouts. We bring the same precision to small
            repairs, splashbacks and everyday bathrooms. No job is too big or too small.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white/90 border border-surface-200 shadow-sm">
            <Gem className="w-7 h-7 text-primary-600 mb-3" />
            <h3 className="font-bold text-surface-900 mb-2">High-end & architectural</h3>
            <p className="text-sm text-surface-600 leading-relaxed">
              Trim-free mitred corners, slab walls, curbless showers, Calacatta ensuites and heritage
              tessellated verandas.
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-white/90 border border-surface-200 shadow-sm">
            <Wrench className="w-7 h-7 text-primary-600 mb-3" />
            <h3 className="font-bold text-surface-900 mb-2">Small jobs welcome</h3>
            <p className="text-sm text-surface-600 leading-relaxed">
              Cracked tile replacement, regrouting, laundry floors and quick splashbacks, done tidily and on
              time.
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-white/90 border border-surface-200 shadow-sm">
            <MapPin className="w-7 h-7 text-primary-600 mb-3" />
            <h3 className="font-bold text-surface-900 mb-2">Local to you</h3>
            <p className="text-sm text-surface-600 leading-relaxed">
              Servicing {SERVICE_AREAS.join(', ')} and surrounding North East Victoria.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-center text-sm font-bold uppercase tracking-widest text-surface-500 mb-4">
            Our Tiling Services
          </h3>
          <ul className="flex flex-wrap justify-center gap-3">
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/services/${s.slug}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-surface-200 text-sm font-medium text-surface-700 hover:border-primary-500 hover:text-primary-700 transition-colors"
                >
                  {s.navName}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
