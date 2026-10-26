// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import type { Metadata } from 'next'
import { ShieldCheck } from 'lucide-react'
import PageLayout from '@/components/PageLayout'
import PublicHero from '@/components/public/PublicHero'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Privacy Policy — GhostMail',
  description:
    'GhostMail privacy policy. Learn how we protect your data and respect your privacy. Zero advertising trackers.',
  alternates: { canonical: `${SITE_URL}/privacy` },
}

const sections = [
  {
    title: '1. Privacy by Architecture',
    body: 'GhostMail is engineered with a strict zero-tracker policy. We do not embed ad pixels, behavioral profiling scripts, or marketing cookies anywhere on our platform.',
  },
  {
    title: '2. Information We Process',
    body: 'We store the mailbox address you claim and messages routed to it. We store securely hashed passwords for registered accounts. We log transient IP access solely for DDoS prevention and brute-force protection.',
  },
  {
    title: '3. Zero Data Brokering',
    body: 'Your email contents, metadata, and inbox identifiers are never sold, rented, monetized, or shared with marketing affiliates or third-party data brokers.',
  },
  {
    title: '4. Infrastructure & Encryption',
    body: 'Communications are processed through Cloudflare edge proxy layers with TLS 1.3 encryption in transit and AES-256 database isolation at rest.',
  },
  {
    title: '5. Data Retention & Purges',
    body: 'Disposable mailboxes and verification OTPs are automatically scheduled for permanent deletion based on retention rules. You can manually delete individual messages at any time.',
  },
  {
    title: '6. User Rights (GDPR & CCPA)',
    body: 'You have full rights to request an export of your account data or complete permanent deletion of your credentials and mail history.',
  },
]

export default function PrivacyPage() {
  return (
    <PageLayout>
      <div className="w-full">
        <PublicHero
          badgeText="Zero Trackers"
          badgeIcon={<ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />}
          title="Privacy Policy &"
          highlightText="Data Protection."
          description="GhostMail exists to protect your identity, not exploit it. We do not participate in advertising networks or sell user telemetry."
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
