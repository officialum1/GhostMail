// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Sparkles, Zap, ArrowRight, Coins } from 'lucide-react'
import CryptoUpgradeModal from '@/components/CryptoUpgradeModal'
import PublicHero from '@/components/public/PublicHero'

export default function PricingClient() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div className="w-full">
        {/* Unified Hero */}
        <PublicHero
          badgeText="Fair & Transparent"
          badgeIcon={<Zap className="h-3.5 w-3.5 text-cyan-500" />}
          title="Free for individuals."
          highlightText="High-speed REST API for builders."
          description="The core disposable web mailbox is free forever. Upgrade to Developer Pro for programmatic inbox generation, automated OTP extraction, and dedicated high-rate-limit keys."
        />

        {/* Pricing Matrix */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6 grid gap-8 lg:grid-cols-2">
            {/* Free Forever Plan */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/70 p-8 shadow-sm backdrop-blur">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Personal Tier</span>
                <h2 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white">Free Forever</h2>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white font-mono">$0</span>
                  <span className="text-xs font-medium text-slate-500">/ lifetime</span>
                </div>
                <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Ideal for personal testing, disposable accounts, privacy protection, and receiving web verification codes.
                </p>

                <div className="mt-8 space-y-3">
                  {[
                    'Custom @ghostmail.store email address',
                    'Real-time Server-Sent Events mailbox sync',
                    'Full email reader with HTML & Raw view',
                    'Built-in 1-tap OTP instant detector',
                    'Automatic spam & malicious sender filtering',
                    'No credit card or personal details required',
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                      <Check className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-white/5">
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 w-full rounded-xl border border-slate-300 dark:border-white/20 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 py-3 text-xs sm:text-sm font-bold text-white dark:text-slate-950 transition-all"
                >
                  Create Free Account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Developer Pro Plan */}
            <div className="relative flex flex-col justify-between rounded-2xl border-2 border-cyan-500/40 bg-gradient-to-b from-cyan-500/10 via-[#0c1017]/80 to-[#07090e] p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur">
              <div className="absolute -top-3 right-6 rounded-full bg-cyan-500 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-950 shadow-md">
                Popular with Automators
              </div>

              <div>
                <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Developer Pro</span>
                </div>
                <h2 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white">API & Automation Hub</h2>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white font-mono">$19</span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">/ month</span>
                </div>
                <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Programmatic scale. Spin up mailboxes via code, retrieve instant parsed OTPs, and power QA testing pipelines.
                </p>

                <div className="mt-8 space-y-3">
                  {[
                    'Programmatic Account Creation (POST /api/v1/account/create)',
                    'Instant Automated OTP Extraction (GET /api/v1/inbox/otp)',
                    'High throughput rate limit (120 requests/minute)',
                    'Long-polling (waitSeconds) for near-zero latency',
                    'Interactive in-browser developer sandbox access',
                    'Multi-network crypto payment (USDT TRC-20, BEP-20, Binance Pay)',
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-cyan-500/20">
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-cyan-500 hover:bg-cyan-400 py-3 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.01]"
                >
                  <Coins className="h-4 w-4" />
                  Upgrade with Crypto ($19)
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <CryptoUpgradeModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
