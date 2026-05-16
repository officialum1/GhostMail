import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/admin', '/api/', '/_next/', '/maintenance'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/dashboard', '/admin', '/api/'],
      },
    ],
    sitemap: 'https://ghostmail.store/sitemap.xml',
    host: 'https://ghostmail.store',
  }
}
