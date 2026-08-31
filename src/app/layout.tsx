import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.prosquaretiling.com'),
  title: 'Pro Square Tiling | Premium Tiling & Renovation Services',
  description: 'Professional tiling services for residential and commercial projects. Master craftsmanship, precision cuts, and flawless waterproof installations. Request a free quote today.',
  alternates: {
    canonical: '/',
  },
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.prosquaretiling.com';
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Pro Square Tiling',
    image: `${appUrl}/images/pro-square-logo.png`,
    url: appUrl,
    telephone: '0467 551 492',
    email: 'info@prosquaretiling.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '663 Banksdale Road',
      addressLocality: 'Hansonville',
      addressRegion: 'VIC',
      postalCode: '3675',
      addressCountry: 'AU'
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen font-sans bg-surface-50 selection:bg-primary-200 text-surface-900 transition-colors duration-500 antialiased">
        {children}
      </body>
    </html>
  );
}
