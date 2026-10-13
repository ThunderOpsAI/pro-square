import { MetadataRoute } from 'next';
import { SITE_URL, SERVICES } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = '2026-10-13';

  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/services`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    ...SERVICES.map((s) => ({
      url: `${SITE_URL}/services/${s.slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    { url: `${SITE_URL}/gallery`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/reviews`, lastModified, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/quote`, lastModified, changeFrequency: 'yearly', priority: 0.6 },
  ];
}
