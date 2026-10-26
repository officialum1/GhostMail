// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  Globe,
  Inbox,
  Search,
  Sparkles,
  Zap,
} from 'lucide-react'
import PageLayout from '@/components/PageLayout'
import LiveInboxPreview from '@/components/public/LiveInboxPreview'
import TrustGrid from '@/components/public/TrustGrid'
import UsernameClaimForm from '@/components/public/UsernameClaimForm'
import FAQAccordion from '@/components/FAQAccordion'
import {
  expandedFaqCategories,
  seoLandingPages,
  trustSignals,
} from '@/lib/public-content'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'GhostMail - Free Custom Email Address | Receive OTPs Instantly',
  description:
    'Get a free @ghostmail.store email address in seconds. Receive OTPs, sign-up confirmations, and verification emails without exposing your real inbox.',
  alternates: { canonical: SITE_URL },
}

const workflowSteps = [
  {
    icon: Sparkles,
    title: 'Choose custom address',
    body: 'Claim your personal @ghostmail.store username in one click without a password or credit card.',
  },
  {
    icon: Globe,
    title: 'Use it anywhere',
    body: 'Provide your GhostMail address on communities, trials, testing platforms, or random sites.',
  },
  {
    icon: Inbox,
    title: 'Instant OTP delivery',
    body: 'Real-time Server-Sent Events deliver verification codes & OTPs in under 3 seconds to your private reader.',
  },
] as const

const publicUseCases = [
  {
    title: 'Receive OTPs online',
    body: 'Keep one-time verification passwords out of your permanent personal mailbox.',
    href: '/receive-otp-online',
  },
  {
    title: 'Protect your real email',
    body: 'Safeguard your primary inbox from endless marketing spammers, trackers, and data brokers.',
    href: '/burner-email',
  },
  {
    title: 'Community accounts',
    body: 'Create separate, disposable inboxes for Reddit, Discord, gaming forums, and online trials.',
    href: '/email-for-reddit',
  },
] as const

const faqPreview = expandedFaqCategories
  .flatMap((category) =>
    category.items.map((item) => ({
      question: item.question,
      answer: item.answer,
    })),
  )
  .slice(0, 5)

export default function HomePage() {
  return (
    <PageLayout>
      <div className="w-full">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-slate-200/60 dark:border-white/5">
          {/* Subtle Ambient Radial Glow */}
          <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[450px] w-[700px] rounded-full bg-cyan-500/10 blur-[120px] dark:bg-cyan-500/15" />

          <div className="relative mx-auto max-w-7xl px-6 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            {/* Hero Left Column */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-600 dark:text-cyan-300 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>Zero spam • Free forever • No credit card</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Your private custom inbox,{' '}
                <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                  ready in seconds.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                Claim your custom @ghostmail.store address instantly. Protect your real inbox from spam, track OTPs with 1-tap auto-copy, and stay anonymous.
              </p>

              {/* Claim Box */}
              <div className="max-w-xl pt-2">
                <UsernameClaimForm />
              </div>

              {/* Quick trust badges */}
              <div className="grid grid-cols-3 gap-3 pt-2 max-w-xl">
                {trustSignals.slice(0, 3).map((signal) => (
                  <div
                    key={signal.title}
                    className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] p-3 text-center sm:text-left backdrop-blur"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto sm:mx-0" aria-hidden="true" />
                    <p className="mt-1.5 text-xs font-bold text-slate-900 dark:text-white truncate">{signal.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{signal.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Right Column: Live Interactive Simulator */}
            <div className="w-full">
              <LiveInboxPreview />
            </div>
          </div>
        </section>

        {/* Real-time KPI Stats Grid */}
        <TrustGrid />

        {/* 3-Step Pipeline: How It Works */}
        <section id="how-it-works" className="py-16 md:py-24 border-b border-slate-200/60 dark:border-white/5">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                Simple & Frictionless
              </span>
              <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Built for the parts of the web you don’t trust yet.
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                GhostMail requires zero extensions or third-party email clients. It simply works right inside your browser.
              </p>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {workflowSteps.map((step, idx) => {
                const Icon = step.icon
                return (
                  <div
                    key={step.title}
                    className="relative rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/70 p-6 shadow-sm backdrop-blur transition-all hover:border-cyan-500/30 hover:scale-[1.01]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-400">0{idx + 1}</span>
                    </div>
                    <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {step.body}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section id="features" className="py-16 md:py-24 border-b border-slate-200/60 dark:border-white/5">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                  Privacy In Action
                </span>
                <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  High-converting use cases.
                </h2>
              </div>
              <Link
                href="/receive-otp-online"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                View all use cases
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {publicUseCases.map((useCase) => (
                <Link
                  key={useCase.title}
                  href={useCase.href}
                  className="group rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/70 p-6 shadow-sm backdrop-blur transition-all hover:border-cyan-500/40 hover:shadow-cyan-500/5 hover:scale-[1.01]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                    <Zap className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors">
                    {useCase.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {useCase.body}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400">
                    Explore use case
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* SEO Landing Directory */}
        <section className="py-16 md:py-24 border-b border-slate-200/60 dark:border-white/5">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                  Targeted Solutions
                </span>
                <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Tailored temporary email tools.
                </h2>
              </div>
              <Link
                href="/faq"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                Read comprehensive FAQ
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {seoLandingPages.map((page) => (
                <Link
                  key={page.slug}
                  href={`/${page.slug}`}
                  className="group rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/70 p-5 shadow-sm backdrop-blur transition-all hover:border-cyan-500/40"
                >
                  <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                    <Search className="h-4 w-4" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">{page.kicker}</span>
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors">
                    {page.h1}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-2">
                    {page.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="py-16 md:py-24 border-b border-slate-200/60 dark:border-white/5">
          <div className="mx-auto max-w-4xl px-6">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                Got Questions?
              </span>
              <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Frequently asked questions.
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Everything you need to know about our privacy-first email delivery infrastructure.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/70 p-6 backdrop-blur shadow-sm">
              <FAQAccordion items={faqPreview} />
            </div>

            <div className="text-center mt-6">
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                View all frequently asked questions →
              </Link>
            </div>
          </div>
        </section>

        {/* Pre-Footer Action Banner */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-[#0c1017] to-blue-950/30 p-8 sm:p-12 text-center backdrop-blur shadow-2xl">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/20 blur-[80px]" />
              <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/20 blur-[80px]" />

              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Claim your custom email in seconds.
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
                No passwords, no installations, and no tracking. Keep your real inbox permanently clean.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/30 transition-all hover:scale-[1.02]"
                >
                  Get Started For Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/api-docs"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-6 py-3 text-sm font-semibold text-white transition"
                >
                  Explore Developer API
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  )
}
