import type { Metadata } from 'next'
import PageLayout from '@/components/PageLayout'
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
      <section className="mx-auto max-w-5xl px-6 py-20 md:py-32">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase text-cyan-600 dark:text-cyan-300">FAQ</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900 dark:text-white md:text-6xl">
            Answers before you trust a new inbox.
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
            Clear details about receiving OTPs, using GhostMail for sign-ups,
            protecting your real email, and managing your private inbox.
          </p>
        </div>

        <div className="mt-14 space-y-10">
          {expandedFaqCategories.map((category) => (
            <div key={category.title}>
              <h2 className="mb-5 text-2xl font-semibold text-slate-900 dark:text-white">{category.title}</h2>
              <FAQAccordion items={category.items} />
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
  )
}
