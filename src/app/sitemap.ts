import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.prosquaretiling.com';

  return [
    {
      url: `${appUrl}/`,
      lastModified: '2026-08-30',
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
