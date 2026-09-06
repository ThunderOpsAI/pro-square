import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { ScrollingBackground } from '@/components/ScrollingBackground';
import { ApprovedReviews } from '@/components/ApprovedReviews';
import { ReviewSubmitForm } from '@/components/ReviewSubmitForm';

export const metadata: Metadata = {
  title: 'Client Reviews & Testimonials | Pro Square Tiling',
  description: 'Read reviews from homeowners and builders, or leave your feedback on our architectural and luxury tiling services.',
  openGraph: {
    title: 'Client Reviews & Testimonials | Pro Square Tiling',
    description: 'Read reviews from homeowners and builders, or leave your feedback on our architectural and luxury tiling services.',
    type: 'website',
  },
};

export default function ReviewsPage() {
  return (
    <div className="relative min-h-screen font-sans selection:bg-primary-200 text-surface-900 transition-colors duration-500 overflow-x-hidden">
      <ScrollingBackground />
      <Header />
      <main className="relative z-10">
        <ApprovedReviews />
        <ReviewSubmitForm />
      </main>
      <Footer />
      <ThemeSwitcher />
    </div>
  );
}
