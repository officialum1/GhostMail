// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import type { Metadata } from 'next'
import { Lock, Shield, Sparkles, Workflow } from 'lucide-react'
import PageLayout from '@/components/PageLayout'
import PublicHero from '@/components/public/PublicHero'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'About GhostMail — Our Mission to Protect Email Privacy',
  description:
    'Learn about GhostMail and our mission to give everyone a free, private email address. Built on Cloudflare infrastructure for instant, reliable email delivery.',
  alternates: { canonical: `${SITE_URL}/about` },
}

const stats = [
  { value: '50K+', label: 'Active Users' },
  { value: '2M+', label: 'Emails Delivered' },
  { value: '99.9%', label: 'Edge Uptime' },
  { value: '< 3s', label: 'Delivery Latency' },
]

export default function AboutPage() {
  return (
    <PageLayout>
      <div className="w-full">
        {/* Unified Hero */}
        <PublicHero
          badgeText="Our Mission"
          title="We believe everyone deserves"
          highlightText="email privacy without compromise."
          description="GhostMail was built for people who are tired of turning their real inboxes into a permanent marketing database every time they sign up for a service online."
          primaryCtaText="Claim Free Mailbox"
          primaryCtaLink="/register"
          secondaryCtaText="Read FAQ"
          secondaryCtaLink="/faq"
        />

        {/* 2-Column Mission & Philosophy */}
        <section className="py-16 border-b border-slate-200/60 dark:border-white/5">
          <div className="mx-auto max-w-7xl px-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/70 p-8 shadow-sm backdrop-blur">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Our Mission</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                In a digital world where your email address serves as your primary online identity, protecting it should not be a paid privilege. GhostMail gives everyone a free, private inbox to use anywhere without exposing real email accounts to spam, trackers, or commercial data brokers.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/70 p-8 shadow-sm backdrop-blur">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Why We Built This</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Every website, forum, and service demands a piece of your identity. Too often, that address is quietly scraped, sold, or flooded with spam forever. We built GhostMail so you can take control of your inbox without sacrificing speed or convenience.
              </p>
            </div>
          </div>
        </section>

        {/* 4-Step Pipeline Built For Trust */}
        <section className="py-16 border-b border-slate-200/60 dark:border-white/5">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-2xl mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                Architecture
              </span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                A simple pipeline built for speed and trust.
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: 'Edge Ingestion', desc: 'Cloudflare Email Routing receives every message at global edge nodes.' },
                { title: 'Secure Parsing', desc: 'Encrypted servers parse incoming headers and extract verification codes.' },
                { title: 'Instant Delivery', desc: 'Server-Sent Events push real-time updates directly to your browser.' },
                { title: 'Automated Purge', desc: 'Inboxes and temporary logs are automatically purged after retention periods.' },
              ].map((item, idx) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/70 p-6 shadow-sm backdrop-blur"
                >
                  <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">0{idx + 1}</span>
                  <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Key Operational Numbers */}
        <section className="py-16 border-b border-slate-200/60 dark:border-white/5">
          <div className="mx-auto max-w-7xl px-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/70 p-6 shadow-sm backdrop-blur text-center"
              >
                <p className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 dark:text-white">{stat.value}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Core Values */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/70 p-8 shadow-sm backdrop-blur flex flex-col justify-center">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Team & Vision</span>
              <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Built by privacy enthusiasts who think the internet should serve users, not advertisers.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                We obsess over design, security, and developer ergonomics. GhostMail exists to make disposable communications feel as smooth and dependable as a primary email provider.
              </p>
            </div>
            <div className="grid gap-3">
              {[
                { icon: Shield, title: 'Privacy First', desc: 'No tracking pixels, third-party trackers, or personal logs.' },
                { icon: Sparkles, title: 'Instant & Free', desc: 'Always available for personal use without credit cards.' },
                { icon: Workflow, title: 'Developer Ready', desc: 'Robust REST APIs with high throughput and predictable schemas.' },
                { icon: Lock, title: 'Cloudflare Isolated', desc: 'Protected by global DDoS mitigation and DNSSEC security.' },
              ].map((val) => {
                const Icon = val.icon
                return (
                  <div
                    key={val.title}
                    className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/70 p-4 shadow-sm backdrop-blur"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{val.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{val.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  )
}
