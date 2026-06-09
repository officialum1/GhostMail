import { Clock, Mail, ShieldCheck, Zap } from 'lucide-react'
import { liveInboxEmails, PUBLIC_DOMAIN } from '@/lib/public-content'

type LiveInboxPreviewProps = {
  compact?: boolean
}

export default function LiveInboxPreview({ compact = false }: LiveInboxPreviewProps) {
  const visibleEmails = compact ? liveInboxEmails.slice(0, 3) : liveInboxEmails

  return (
    <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.98),rgba(10,15,30,0.94))] p-4 shadow-[0_40px_120px_rgba(0,0,0,0.42)]">
      <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[#0d1117]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500">
              <Mail className="h-5 w-5 text-white" aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold text-white">Live demo inbox</p>
              <p className="text-sm text-slate-400">yourname@{PUBLIC_DOMAIN}</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            Delivery online
          </div>
        </div>

        <div className="grid md:grid-cols-[180px_1fr]">
          <div className="space-y-2 border-b border-r border-white/10 bg-[#101722] p-4 md:border-b-0">
            {[
              { label: 'Inbox', value: '12', active: true },
              { label: 'OTP codes', value: '4' },
              { label: 'Security', value: '3' },
              { label: 'Sign-ups', value: '7' },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm ${
                  item.active
                    ? 'border border-cyan-400/20 bg-cyan-400/10 text-white'
                    : 'text-slate-400'
                }`}
              >
                <span>{item.label}</span>
                <span>{item.value}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 p-4">
            {visibleEmails.map((email, index) => (
              <div
                key={email.sender}
                className={`rounded-2xl border p-4 ${
                  index === 0
                    ? 'border-cyan-400/25 bg-cyan-400/10'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-cyan-200">
                      {index === 0 ? (
                        <Zap className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Mail className="h-4 w-4" aria-hidden="true" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">{email.sender}</p>
                      <p className="truncate text-sm text-slate-300">{email.subject}</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-cyan-200">
                    {email.tag}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">{email.preview}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {email.time}
                </div>
              </div>
            ))}

            <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/15 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Messages stay inside your private dashboard.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
