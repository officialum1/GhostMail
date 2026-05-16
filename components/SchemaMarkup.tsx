export default function SchemaMarkup() {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'yourdomain.com';
  const url = process.env.NEXTAUTH_URL || `https://${domain}`;

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "GhostMail",
    "url": url,
    "description": "Free custom email address for receiving OTPs and verifications",
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${url}/register`
    }
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "GhostMail",
    "applicationCategory": "CommunicationApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Get a free custom email address instantly"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
    </>
  );
}
