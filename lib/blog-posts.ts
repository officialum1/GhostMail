export type BlogPost = {
  slug: string
  title: string
  description: string
  publishedAt: string
  author: string
  body: string[]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'protect-email-privacy-2025',
    title: 'How to Protect Your Email Privacy in 2025',
    description:
      'Practical steps to keep your real inbox private when signing up for apps, newsletters, and online services.',
    publishedAt: '2025-05-01',
    author: 'GhostMail Team',
    body: [
      'Your email address is more than a login—it is a persistent identifier tied to marketing lists, data brokers, and breach databases.',
      'Use a dedicated custom email address at ghostmail.store for sign-ups, trials, and one-time verifications so your primary inbox stays clean.',
      'GhostMail helps you receive OTP codes and verification emails without exposing your real address to spam or resale lists.',
    ],
  },
  {
    slug: 'receive-otps-without-real-email',
    title: 'Best Ways to Receive OTPs Without Your Real Email',
    description:
      'How to receive OTP and verification emails safely using a free custom inbox instead of your personal address.',
    publishedAt: '2025-05-08',
    author: 'GhostMail Team',
    body: [
      'One-time passwords from Google, Reddit, banks, and social apps need a reliable inbox that arrives in seconds.',
      'A free custom email address on ghostmail.store is built for receive OTP workflows—open your dashboard and copy the code.',
      'Keep email privacy intact by separating verification traffic from the inbox you use for friends, work, and banking.',
    ],
  },
  {
    slug: 'never-give-real-email-to-random-sites',
    title: 'Why You Should Never Give Your Real Email to Random Sites',
    description:
      'Every sign-up can lead to spam, leaks, and tracking. Learn why a burner-style custom address is safer.',
    publishedAt: '2025-05-12',
    author: 'GhostMail Team',
    body: [
      'Random sites often share or sell addresses to partners. One form can mean years of promotional email.',
      'Using a secondary address limits blast radius if that site is breached or sold.',
      'GhostMail gives you a real @ghostmail.store address with no spam to your personal mailbox—free email, no credit card.',
    ],
  },
  {
    slug: 'ghostmail-cloudflare-instant-delivery',
    title: 'How GhostMail Uses Cloudflare for Instant Email Delivery',
    description:
      'Behind the scenes of fast OTP and verification delivery on GhostMail’s Cloudflare-powered stack.',
    publishedAt: '2025-05-14',
    author: 'GhostMail Team',
    body: [
      'Speed matters when you are waiting on a login code. GhostMail routes inbound mail through modern infrastructure.',
      'Cloudflare’s global network helps messages reach your inbox quickly—typically in under three seconds.',
      'That reliability makes ghostmail.store a strong choice for sign-ups that cannot wait on slow disposable providers.',
    ],
  },
  {
    slug: 'free-vs-paid-email-services',
    title: 'Free vs Paid Email Services: What You Actually Need',
    description:
      'Compare free custom email services with paid options and learn what most users need for OTPs and privacy.',
    publishedAt: '2025-05-16',
    author: 'GhostMail Team',
    body: [
      'Paid mailboxes add storage and branding; many people only need a secondary inbox for verifications.',
      'GhostMail’s free tier covers receive OTP, custom email address, and web inbox access with no hidden fees.',
      'Upgrade paths can come later—start with a free account and keep your real email off random sign-up forms.',
    ],
  },
]

export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug)
}
