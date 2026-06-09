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
      <div className="relative overflow-hidden bg-[#0a0f1e]">
        <section className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 md:py-28 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200">
              <Search className="h-4 w-4" aria-hidden="true" />
              {page.kicker}
            </div>
            <h1 className="mt-7 max-w-4xl text-4xl font-bold leading-tight text-white md:text-6xl">
              {page.h1}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              {page.intro}
            </p>
            <div className="mt-8 max-w-2xl">
              <UsernameClaimForm />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {page.bullets.map((bullet) => (
                <span
                  key={bullet}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300"
                >
                  <Check className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                  {bullet}
                </span>
              ))}
            </div>
          </div>
          <LiveInboxPreview compact />
        </section>

        <section className="relative mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase text-cyan-300">Why it helps</p>
              <h2 className="mt-4 text-3xl font-bold text-white md:text-5xl">
                {page.proof}
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {page.useCases.map((useCase) => (
                <div key={useCase} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <ShieldCheck className="h-5 w-5 text-cyan-300" aria-hidden="true" />
                  <p className="mt-4 text-sm leading-6 text-slate-300">{useCase}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <TrustGrid />

        <section className="relative mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-sm font-semibold uppercase text-cyan-300">FAQ</p>
              <h2 className="mt-4 text-3xl font-bold text-white md:text-5xl">
                Quick answers
              </h2>
            </div>
            <div className="grid gap-4">
              {page.faq.map((item) => (
                <div key={item.question} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="mt-1 h-5 w-5 shrink-0 text-cyan-300" aria-hidden="true" />
                    <div>
                      <h3 className="font-semibold text-white">{item.question}</h3>
                      <p className="mt-2 leading-7 text-slate-400">{item.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-6 pb-24">
          <div className="grid gap-4 md:grid-cols-3">
            {relatedPages.map((related) => (
              <Link
                key={related.slug}
                href={`/${related.slug}`}
                className="group rounded-2xl border border-white/10 bg-[#0e1728] p-6 transition hover:border-cyan-400/30"
              >
                <p className="text-sm font-semibold uppercase text-cyan-300">
                  {related.kicker}
                </p>
                <h3 className="mt-4 text-xl font-semibold text-white">{related.h1}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{related.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">
                  Open page
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-6 pb-24">
          <div className="rounded-[28px] border border-cyan-400/15 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(59,130,246,0.12),rgba(10,15,30,0.96))] p-8 md:p-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_460px] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase text-cyan-200">
                  Start private
                </p>
                <h2 className="mt-4 text-3xl font-bold text-white md:text-5xl">
                  Claim your GhostMail address now.
                </h2>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
                  Use it for sign-ups, OTPs, and privacy-friendly browsing without
                  exposing your personal email.
                </p>
              </div>
              <UsernameClaimForm compact buttonLabel="Create inbox" />
            </div>
          </div>
        </section>

        <section className="sr-only" aria-label="All GhostMail SEO pages">
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
