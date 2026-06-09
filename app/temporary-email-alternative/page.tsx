import type { Metadata } from 'next'
import SeoLandingPage from '@/components/public/SeoLandingPage'
import { getSeoLandingPage } from '@/lib/public-content'
import { SITE_URL } from '@/lib/seo'

const page = getSeoLandingPage('temporary-email-alternative')

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: { canonical: `${SITE_URL}/${page.slug}` },
}

export default function TemporaryEmailAlternativePage() {
  return <SeoLandingPage page={page} />
}
