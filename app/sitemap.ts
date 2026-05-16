

export default function sitemap() {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'ghostmail.store';
  const url = process.env.NEXTAUTH_URL || `https://${domain}`;

  return [
    { url: url, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${url}/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${url}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${url}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${url}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${url}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${url}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${url}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];
}
