// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import type { Metadata } from 'next'
import { FileText } from 'lucide-react'
import PageLayout from '@/components/PageLayout'
import PublicHero from '@/components/public/PublicHero'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Terms of Service — GhostMail',
  description:
    'Read GhostMail terms of service. Understand your rights and responsibilities when using our free email service.',
  alternates: { canonical: `${SITE_URL}/terms` },
}

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing or using GhostMail, you agree to these Terms of Service. If you do not agree with any provision, please do not use the platform.',
  },
  {
    title: '2. Description of Service',
    body: 'GhostMail provides disposable and permanent email addresses under @ghostmail.store, web-based inbox access, real-time message routing, and programmatic developer REST APIs.',
  },
  {
    title: '3. User Accounts & Fair Use',
    body: 'Usernames must be 3 to 20 characters and follow alphanumeric conventions. You are responsible for maintaining your security credentials. Abuse prevention limits apply across all tiers.',
  },
  {
    title: '4. Prohibited Behavior',
    body: 'You may not use GhostMail for spam distribution, unlawful activities, bulk scraping attacks, phishing campaigns, malware hosting, or intentional platform disruption.',
  },
  {
    title: '5. Email Retention & Storage',
    body: 'Inbound emails are stored temporarily to facilitate access via web and API. Messages are subject to automatic retention purges after specified inactivity windows.',
  },
  {
    title: '6. Developer Pro Tier & Payments',
    body: 'Developer API subscriptions are processed via cryptocurrency gateways (USDT, Binance Pay). Pro keys grant elevated rate limits (120 req/min) and programmatic mailbox generation.',
  },
  {
    title: '7. Limitation of Liability',
    body: 'GhostMail is provided on an "as-is" and "as-available" basis. We are not liable for incidental or consequential damages arising from service interruption or lost communications.',
  },
]

export default function TermsPage() {
  return (
    <PageLayout>
      <div className="w-full">
        <PublicHero
          badgeText="Legal Agreement"
          badgeIcon={<FileText className="h-3.5 w-3.5 text-cyan-500" />}
          title="Terms of Service &"
          highlightText="Fair Use Guidelines."
          description="Last updated October 2026. Clear, transparent principles governing your use of GhostMail web inboxes and developer APIs."
        />

        <section className="py-16">
          <div className="mx-auto max-w-4xl px-6 space-y-6">
            {sections.map((section) => (
              <div
                key={section.title}
                className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/70 p-6 shadow-sm backdrop-blur"
              >
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{section.title}</h2>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">{section.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageLayout>
  )
}
