import { Header } from '@/components/Header';
import { QuoteForm } from '@/components/QuoteForm';
import { Footer } from '@/components/Footer';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { ScrollingBackground } from '@/components/ScrollingBackground';

const quoteTitle = 'Free Tiling Quote | Wangaratta & North East VIC | Pro Square Tiling';
const quoteDescription =
  'Request a free, no-obligation tiling quote, from small repairs to French cut and luxury slab work. Servicing Wangaratta, Benalla, Beechworth, Myrtleford & Albury–Wodonga. 24-hour response.';

export const metadata = {
  title: quoteTitle,
  description: quoteDescription,
  alternates: { canonical: '/quote' },
  openGraph: {
    title: quoteTitle,
    description: quoteDescription,
    url: '/quote',
    type: 'website',
    images: [{ url: '/images/projects/project-13-master-ensuite.jpg', alt: 'Luxury ensuite tiled by Pro Square Tiling' }],
  },
};

export default function QuotePage() {
  return (
    <div className="relative min-h-screen font-sans selection:bg-primary-200 text-surface-900 transition-colors duration-500 overflow-x-hidden">
      <ScrollingBackground />
      <Header />
      <main className="relative z-10">
        <QuoteForm />
      </main>
      <Footer />
      <ThemeSwitcher />
    </div>
  );
}
