// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import { CheckCircle2, Cloud, CreditCard, Inbox, Lock, Shield } from 'lucide-react'
import { publicStats, trustSignals } from '@/lib/public-content'

const trustIcons = [CreditCard, Inbox, Shield, Cloud, Lock, CheckCircle2]

export default function TrustGrid() {
  return (
    <section className="relative border-y border-slate-200/80 dark:border-white/5 bg-slate-100/40 dark:bg-[#07090e]/80 py-16">
      <div className="mx-auto max-w-7xl px-6">
        {/* KPI Stats Counter */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {publicStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/70 p-5 shadow-sm backdrop-blur transition-all hover:border-cyan-500/30"
            >
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
                {stat.value}
              </div>
              <div className="mt-1 text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                {stat.label}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {stat.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Trust Signals */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trustSignals.map((signal, index) => {
            const Icon = trustIcons[index] || CheckCircle2

            return (
              <div
                key={signal.title}
                className="flex gap-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/70 p-5 shadow-sm backdrop-blur transition-all hover:border-cyan-500/30"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {signal.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {signal.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
