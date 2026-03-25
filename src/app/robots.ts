import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/wycena/', '/wycena/dane/'],
      },
    ],
    sitemap: 'https://giviu.pl/sitemap.xml',
  };
}
