// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

'use client'

import { FormEvent, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Mail } from 'lucide-react'
import { PUBLIC_DOMAIN } from '@/lib/public-content'

function cleanUsername(value: string) {
  return value
    .toLowerCase()
    .replace(/@.*/, '')
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 20)
}

type UsernameClaimFormProps = {
  compact?: boolean
  className?: string
  buttonLabel?: string
}

export default function UsernameClaimForm({
  compact = false,
  className = '',
  buttonLabel = 'Claim Free Address',
}: UsernameClaimFormProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [username, setUsername] = useState('')
  const [touched, setTouched] = useState(false)

  const previewEmail = useMemo(() => {
    return `${username || 'yourname'}@${PUBLIC_DOMAIN}`
  }, [username])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setTouched(true)

    if (username.length < 3) {
      inputRef.current?.focus()
      return
    }

    router.push(`/register?username=${encodeURIComponent(username)}`)
  }

  const invalid = touched && username.length < 3

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/80 p-2 sm:p-2.5 shadow-xl shadow-cyan-500/5 backdrop-blur-xl transition-all ${className}`}
    >
      <div
        className={`grid gap-2 ${
          compact ? 'sm:grid-cols-[1fr_auto]' : 'md:grid-cols-[1fr_auto]'
        }`}
      >
        <label className="flex min-w-0 items-center gap-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 px-3.5 py-2.5 sm:py-3 focus-within:border-cyan-500/60 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
          <Mail className="h-4.5 w-4.5 shrink-0 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
          <span className="sr-only">Choose your GhostMail username</span>
          <input
            ref={inputRef}
            type="text"
            value={username}
            onBlur={() => setTouched(true)}
            onChange={(event) => setUsername(cleanUsername(event.target.value))}
            placeholder="enter-custom-username"
            className="min-w-0 flex-1 bg-transparent text-sm sm:text-base font-medium text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
            autoComplete="username"
            minLength={3}
            maxLength={20}
          />
          <span className="shrink-0 rounded-lg bg-slate-200/70 dark:bg-white/5 px-2.5 py-1 text-xs font-mono font-medium text-slate-600 dark:text-slate-400">
            @{PUBLIC_DOMAIN}
          </span>
        </label>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-5 py-3 text-xs sm:text-sm font-bold text-slate-950 shadow-md shadow-cyan-500/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          {buttonLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex min-h-6 flex-wrap items-center justify-between gap-2 px-2 pt-2 text-xs">
        <span className="font-mono text-cyan-600 dark:text-cyan-400 font-medium truncate max-w-[260px]">
          {previewEmail}
        </span>
        {invalid ? (
          <span className="text-red-500 dark:text-red-400 font-medium">Use at least 3 characters.</span>
        ) : (
          <span className="text-slate-500 dark:text-slate-400">Instant mailbox claim • No credit card</span>
        )}
      </div>
    </form>
  )
}
