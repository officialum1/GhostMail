// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import type { Metadata } from 'next'
import { Activity, CheckCircle2, Mail, Server, ShieldCheck } from 'lucide-react'
import PageLayout from '@/components/PageLayout'
import PublicHero from '@/components/public/PublicHero'
import { statusChecks } from '@/lib/public-content'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'GhostMail Status - System Health',
  description:
    'Check GhostMail public system status for the web app, email routing, inbox delivery, and admin dashboard.',
  alternates: { canonical: `${SITE_URL}/status` },
}

const statusIcons = [Server, Mail, Activity, ShieldCheck]

export default function StatusPage() {
  return (
    <PageLayout>
      <div className="w-full">
        <PublicHero
          badgeText="Real-time Telemetry"
          badgeIcon={<span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />}
          title="GhostMail System Health &"
          highlightText="Network Status."
          description="Continuous uptime monitoring across Cloudflare edge ingestion, SSE streaming websockets, REST API gateways, and database clusters."
          primaryCtaText="Claim Free Mailbox"
          primaryCtaLink="/register"
          secondaryCtaText="Contact Support"
          secondaryCtaLink="/contact"
        />

        <section className="py-16">
          <div className="mx-auto max-w-5xl px-6 space-y-8">
            {/* Global Operational Header Card */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 backdrop-blur flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">All Systems Operational</h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Zero active incidents reported across global regions.</p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">99.99% Uptime</span>
            </div>

            {/* Subsystem Health Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {statusChecks.map((check, idx) => {
                const Icon = statusIcons[idx] || Server
                return (
                  <div
                    key={check.name}
                    className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/70 p-5 shadow-sm backdrop-blur flex items-start gap-4"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{check.name}</h3>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                          {check.status}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{check.detail}</p>
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
