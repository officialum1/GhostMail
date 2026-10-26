// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, Briefcase, LifeBuoy, Mail, MessageSquare } from 'lucide-react'
import PageLayout from '@/components/PageLayout'
import PublicHero from '@/components/public/PublicHero'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Contact GhostMail — Get Support',
  description:
    'Contact the GhostMail team for help, feedback, or business inquiries. We respond within 24 hours.',
  alternates: { canonical: `${SITE_URL}/contact` },
}

const contacts = [
  {
    icon: LifeBuoy,
    title: 'Customer Support',
    email: 'support@ghostmail.store',
    body: 'For account recovery, mailbox issues, or technical integration questions.',
  },
  {
    icon: Briefcase,
    title: 'Business & Partnerships',
    email: 'business@ghostmail.store',
    body: 'For custom domain integrations, volume API limits, or press inquiries.',
  },
  {
    icon: AlertTriangle,
    title: 'Abuse & Security Reports',
    email: 'abuse@ghostmail.store',
    body: 'To report spam vectors, phishing attempts, or protocol misuse.',
  },
]

export default function ContactPage() {
  return (
    <PageLayout>
      <div className="w-full">
        <PublicHero
          badgeText="Support Desk"
          badgeIcon={<MessageSquare className="h-3.5 w-3.5 text-cyan-500" />}
          title="We're here to help you"
          highlightText="stay private."
          description="GhostMail is engineered to feel fast, dependable, and transparent. If you ever have a question or need assistance, our team is directly accessible."
        />

        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {contacts.map((contact) => {
              const Icon = contact.icon
              return (
                <div
                  key={contact.title}
                  className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/70 p-6 shadow-sm backdrop-blur flex flex-col justify-between"
                >
                  <div>
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h2 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{contact.title}</h2>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{contact.body}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-white/5">
                    <Link
                      href={`mailto:${contact.email}`}
                      className="inline-flex items-center gap-2 text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {contact.email}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </PageLayout>
  )
}
