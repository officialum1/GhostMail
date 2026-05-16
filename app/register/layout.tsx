import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Create Free Email Account — GhostMail',
  description:
    'Sign up for a free GhostMail account and get your own @ghostmail.store email address instantly. No credit card required. Start receiving OTPs in seconds.',
  alternates: { canonical: `${SITE_URL}/register` },
  robots: { index: true, follow: true },
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children
}
