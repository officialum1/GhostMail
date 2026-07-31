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
    title: 'Choose your address',
    body: 'Pick a username and instantly claim your @ghostmail.store inbox.',
  },
  {
    icon: Globe,
    title: 'Use it anywhere',
    body: 'Enter it on websites, apps, communities, trials, and testing flows.',
  },
  {
    icon: Inbox,
    title: 'Receive email fast',
    body: 'OTPs, verification links, receipts, and sign-up emails land in your dashboard.',
  },
] as const

const publicUseCases = [
  {
    title: 'Receive OTPs online',
    body: 'Keep one-time passwords and verification codes out of your personal inbox.',
    href: '/receive-otp-online',
  },
  {
    title: 'Protect your real email',
    body: 'Use GhostMail for sites you want to try without inviting spam later.',
    href: '/burner-email',
  },
  {
    title: 'Sign up for communities',
    body: 'Create separate inboxes for Reddit, Discord, forums, and marketplaces.',
    href: '/email-for-reddit',
  },
] as const

const testimonials = [
  {
    quote:
      'GhostMail is the inbox I use before I trust a site with my real email.',
    author: 'Product tester',
  },
  {
    quote:
      'OTP emails show up fast enough that sign-up flows do not slow me down.',
    author: 'Developer',
  },
  {
    quote:
      'It keeps newsletters, trial accounts, and random verification emails separate.',
    author: 'Privacy-focused user',
  },
] as const

const faqPreview = expandedFaqCategories
  .flatMap((category) =>
    category.items.map((item) => ({
      question: item.question,
      answer: item.answer,
    })),
  )
  .slice(0, 6)

export default function HomePage() {
  return (
    <PageLayout>
      <div className="bg-slate-50 dark:bg-[#0a0f1e]">
        <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl gap-12 px-6 py-16 md:py-24 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
              <span className="h-2 w-2 rounded-full bg-cyan-300" />
              Free forever. No real email required.
            </div>
            <h1 className="mt-7 max-w-4xl text-4xl font-bold leading-tight text-slate-900 dark:text-white md:text-6xl">
              Your own email address, ready in seconds.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300 md:text-xl">
              Claim a private @ghostmail.store inbox for OTPs, account sign-ups,
              verification links, and cleaner browsing.
            </p>

            <div className="mt-8 max-w-2xl">
              <UsernameClaimForm />
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {trustSignals.slice(0, 3).map((signal) => (
                <div key={signal.title} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-300" aria-hidden="true" />
                  <p className="mt-3 font-semibold text-slate-900 dark:text-white">{signal.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{signal.description}</p>
                </div>
              ))}
            </div>
          </div>

          <LiveInboxPreview />
        </section>

        <TrustGrid />

        <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase text-cyan-300">How it works</p>
            <h2 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white md:text-5xl">
              A real inbox for the parts of the internet you do not fully trust yet.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-500 dark:text-slate-400">
              GhostMail keeps the workflow simple, so users understand the product
              before they even create an account.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {workflowSteps.map((step) => {
              const Icon = step.icon

              return (
                <div key={step.title} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-6">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold text-slate-900 dark:text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{step.body}</p>
                </div>
              )
            })}
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase text-cyan-300">Use cases</p>
              <h2 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white md:text-5xl">
                Built for sign-ups, OTPs, and everyday privacy.
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {publicUseCases.map((useCase) => (
                <Link
                  key={useCase.title}
                  href={useCase.href}
                  className="group rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e1728] p-6 transition hover:border-cyan-400/30"
                >
                  <Zap className="h-5 w-5 text-cyan-300" aria-hidden="true" />
                  <h3 className="mt-5 text-xl font-semibold text-slate-900 dark:text-white">{useCase.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{useCase.body}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">
                    Learn more
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase text-cyan-300">SEO pages</p>
              <h2 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white md:text-5xl">
                Search-friendly pages for the terms people already use.
              </h2>
            </div>
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200"
            >
              Read FAQ
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {seoLandingPages.map((page) => (
              <Link
                key={page.slug}
                href={`/${page.slug}`}
                className="group rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-6 transition hover:border-cyan-400/30"
              >
                <Search className="h-5 w-5 text-cyan-300" aria-hidden="true" />
                <p className="mt-5 text-sm font-semibold uppercase text-cyan-200">
                  {page.kicker}
                </p>
                <h3 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">{page.h1}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{page.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">
                  Open page
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="grid gap-8 rounded-[28px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e1728] p-8 md:p-10 lg:grid-cols-[1fr_420px] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                All systems operational
              </div>
              <h2 className="mt-5 text-3xl font-bold text-slate-900 dark:text-white md:text-5xl">
                Public status page for trust before sign-up.
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-500 dark:text-slate-400">
                Visitors can check web app, email routing, inbox delivery, and
                admin dashboard health from a dedicated page.
              </p>
            </div>
            <div className="space-y-3">
              {[
                ['Web app', 'Operational'],
                ['Email routing', 'Operational'],
                ['Inbox delivery', 'Operational'],
              ].map(([label, status]) => (
                <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-4 py-3">
                  <span className="text-slate-600 dark:text-slate-300">{label}</span>
                  <span className="text-emerald-300">{status}</span>
                </div>
              ))}
              <Link
                href="/status"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-slate-950"
              >
                View status
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase text-cyan-300">FAQ</p>
              <h2 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white md:text-5xl">
                Clear answers for users before they trust a new inbox.
              </h2>
              <Link
                href="/faq"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200"
              >
                See all questions
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid gap-4">
              {faqPreview.map((item) => (
                <div key={item.question} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-5">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{item.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((item) => (
              <div key={item.author} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e1728] p-6">
                <p className="text-base leading-7 text-slate-700 dark:text-slate-200">
                  &quot;{item.quote}&quot;
                </p>
                <p className="mt-5 text-sm font-semibold text-cyan-300">{item.author}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-24 md:pb-32">
          <div className="grid gap-8 rounded-[28px] border border-cyan-400/15 bg-white dark:bg-[#101a2d] p-8 md:p-12 lg:grid-cols-[1fr_460px] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase text-cyan-300">Start free</p>
              <h2 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white md:text-5xl">
                Claim your private inbox now.
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                Create a GhostMail address for sign-ups, OTPs, and a cleaner
                personal inbox.
              </p>
            </div>
            <UsernameClaimForm compact buttonLabel="Create free inbox" />
          </div>
        </section>
      </div>
    </PageLayout>
  )
}
