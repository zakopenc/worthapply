import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/analyzer/',
          '/digest/',
          '/resume/',
          '/tailor/',
          '/cover-letter/',
          '/tracker/',
          '/applications/',
          '/onboarding/',
          '/settings/',
          '/api/',
          '/auth/',
        ],
      },
    ],
    sitemap: 'https://www.worthapply.com/sitemap.xml',
  };
}
