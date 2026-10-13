import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { ScrollingBackground } from '@/components/ScrollingBackground';
import { ApprovedReviews, type ReviewItem } from '@/components/ApprovedReviews';
import { ReviewSubmitForm } from '@/components/ReviewSubmitForm';
import prisma from '@/lib/prisma';

const reviewsTitle = 'Tiler Reviews | Wangaratta & North East VIC | Pro Square Tiling';
const reviewsDescription =
  'Read reviews from homeowners and builders across Wangaratta, Benalla, Beechworth & Albury–Wodonga, from small repairs to French cut and luxury tiling. Leave your own feedback.';

export const metadata: Metadata = {
  title: reviewsTitle,
  description: reviewsDescription,
  alternates: { canonical: '/reviews' },
  openGraph: {
    title: reviewsTitle,
    description: reviewsDescription,
    url: '/reviews',
    type: 'website',
    images: [{ url: '/images/projects/project-13-master-ensuite.jpg', alt: 'Luxury ensuite tiled by Pro Square Tiling' }],
  },
};

// Re-render at most every 5 minutes so newly approved reviews appear without a redeploy.
export const revalidate = 300;

async function getApprovedReviews(): Promise<ReviewItem[]> {
  try {
    const rows = await prisma.review.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      select: { id: true, customerName: true, starRating: true, reviewText: true, projectType: true, createdAt: true },
    });
    return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
  } catch (err) {
    console.error('[Reviews page] Failed to load reviews on server:', err);
    return [];
  }
}

export default async function ReviewsPage() {
  const reviews = await getApprovedReviews();

  return (
    <div className="relative min-h-screen font-sans selection:bg-primary-200 text-surface-900 transition-colors duration-500 overflow-x-hidden">
      <ScrollingBackground />
      <Header />
      <main className="relative z-10">
        <ApprovedReviews initialReviews={reviews} />
        <ReviewSubmitForm />
      </main>
      <Footer />
      <ThemeSwitcher />
    </div>
  );
}
