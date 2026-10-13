import { Header } from '@/components/Header';
import { Gallery } from '@/components/Gallery';
import { BeforeAfterSection } from '@/components/BeforeAfterSection';
import { Footer } from '@/components/Footer';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { ScrollingBackground } from '@/components/ScrollingBackground';

const galleryTitle = 'Tiling Project Gallery | Wangaratta & North East VIC | Pro Square Tiling';
const galleryDescription =
  'Before & after photos of French cut mitred, slab, bathroom, kitchen, pool and heritage veranda tiling projects across Wangaratta, Beechworth, Benalla & Albury–Wodonga.';

export const metadata = {
  title: galleryTitle,
  description: galleryDescription,
  alternates: { canonical: '/gallery' },
  openGraph: {
    title: galleryTitle,
    description: galleryDescription,
    url: '/gallery',
    type: 'website',
    images: [{ url: '/images/projects/project-11-pool-alfresco.jpg', alt: 'Pool and travertine coping tiling project' }],
  },
};

export default function GalleryPage() {
  return (
    <div className="relative min-h-screen font-sans selection:bg-primary-200 text-surface-900 transition-colors duration-500 overflow-x-hidden">
      <ScrollingBackground />
      <Header />
      <main className="relative z-10">
        <Gallery />
        <BeforeAfterSection />
      </main>
      <Footer />
      <ThemeSwitcher />
    </div>
  );
}
