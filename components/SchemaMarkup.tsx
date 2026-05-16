type FAQItem = {
  question: string;
  answer: string;
};

type SchemaMarkupProps = {
  faqItems?: FAQItem[];
  includeBase?: boolean;
};

const baseUrl = "https://ghostmail.store";

export default function SchemaMarkup({
  faqItems,
  includeBase = true,
}: SchemaMarkupProps) {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GhostMail",
    url: baseUrl,
    description:
      "Free custom email address for receiving OTPs and verifications",
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/register`,
    },
  };

  const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "GhostMail",
    url: baseUrl,
    applicationCategory: "CommunicationApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    description: "Get a free custom email address instantly at ghostmail.store",
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GhostMail",
    url: baseUrl,
    logo: `${baseUrl}/favicon.svg`,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@ghostmail.store",
    },
  };

  const faqSchema =
    faqItems && faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : null;

  return (
    <>
      {includeBase ? (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(webApplicationSchema),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(organizationSchema),
            }}
          />
        </>
      ) : null}
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}
    </>
  );
}
