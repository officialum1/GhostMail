export default function robots() {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'ghostmail.store';
  const url = process.env.NEXTAUTH_URL || `https://${domain}`;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/admin', '/api'],
    },
    sitemap: `${url}/sitemap.xml`,
  };
}
