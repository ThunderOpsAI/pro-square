import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pro Square Tiling | Premium Tiling & Renovation Services',
  description: 'Professional tiling services for residential and commercial projects. Master craftsmanship, precision cuts, and flawless waterproof installations. Request a free quote today.',
  openGraph: {
    title: 'Pro Square Tiling | Premium Tiling & Renovation Services',
    description: 'Professional tiling services for residential and commercial projects. View our gallery and request a free quote.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pro Square Tiling',
    description: 'Professional tiling services for residential and commercial projects.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-sans bg-surface-50 selection:bg-primary-200 text-surface-900 transition-colors duration-500 antialiased">
        {children}
      </body>
    </html>
  );
}
