import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { HomeIntro } from '@/components/HomeIntro';
import { Services } from '@/components/Services';
import { ReviewsHighlight } from '@/components/ReviewsHighlight';
import { FaqSection } from '@/components/FaqSection';
import { PreFooterCTAs } from '@/components/PreFooterCTAs';
import { Footer } from '@/components/Footer';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { ScrollingBackground } from '@/components/ScrollingBackground';
import { GENERAL_FAQS } from '@/lib/seo';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <div className="relative min-h-screen font-sans selection:bg-primary-200 text-surface-900 transition-colors duration-500 overflow-x-hidden">
      <ScrollingBackground />
      <Header />
      <main className="relative z-10">
        <Hero />
        <HomeIntro />
        <Services />
        <ReviewsHighlight />
        <FaqSection faqs={GENERAL_FAQS} />
        <PreFooterCTAs />
      </main>
      <Footer />
      <ThemeSwitcher />
    </div>
  );
}
