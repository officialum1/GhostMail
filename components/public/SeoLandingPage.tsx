// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import Link from 'next/link'
import { ArrowRight, Check, HelpCircle, Search, ShieldCheck } from 'lucide-react'
import PageLayout from '@/components/PageLayout'
import LiveInboxPreview from '@/components/public/LiveInboxPreview'
import TrustGrid from '@/components/public/TrustGrid'
import UsernameClaimForm from '@/components/public/UsernameClaimForm'
import {
  getSeoLandingPage,
  seoLandingPages,
  type SeoLandingPageData,
} from '@/lib/public-content'

type SeoLandingPageProps = {
  page: SeoLandingPageData
}

export default function SeoLandingPage({ page }: SeoLandingPageProps) {
  const relatedPages = page.related.map(getSeoLandingPage)

  return (
    <PageLayout>
      <div className="w-full">
        {/* SEO Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-slate-200/60 dark:border-white/5">
          <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-cyan-500/10 blur-[100px] dark:bg-cyan-500/15" />

          <div className="relative mx-auto max-w-7xl px-6 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-600 dark:text-cyan-300 shadow-sm">
                <Search className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{page.kicker}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                {page.h1}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                {page.intro}
              </p>

              <div className="max-w-xl pt-2">
                <UsernameClaimForm />
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {page.bullets.map((bullet) => (
                  <span
                    key={bullet}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 backdrop-blur"
                  >
                    <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
                    {bullet}
                  </span>
                ))}
              </div>
            </div>

            <div className="w-full">
              <LiveInboxPreview compact />
            </div>
          </div>
        </section>

        {/* Use Case Proof */}
        <section className="py-16 border-b border-slate-200/60 dark:border-white/5">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Why It Matters</span>
                <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {page.proof}
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {page.useCases.map((useCase) => (
                  <div
                    key={useCase}
                    className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/70 p-5 shadow-sm backdrop-blur"
                  >
                    <ShieldCheck className="h-5 w-5 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
                    <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">{useCase}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <TrustGrid />

        {/* Page Specific FAQs */}
        <section className="py-16 border-b border-slate-200/60 dark:border-white/5">
          <div className="mx-auto max-w-4xl px-6">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Quick Answers</span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Frequently asked questions.
              </h2>
            </div>
            <div className="space-y-3">
              {page.faq.map((item) => (
                <div
                  key={item.question}
                  className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/70 p-5 shadow-sm backdrop-blur"
                >
                  <div className="flex items-start gap-3">
                    <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.question}</h3>
                      <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related Pages Grid */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Related Email Privacy Guides</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPages.map((related) => (
                <Link
                  key={related.slug}
                  href={`/${related.slug}`}
                  className="group rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/70 p-5 shadow-sm backdrop-blur transition hover:border-cyan-500/40"
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                    {related.kicker}
                  </span>
                  <h4 className="mt-1.5 text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors">
                    {related.h1}
                  </h4>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{related.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-cyan-600 dark:text-cyan-400">
                    Read guide
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Hidden SEO link bank for Googlebot */}
        <section className="sr-only" aria-label="All GhostMail SEO directory">
          {seoLandingPages.map((item) => (
            <Link key={item.slug} href={`/${item.slug}`}>
              {item.title}
            </Link>
          ))}
        </section>
      </div>
    </PageLayout>
  )
}
