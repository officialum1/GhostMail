export const PUBLIC_DOMAIN = 'ghostmail.store'

export const publicStats = [
  {
    value: '1,981',
    label: 'emails processed',
    detail: 'Live platform volume from GhostMail admin analytics.',
  },
  {
    value: '155',
    label: 'active inboxes',
    detail: 'Growing user base with real inbox usage.',
  },
  {
    value: '98%',
    label: 'delivery success',
    detail: 'Built for OTPs, sign-ups, and verification mail.',
  },
  {
    value: '< 3s',
    label: 'typical delivery',
    detail: 'Fast enough for time-sensitive verification codes.',
  },
] as const

export const trustSignals = [
  {
    title: 'Free forever',
    description: 'Create a real @ghostmail.store address without a card or subscription.',
  },
  {
    title: 'Real inbox',
    description: 'Receive normal email, OTPs, links, receipts, and HTML messages.',
  },
  {
    title: 'Privacy first',
    description: 'Use GhostMail instead of exposing your personal inbox to every site.',
  },
  {
    title: 'Cloudflare powered',
    description: 'Email routing is backed by fast global infrastructure.',
  },
  {
    title: 'Clean dashboard',
    description: 'Read, search, and delete messages from a simple web inbox.',
  },
  {
    title: 'No setup friction',
    description: 'Pick a username and your address is ready in seconds.',
  },
] as const

export const liveInboxEmails = [
  {
    sender: 'Google',
    subject: 'Your verification code',
    preview: 'Use 847291 to finish signing in to your account.',
    tag: 'OTP',
    time: 'Just now',
  },
  {
    sender: 'Reddit',
    subject: 'Confirm your email',
    preview: 'Open the verification link to finish creating your profile.',
    tag: 'Signup',
    time: '1 min ago',
  },
  {
    sender: 'Discord',
    subject: 'Verify your account',
    preview: 'This message was delivered to your GhostMail inbox.',
    tag: 'Verify',
    time: '2 min ago',
  },
  {
    sender: 'GitHub',
    subject: 'Device confirmation',
    preview: 'A new sign-in needs confirmation before it can continue.',
    tag: 'Security',
    time: '3 min ago',
  },
] as const

export const expandedFaqCategories = [
  {
    title: 'Getting started',
    items: [
      {
        question: 'What is GhostMail?',
        answer:
          'GhostMail gives you a real @ghostmail.store email address you can use for sign-ups, OTPs, confirmations, and privacy-focused browsing.',
      },
      {
        question: 'How do I create an address?',
        answer:
          'Choose a username, set a password, and your inbox is created instantly. The address format is username@ghostmail.store.',
      },
      {
        question: 'Is GhostMail free?',
        answer:
          'Yes. The core inbox experience is free, including creating an address and receiving email.',
      },
      {
        question: 'Do I need my real email to register?',
        answer:
          'No. GhostMail is designed so you can create an inbox without handing over your personal email address.',
      },
    ],
  },
  {
    title: 'Receiving OTPs and sign-ups',
    items: [
      {
        question: 'Can I receive OTP codes online?',
        answer:
          'Yes. GhostMail is built for OTPs, verification links, account confirmations, and one-time sign-up emails.',
      },
      {
        question: 'How fast do emails arrive?',
        answer:
          'Most emails arrive within a few seconds. Delivery speed can vary by the sender, but the GhostMail inbox updates quickly.',
      },
      {
        question: 'Can I use GhostMail for Reddit or Discord?',
        answer:
          'Yes. Use your @ghostmail.store address during sign-up and check your GhostMail inbox for the verification message.',
      },
      {
        question: 'Can I receive HTML emails?',
        answer:
          'Yes. GhostMail supports normal emails including plain text, HTML previews, OTP messages, and verification links.',
      },
    ],
  },
  {
    title: 'Privacy and security',
    items: [
      {
        question: 'Why use GhostMail instead of my real inbox?',
        answer:
          'It keeps your personal email away from random websites, trials, newsletters, and services you only want to test once.',
      },
      {
        question: 'Is GhostMail a temporary email service?',
        answer:
          'GhostMail is an alternative to throwaway email. You get a reusable address and private dashboard instead of a short-lived disposable inbox.',
      },
      {
        question: 'Can I delete old messages?',
        answer:
          'Yes. You can remove messages from your dashboard when you no longer need them.',
      },
      {
        question: 'Do you sell user data?',
        answer:
          'No. GhostMail is built around privacy-first email usage, not selling personal inbox activity.',
      },
    ],
  },
  {
    title: 'Product details',
    items: [
      {
        question: 'Can I send email from GhostMail?',
        answer:
          'GhostMail is currently focused on receiving email. Outbound sending is limited compared with the inbox experience.',
      },
      {
        question: 'Can developers use GhostMail for testing?',
        answer:
          'Yes. It is useful for testing account creation, email verification flows, OTP delivery, and onboarding emails.',
      },
      {
        question: 'What happens if a service blocks disposable email?',
        answer:
          'GhostMail uses a real custom domain, but every third-party service controls its own allowlist and blocking rules.',
      },
      {
        question: 'Where can I check platform status?',
        answer:
          'The public status page shows current web app, inbox, routing, and admin dashboard health.',
      },
    ],
  },
] as const

