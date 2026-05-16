const baseUrl = 'https://ghostmail.store'

const schemas = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    name: 'GhostMail',
    url: baseUrl,
    description: 'Free custom email address service for receiving OTPs and sign-ups',
    inLanguage: 'en-US',
    potentialAction: {
      '@type': 'RegisterAction',
      target: `${baseUrl}/register`,
      name: 'Create Free Account',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    name: 'GhostMail',
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/favicon.svg`,
      width: 512,
      height: 512,
    },
    description: 'GhostMail provides free custom email addresses for privacy-conscious users',
    foundingDate: '2025',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'support@ghostmail.store',
        availableLanguage: 'English',
      },
    ],
    sameAs: ['https://twitter.com/ghostmailstore'],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${baseUrl}/#app`,
    name: 'GhostMail',
    url: baseUrl,
    applicationCategory: 'CommunicationApplication',
    applicationSubCategory: 'Email',
    operatingSystem: 'Web Browser',
    browserRequirements: 'Requires JavaScript',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      priceValidUntil: '2026-12-31',
      description: 'Free custom email address forever',
    },
    featureList: [
      'Custom email address',
      'Instant OTP delivery',
      'Private inbox',
      'Spam protection',
      'Cloudflare powered',
    ],
    screenshot: `${baseUrl}/api/og`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '1247',
      bestRating: '5',
      worstRating: '1',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Get a Free Custom Email Address with GhostMail',
    description: 'Get your own @ghostmail.store email address in 3 simple steps',
    totalTime: 'PT1M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '0',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Create Account',
        text: 'Click Create Free Account and choose your username. No credit card needed.',
        url: `${baseUrl}/register`,
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Get Your Email',
        text: 'Instantly receive your username@ghostmail.store email address.',
        url: `${baseUrl}/register`,
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Receive Emails',
        text: 'Use your new address anywhere and receive OTPs and emails in your dashboard.',
        url: `${baseUrl}/dashboard`,
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'GhostMail',
    operatingSystem: 'Web',
    applicationCategory: 'CommunicationApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1247',
    },
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
        text: 'Yes! OTPs from Google, Reddit, Twitter, banks, and any other service arrive in seconds in your GhostMail inbox.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use GhostMail for Reddit sign up?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely! Just use your@ghostmail.store when Reddit asks for an email. Verification emails arrive instantly in your dashboard.',
      },
    },
    {
      '@type': 'Question',
      name: 'Who can read my emails?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Only you. We do not read, sell, or share your emails with anyone. Your privacy is our top priority.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need a credit card to sign up?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No credit card required. Sign up with just a username and password. Your email address is ready instantly.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does GhostMail work with Google sign up?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, GhostMail works with any service that sends emails including Google, Facebook, Twitter, Reddit, and thousands more.',
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
