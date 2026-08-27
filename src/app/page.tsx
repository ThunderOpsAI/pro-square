import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Services } from '@/components/Services';
import { Gallery } from '@/components/Gallery';
import { QuoteForm } from '@/components/QuoteForm';
import { Footer } from '@/components/Footer';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { ScrollingBackground } from '@/components/ScrollingBackground';

export default function HomePage() {
  return (
    <div className="min-h-screen font-sans selection:bg-primary-200 text-surface-900 transition-colors duration-500">
      <ScrollingBackground />
      <Header />
      <main>
        <Hero />
        <Services />
        <Gallery />
        <QuoteForm />
      </main>
      <Footer />
      <ThemeSwitcher />
    </div>
  );
}
