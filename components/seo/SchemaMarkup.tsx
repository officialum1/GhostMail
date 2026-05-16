const baseUrl = 'https://ghostmail.store'

const schemas = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    name: 'GhostMail',
    url: baseUrl,
    description: 'Free custom email address for receiving OTPs and sign-ups',
    inLanguage: 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/register`,
      name: 'Create GhostMail account',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    name: 'GhostMail',
    url: baseUrl,
    logo: `${baseUrl}/favicon.svg`,
    description: 'GhostMail provides free custom email addresses for privacy-conscious users',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@ghostmail.store',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${baseUrl}/#app`,
    name: 'GhostMail',
    url: baseUrl,
    applicationCategory: 'CommunicationApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    description: 'Get a free custom email address instantly at ghostmail.store',
  },
]

export const FAQ_PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is GhostMail?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'GhostMail is a free custom email service that gives you a real @ghostmail.store email address instantly. Use it to receive OTPs, sign up for services, and keep your real inbox spam-free.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is GhostMail really free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, completely free. Core features including receiving emails, viewing your inbox, and using your custom address are always free with no hidden charges.',
      },
    },
    {
      '@type': 'Question',
      name: 'How fast do emails arrive?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Emails typically arrive in under 3 seconds. Our infrastructure is powered by Cloudflare, one of the world's largest networks.",
      },
    },
    {
      '@type': 'Question',
      name: 'Can I receive OTPs with GhostMail?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. OTPs from Google, Reddit, X, banks, and other services arrive in seconds in your GhostMail inbox.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use GhostMail for Reddit sign up?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Use your @ghostmail.store address when Reddit asks for an email and the verification email should arrive in your dashboard.',
      },
    },
    {
      '@type': 'Question',
      name: 'Who can read my emails?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Only you. We do not read, sell, or share your emails with anyone.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need a credit card to sign up?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Sign up with just a username and password. Your email address is ready instantly.',
      },
    },
  ],
}

export default function SchemaMarkup() {
  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}

export function FaqSchemaMarkup() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_PAGE_SCHEMA) }}
    />
  )
}
