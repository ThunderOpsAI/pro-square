import { Header } from '@/components/Header';
import { QuoteForm } from '@/components/QuoteForm';
import { Footer } from '@/components/Footer';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { ScrollingBackground } from '@/components/ScrollingBackground';

export const metadata = {
  title: 'Get a Free Quote | Pro Square Tiling',
  description: 'Request a free tiling quote from Pro Square. Fast 24-hour response, no obligation.',
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
