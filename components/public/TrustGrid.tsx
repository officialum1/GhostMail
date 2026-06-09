import { CheckCircle2, Cloud, CreditCard, Inbox, Lock, Shield } from 'lucide-react'
import { publicStats, trustSignals } from '@/lib/public-content'

const trustIcons = [CreditCard, Inbox, Shield, Cloud, Lock, CheckCircle2]

export default function TrustGrid() {
  return (
    <section className="relative border-y border-white/5 bg-[#0b1220]/80">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-4 md:grid-cols-4">
          {publicStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="mt-2 text-sm uppercase text-cyan-200">
                {stat.label}
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">{stat.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {trustSignals.map((signal, index) => {
            const Icon = trustIcons[index] || CheckCircle2

            return (
              <div
                key={signal.title}
                className="flex gap-4 rounded-2xl border border-white/10 bg-[#0e1728] p-5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-semibold text-white">{signal.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
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
