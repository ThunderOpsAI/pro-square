import { Header } from '@/components/Header';
import { Gallery } from '@/components/Gallery';
import { BeforeAfterSection } from '@/components/BeforeAfterSection';
import { Footer } from '@/components/Footer';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { ScrollingBackground } from '@/components/ScrollingBackground';

export const metadata = {
  title: 'Project Gallery | Pro Square Tiling',
  description: 'Browse our portfolio of bathroom, kitchen, outdoor, and heritage tiling projects.',
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
