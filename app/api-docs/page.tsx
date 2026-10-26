// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import type { Metadata } from 'next'
import PageLayout from '@/components/PageLayout'
import ApiDocsClient from '@/components/ApiDocsClient'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Developer REST API & OTP Docs — GhostMail Pro',
  description:
    'Complete Developer REST API documentation for GhostMail. Programmatically create inboxes, query messages, and automatically extract OTP verification codes via API.',
  alternates: { canonical: `${SITE_URL}/api-docs` },
}

export default function ApiDocsPage() {
  return (
    <PageLayout>
      <ApiDocsClient />
    </PageLayout>
  )
}
