import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Login — GhostMail',
  description: 'Sign in to your GhostMail account to access your private email inbox.',
  alternates: { canonical: `${SITE_URL}/login` },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
