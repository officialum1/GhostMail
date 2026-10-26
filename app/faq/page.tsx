// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, HelpCircle, MessageSquare } from 'lucide-react'
import PageLayout from '@/components/PageLayout'
import PublicHero from '@/components/public/PublicHero'
import { FaqSchemaMarkup } from '@/components/seo/SchemaMarkup'
import FAQAccordion from '@/components/FAQAccordion'
import { expandedFaqCategories } from '@/lib/public-content'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'FAQ - GhostMail Frequently Asked Questions',
  description:
    'Answers about GhostMail email addresses, OTP delivery, burner email use, Reddit and Discord sign-ups, privacy, and account security.',
  alternates: { canonical: `${SITE_URL}/faq` },
}

export default function FAQPage() {
  return (
    <PageLayout>
      <FaqSchemaMarkup />
      <div className="w-full">
        {/* Unified Hero */}
        <PublicHero
          badgeText="Knowledge Base"
          badgeIcon={<HelpCircle className="h-3.5 w-3.5 text-cyan-500" />}
          title="Answers before you trust"
          highlightText="a new inbox."
          description="Clear, honest details about receiving OTPs, protecting your real email address, rate limits, and custom inbox options."
          primaryCtaText="Get Free Address"
          primaryCtaLink="/register"
          secondaryCtaText="Contact Support"
          secondaryCtaLink="/contact"
        />

        {/* Categorized FAQs */}
        <section className="py-16">
          <div className="mx-auto max-w-4xl px-6 space-y-12">
            {expandedFaqCategories.map((category) => (
              <div key={category.title} className="space-y-4">
                <div className="border-b border-slate-200/80 dark:border-white/10 pb-3">
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {category.title}
                  </h2>
                </div>
                <FAQAccordion items={category.items} />
              </div>
            ))}

            {/* Support CTA card */}
            <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent p-6 text-center backdrop-blur">
              <MessageSquare className="h-8 w-8 text-cyan-500 mx-auto" />
              <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">Still have questions?</h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Our support desk is open 24/7 for technical questions, custom domain setups, and developer API requests.
              </p>
              <div className="mt-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 transition"
                >
                  Reach Out To Support
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  )
}