export const seoLandingPages = [
  {
    slug: 'free-email-address',
    title: 'Free Email Address - GhostMail',
    description:
      'Create a free @ghostmail.store email address for sign-ups, OTPs, and private browsing. No credit card required.',
    kicker: 'Free email address',
    h1: 'Create a free email address that is ready in seconds.',
    intro:
      'GhostMail gives you a real inbox for verifications, receipts, sign-ups, and privacy-first browsing without exposing your personal email.',
    proof: 'No credit card. No real email required.',
    bullets: ['Free @ghostmail.store address', 'Private inbox dashboard', 'Works for OTPs and sign-ups'],
    useCases: [
      'Create accounts without using your personal inbox.',
      'Receive verification codes and email confirmations.',
      'Keep newsletters and one-off sites away from your main email.',
    ],
    faq: [
      {
        question: 'Can I create a free email address instantly?',
        answer:
          'Yes. Choose a username and GhostMail creates your @ghostmail.store address right away.',
      },
      {
        question: 'Do I need a credit card?',
        answer: 'No. GhostMail is free to start and does not require a card.',
      },
    ],
    related: ['receive-otp-online', 'burner-email', 'temporary-email-alternative'],
  },
  {
    slug: 'receive-otp-online',
    title: 'Receive OTP Online - GhostMail',
    description:
      'Receive OTP codes online with a private @ghostmail.store inbox for sign-ups, logins, and verification emails.',
    kicker: 'Receive OTP online',
    h1: 'Receive OTP emails online without using your real inbox.',
    intro:
      'Use GhostMail when a website asks for an email verification code, login confirmation, or one-time password.',
    proof: 'Fast delivery for time-sensitive verification messages.',
    bullets: ['OTP-friendly inbox', 'Verification link previews', 'Private account access'],
    useCases: [
      'Receive Google, Reddit, Discord, and app verification messages.',
      'Keep OTP traffic out of your personal inbox.',
      'Use a dedicated inbox for testing auth flows.',
    ],
    faq: [
      {
        question: 'Can GhostMail receive OTP codes?',
        answer:
          'Yes. OTP and verification emails are one of the main reasons people use GhostMail.',
      },
      {
        question: 'How fast do OTP emails arrive?',
        answer:
          'Most messages arrive within a few seconds, depending on the sender.',
      },
    ],
    related: ['free-email-address', 'email-for-discord', 'email-for-reddit'],
  },
  {
    slug: 'temporary-email-alternative',
    title: 'Temporary Email Alternative - GhostMail',
    description:
      'Use GhostMail as a better temporary email alternative with a reusable private inbox and custom @ghostmail.store address.',
    kicker: 'Temporary email alternative',
    h1: 'A reusable alternative to temporary email.',
    intro:
      'Throwaway inboxes disappear fast. GhostMail gives you a private reusable address that still protects your real email.',
    proof: 'Reusable, private, and simple to manage.',
    bullets: ['Reusable address', 'Private dashboard', 'Cleaner long-term account control'],
    useCases: [
      'Keep access to important verification emails after sign-up.',
      'Avoid losing accounts because a temporary inbox expired.',
      'Separate low-trust sites from your main email.',
    ],
    faq: [
      {
        question: 'Is GhostMail temporary email?',
        answer:
          'GhostMail is a privacy inbox that works as a stronger alternative to short-lived temporary email.',
      },
      {
        question: 'Can I keep using the same address?',
        answer: 'Yes. Your GhostMail address is reusable after registration.',
      },
    ],
    related: ['burner-email', 'free-email-address', 'receive-otp-online'],
  },
  {
    slug: 'burner-email',
    title: 'Burner Email Address - GhostMail',
    description:
      'Create a burner-style email address with GhostMail to protect your real inbox from spam, trials, and random sign-ups.',
    kicker: 'Burner email',
    h1: 'Use a burner email address without losing control.',
    intro:
      'GhostMail helps you create a separate address for sites you do not fully trust while keeping a real inbox behind it.',
    proof: 'Privacy for one-off sites, trials, and sign-ups.',
    bullets: ['Protect your real inbox', 'Receive normal email', 'Delete messages when done'],
    useCases: [
      'Sign up for trials without inviting spam into your main inbox.',
      'Use a separate email for marketplaces and forums.',
      'Test products without mixing messages into personal email.',
    ],
    faq: [
      {
        question: 'What is a burner email address?',
        answer:
          'A burner email is a separate address used to protect your main inbox from spam or low-trust sign-ups.',
      },
      {
        question: 'Can I receive real emails with it?',
        answer: 'Yes. GhostMail receives normal emails, OTPs, and verification links.',
      },
    ],
    related: ['temporary-email-alternative', 'free-email-address', 'email-for-reddit'],
  },
  {
    slug: 'email-for-reddit',
    title: 'Email for Reddit Sign Up - GhostMail',
    description:
      'Use a private @ghostmail.store email for Reddit sign-ups and receive your verification message in seconds.',
    kicker: 'Email for Reddit',
    h1: 'Use GhostMail as your email for Reddit sign-up.',
    intro:
      'Create a separate inbox for Reddit verification, communities, notifications, and account recovery messages.',
    proof: 'Keep Reddit traffic out of your personal inbox.',
    bullets: ['Private Reddit sign-up email', 'Verification link support', 'Reusable account inbox'],
    useCases: [
      'Create a Reddit account without exposing your personal email.',
      'Receive Reddit verification links in your GhostMail dashboard.',
      'Keep forum notifications separated from personal email.',
    ],
    faq: [
      {
        question: 'Can I use GhostMail for Reddit?',
        answer:
          'Yes. Enter your @ghostmail.store address during Reddit sign-up and check your inbox for the verification email.',
      },
      {
        question: 'Will Reddit emails show in the dashboard?',
        answer: 'Yes. Reddit messages sent to your GhostMail address show in your inbox.',
      },
    ],
    related: ['receive-otp-online', 'burner-email', 'email-for-discord'],
  },
  {
    slug: 'email-for-discord',
    title: 'Email for Discord Sign Up - GhostMail',
    description:
      'Use GhostMail as a private email for Discord sign-ups, OTPs, and account verification messages.',
    kicker: 'Email for Discord',
    h1: 'Use a private email for Discord verification.',
    intro:
      'Create a GhostMail inbox for Discord sign-up, verification links, security notices, and community account management.',
    proof: 'Separate Discord account mail from your personal inbox.',
    bullets: ['Discord verification email', 'Private inbox access', 'Fast OTP delivery'],
    useCases: [
      'Receive Discord account verification emails.',
      'Keep community account mail in a separate inbox.',
      'Use GhostMail for testing Discord-related flows.',
    ],
    faq: [
      {
        question: 'Can GhostMail receive Discord verification emails?',
        answer:
          'Yes. Use your GhostMail address during sign-up and check the inbox for the verification email.',
      },
      {
        question: 'Can I reuse the same email later?',
        answer: 'Yes. Your GhostMail address remains available through your account.',
      },
    ],
    related: ['receive-otp-online', 'email-for-reddit', 'free-email-address'],
  },
] as const

export type SeoLandingPageData = (typeof seoLandingPages)[number]

export function getSeoLandingPage(slug: string): SeoLandingPageData {
  const page = seoLandingPages.find((item) => item.slug === slug)

  if (!page) {
    throw new Error(`Unknown SEO landing page: ${slug}`)
  }

  return page
}

export const statusChecks = [
  {
    name: 'Web app',
    status: 'Operational',
    detail: 'Homepage, login, registration, and dashboard pages are available.',
  },
  {
    name: 'Email routing',
    status: 'Operational',
    detail: 'Inbound mail routing is accepting messages for GhostMail inboxes.',
  },
  {
    name: 'Inbox delivery',
    status: 'Operational',
    detail: 'Messages are being processed and shown in the user dashboard.',
  },
  {
    name: 'Admin dashboard',
    status: 'Operational',
    detail: 'Admin metrics, security, users, and analytics pages are online.',
  },
] as const
