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
  buttonLabel = 'Claim free address',
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
      className={`w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-2 shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur ${className}`}
    >
      <div
        className={`grid gap-2 ${
          compact ? 'md:grid-cols-[1fr_auto]' : 'lg:grid-cols-[1fr_auto]'
        }`}
      >
        <label className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 dark:border-white/10 bg-[#0d1628] px-4 py-3 focus-within:border-cyan-400/40">
          <Mail className="h-5 w-5 shrink-0 text-cyan-600 dark:text-cyan-300" aria-hidden="true" />
          <span className="sr-only">Choose your GhostMail username</span>
          <input
            ref={inputRef}
            type="text"
            value={username}
            onBlur={() => setTouched(true)}
            onChange={(event) => setUsername(cleanUsername(event.target.value))}
            placeholder="yourname"
            className="min-w-0 flex-1 bg-transparent text-base font-semibold text-slate-900 dark:text-white outline-none placeholder:text-slate-500"
            autoComplete="username"
            minLength={3}
            maxLength={20}
          />
          <span className="hidden shrink-0 text-sm text-slate-500 dark:text-slate-400 sm:inline">
            @{PUBLIC_DOMAIN}
          </span>
        </label>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 font-semibold text-slate-900 dark:text-white transition hover:scale-[1.01]"
        >
          {buttonLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="flex min-h-6 flex-wrap items-center justify-between gap-2 px-2 pt-2 text-sm">
        <span className="text-cyan-200">{previewEmail}</span>
        {invalid ? (
          <span className="text-red-300">Use at least 3 characters.</span>
        ) : (
          <span className="text-slate-500">Letters, numbers, dash, underscore.</span>
        )}
      </div>
    </form>
  )
}
