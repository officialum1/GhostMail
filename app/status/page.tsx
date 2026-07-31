import type { Metadata } from 'next'
import Link from 'next/link'
import { Activity, ArrowRight, CheckCircle2, Clock, Mail, Server, ShieldCheck } from 'lucide-react'
import PageLayout from '@/components/PageLayout'
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
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              All systems operational
            </div>
            <h1 className="mt-7 text-4xl font-bold leading-tight text-slate-900 dark:text-white md:text-6xl">
              GhostMail public status.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Follow the current health of the public site, email routing, inbox
              delivery, and admin dashboard from one simple status page.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 font-semibold text-slate-900 dark:text-white"
              >
                Create inbox
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center rounded-xl border border-slate-200 dark:border-white/10 px-5 py-3 font-semibold text-slate-900 dark:text-white transition hover:bg-white/5"
              >
                Contact support
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 dark:border-white/10 bg-[#0f1627] p-6 shadow-[0_32px_80px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-5">
              <div>
                <p className="text-sm font-semibold uppercase text-cyan-300">
                  Current health
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Operational</h2>
              </div>
              <CheckCircle2 className="h-10 w-10 text-emerald-300" aria-hidden="true" />
            </div>
            <div className="mt-5 space-y-4">
              {statusChecks.map((check, index) => {
                const Icon = statusIcons[index] || CheckCircle2

                return (
                  <div
                    key={check.name}
                    className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">{check.name}</h3>
                          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                            {check.detail}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                        {check.status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-6">
            <Clock className="h-6 w-6 text-cyan-300" aria-hidden="true" />
            <h2 className="mt-5 text-xl font-semibold text-slate-900 dark:text-white">Recent incidents</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              No active public incidents are reported right now.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-6">
            <Activity className="h-6 w-6 text-cyan-300" aria-hidden="true" />
            <h2 className="mt-5 text-xl font-semibold text-slate-900 dark:text-white">Delivery monitor</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Inbox delivery is monitored through GhostMail admin analytics and routing logs.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-6">
            <ShieldCheck className="h-6 w-6 text-cyan-300" aria-hidden="true" />
            <h2 className="mt-5 text-xl font-semibold text-slate-900 dark:text-white">Security contact</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Security reports can be sent through the contact page or security.txt.
            </p>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
