// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Sparkles, Terminal, ShieldCheck, Zap } from 'lucide-react'
import CryptoUpgradeModal from '@/components/CryptoUpgradeModal'

export default function PricingClient() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-32">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-300 font-semibold">Pricing & Plans</p>
          <h1 className="mt-4 text-4xl font-bold md:text-6xl text-slate-900 dark:text-white">
            Free for individuals. <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              High-speed REST API
            </span> for developers.
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
            GhostMail keeps privacy simple. The core web experience is free forever. Upgrade to Pro for high-concurrency developer APIs, programmatic account creation, and instant automated OTP extraction.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {/* Free Forever Plan */}
          <div className="flex flex-col justify-between rounded-[32px] border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 p-8 backdrop-blur shadow-sm">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 font-semibold">Starter</p>
              <h2 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">Free Forever</h2>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-5xl font-bold text-slate-900 dark:text-white">$0</span>
                <span className="text-slate-500">/ lifetime</span>
              </div>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                Ideal for individuals needing disposable inboxes, manual signups, and private web-based mailboxes.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  'Real @ghostmail.store domain address',
                  'Fast inbound email delivery via WebSockets',
                  'Clean private web inbox dashboard',
                  'Full message body & attachment viewing',
                  'No credit card or personal info required',
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-slate-700 dark:text-slate-200 text-sm">
                    <Check className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-200 dark:border-white/10">
              <Link
                href="/register"
                className="inline-flex w-full justify-center rounded-xl border border-slate-300 dark:border-white/20 bg-slate-900 dark:bg-white px-6 py-3.5 font-semibold text-white dark:text-slate-950 transition-all hover:bg-slate-800 dark:hover:bg-slate-100"
              >
                Create Free Account
              </Link>
            </div>
          </div>

          {/* Developer Pro Plan */}
          <div className="relative flex flex-col justify-between rounded-[32px] border-2 border-cyan-400/40 bg-[linear-gradient(180deg,rgba(34,211,238,0.12),rgba(15,23,42,0.6))] p-8 backdrop-blur shadow-xl shadow-cyan-500/10">
            <div className="absolute -top-3.5 right-8 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
              Most Popular for Automation
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-400" />
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-400 font-semibold">Developer Pro</p>
              </div>
              <h2 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">API & Automation</h2>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-5xl font-bold text-slate-900 dark:text-white">$19</span>
                <span className="text-slate-500 dark:text-slate-400">/ month</span>
              </div>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                Full programmatic control. Generate inboxes, extract OTP codes via API, and power your test runners or automations.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  'Programmatic Account Creation (POST /api/v1/account/create)',
                  'Instant Automated OTP Extraction (GET /api/v1/inbox/otp)',
                  'Custom X-API-Key with high rate limits',
                  'Inbox & Message Retrieval REST Endpoints',
                  'Long-polling support (waitSeconds) for instant webhook-like speeds',
                  'Dedicated USDT (TRC-20 / BEP-20) / Binance Pay upgrade',
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-slate-700 dark:text-slate-200 text-sm">
                    <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span className="font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-cyan-500/20 space-y-3">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-500 px-6 py-3.5 font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:opacity-95 active:scale-[0.99]"
              >
                <Zap className="h-5 w-5 fill-slate-950" />
                Upgrade with Crypto (USDT / Binance Pay)
              </button>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                <span>Instant activation after TxID confirmation</span>
                <Link href="/api-docs" className="text-cyan-400 hover:underline flex items-center gap-1">
                  <Terminal className="h-3 w-3" />
                  View API Docs →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Comparison or Details */}
        <div className="mt-20 rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] p-8 md:p-12">
          <div className="max-w-2xl">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Why Developer Pro?</h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Tired of manual verification loops? GhostMail Developer Pro allows QA engineers, growth teams, and automated agents to bypass CAPTCHAs, create dynamic test accounts, and capture 4-8 digit OTP codes with single HTTP calls in Python, Node.js, Go, or cURL.
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 p-6">
              <Terminal className="h-6 w-6 text-cyan-400 mb-3" />
              <h4 className="font-semibold text-slate-900 dark:text-white">Automated OTPs</h4>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Our regex engine scans subjects and bodies to return pure verification codes instantly—no manual regex parsing required.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 p-6">
              <ShieldCheck className="h-6 w-6 text-emerald-400 mb-3" />
              <h4 className="font-semibold text-slate-900 dark:text-white">Secure Crypto Checkout</h4>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Pay pseudo-anonymously using USDT on TRC-20, BEP-20, or Binance Pay ID. Your subscription and API keys are tied only to your account.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 p-6">
              <Zap className="h-6 w-6 text-amber-400 mb-3" />
              <h4 className="font-semibold text-slate-900 dark:text-white">Instant Response Times</h4>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Low-latency endpoints backed by high performance database queries make automation pipelines execute smoothly.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CryptoUpgradeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}
