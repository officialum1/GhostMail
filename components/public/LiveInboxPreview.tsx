// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

'use client'

import { useState } from 'react'
import { Check, Clock, Copy, KeyRound, Mail, ShieldCheck } from 'lucide-react'
import { liveInboxEmails, PUBLIC_DOMAIN } from '@/lib/public-content'

type LiveInboxPreviewProps = {
  compact?: boolean
}

export default function LiveInboxPreview({ compact = false }: LiveInboxPreviewProps) {
  const [copiedOtp, setCopiedOtp] = useState(false)
  const visibleEmails = compact ? liveInboxEmails.slice(0, 3) : liveInboxEmails

  const handleCopyOtp = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedOtp(true)
    setTimeout(() => setCopiedOtp(false), 2000)
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/80 p-2 sm:p-3 shadow-2xl backdrop-blur-xl transition-all">
      <div className="overflow-hidden rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-[#07090e]/70">
        {/* Top Preview Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/60 dark:border-white/10 px-4 py-3 bg-white/40 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 shadow-sm shadow-cyan-500/20">
              <Mail className="h-4 w-4 text-slate-950 font-bold" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">Live Mailbox Simulator</p>
              <p className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 mt-1">demo-user@{PUBLIC_DOMAIN}</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live SSE Connected
          </div>
        </div>

        <div className="grid md:grid-cols-[160px_1fr]">
          {/* Desktop Preview Sidebar */}
          <div className="hidden md:block space-y-1 border-r border-slate-200/60 dark:border-white/5 bg-slate-100/40 dark:bg-black/20 p-3">
            {[
              { label: 'Inbox', value: '3', active: true },
              { label: 'OTP Codes', value: '2' },
              { label: 'Security', value: '1' },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition ${
                  item.active
                    ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                <span className="font-mono text-[10px]">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Email Item Feed */}
          <div className="space-y-2.5 p-3 sm:p-4">
            {visibleEmails.map((email, index) => (
              <div
                key={email.sender}
                className={`rounded-xl border p-3.5 transition-all ${
                  index === 0
                    ? 'border-cyan-500/30 bg-cyan-500/[0.04] dark:bg-cyan-500/[0.06] shadow-sm'
                    : 'border-slate-200/60 dark:border-white/5 bg-white/60 dark:bg-white/[0.02]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold text-xs">
                      {email.sender.slice(0, 1)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{email.sender}</p>
                      <p className="truncate text-[11px] text-slate-600 dark:text-slate-300">{email.subject}</p>
                    </div>
                  </div>
                  <span className="rounded-md border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-600 dark:text-slate-400">
                    {email.tag}
                  </span>
                </div>

                {/* Simulated 1-Tap OTP detector on 1st email */}
                {index === 0 && (
                  <div className="mt-2.5 flex items-center justify-between rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1.5">
                    <div className="flex items-center gap-2">
                      <KeyRound className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" />
                      <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200">
                        Detected OTP: <strong className="font-mono text-cyan-600 dark:text-cyan-300">482-910</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyOtp('482910')}
                      className="inline-flex items-center gap-1 rounded bg-cyan-500 hover:bg-cyan-400 px-2 py-0.5 text-[10px] font-bold text-slate-950 transition"
                    >
                      {copiedOtp ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedOtp ? 'Copied!' : 'Copy Code'}
                    </button>
                  </div>
                )}

                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
                  {email.preview}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {email.time}
                </div>
              </div>
            ))}

            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              Real-time delivery • Auto-purged after 24h
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
