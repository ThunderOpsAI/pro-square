import type { Metadata } from 'next';
import './globals.css';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, BUSINESS, businessJsonLd } from '@/lib/seo';

const defaultTitle = 'Tiler Wangaratta & North East VIC | French Cut & Luxury Tiling | Pro Square Tiling';
const defaultDescription =
  'Specialist tiler in Wangaratta, Benalla, Beechworth, Myrtleford & Albury–Wodonga. French cut mitred edges, slab, bathroom, kitchen & pool tiling, plus small jobs and repairs. Free quotes.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: defaultTitle,
    template: '%s',
  },
  description: defaultDescription,
  applicationName: BUSINESS.name,
  openGraph: {
    siteName: BUSINESS.name,
    title: defaultTitle,
    description: defaultDescription,
    type: 'website',
    locale: 'en_AU',
    images: [{ url: BUSINESS.ogImage, alt: 'Luxury ensuite tiled by Pro Square Tiling' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
    images: [BUSINESS.ogImage],
  },
  icons: {
    icon: '/images/pro-square-icon.png',
    apple: '/images/pro-square-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-AU" suppressHydrationWarning>
      <head>
        <JsonLd data={businessJsonLd()} />
      </head>
      <body className="min-h-screen font-sans bg-surface-50 selection:bg-primary-200 text-surface-900 transition-colors duration-500 antialiased">
        {children}
      </body>
    </html>
  );
}
