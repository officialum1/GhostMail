// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

type PublicHeroProps = {
  badgeText?: string
  badgeIcon?: React.ReactNode
  title: string
  highlightText?: string
  description: string
  primaryCtaText?: string
  primaryCtaLink?: string
  secondaryCtaText?: string
  secondaryCtaLink?: string
  centered?: boolean
}

export default function PublicHero({
  badgeText,
  badgeIcon,
  title,
  highlightText,
  description,
  primaryCtaText,
  primaryCtaLink,
  secondaryCtaText,
  secondaryCtaLink,
  centered = false,
}: PublicHeroProps) {
  return (
    <section className="relative overflow-hidden pt-16 pb-12 md:pt-24 md:pb-16 border-b border-slate-200/60 dark:border-white/5">
      {/* Ambient background glow spot */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[320px] w-[600px] rounded-full bg-cyan-500/10 blur-[100px] dark:bg-cyan-500/15" />

      <div className={`relative mx-auto max-w-7xl px-6 ${centered ? 'text-center' : ''}`}>
        <div className={`max-w-3xl ${centered ? 'mx-auto' : ''} space-y-5`}>
          {badgeText && (
            <div className={`inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-600 dark:text-cyan-300 shadow-sm ${centered ? 'mx-auto' : ''}`}>
              {badgeIcon || <Sparkles className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" />}
              <span>{badgeText}</span>
            </div>
          )}

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl leading-[1.12]">
            {title}{' '}
            {highlightText && (
              <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                {highlightText}
              </span>
            )}
          </h1>

          <p className="text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-400 max-w-2xl">
            {description}
          </p>

          {(primaryCtaText || secondaryCtaText) && (
            <div className={`pt-2 flex flex-wrap items-center gap-3 ${centered ? 'justify-center' : ''}`}>
              {primaryCtaText && primaryCtaLink && (
                <Link
                  href={primaryCtaLink}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-5 py-2.5 text-sm font-bold text-slate-950 dark:text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {primaryCtaText}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              {secondaryCtaText && secondaryCtaLink && (
                <Link
                  href={secondaryCtaLink}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 px-5 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 transition"
                >
                  {secondaryCtaText}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
