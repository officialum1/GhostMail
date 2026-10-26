// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Shield, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import PageLayout from '@/components/PageLayout'

function cleanUsername(value: string) {
  return value
    .toLowerCase()
    .replace(/@.*/, '')
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 20)
}

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'ghostmail.store'
  const previewEmail = username ? `${username}@${domain}` : `yourname@${domain}`

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const suggestedUsername =
      params.get('username') || params.get('email')?.split('@')[0] || ''

    if (suggestedUsername) {
      setUsername(cleanUsername(suggestedUsername))
    }
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccessMsg('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      const message = `Success! Your email is ${data.email}. Redirecting to login...`
      setSuccessMsg(message)
      toast.success('Account created successfully')
      setTimeout(() => router.push('/login'), 1800)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageLayout>
      <div className="w-full py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          {/* Left Column Info */}
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              Instant Mailbox Setup
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Claim your private inbox in under 30 seconds.
            </h1>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400 max-w-md">
              Choose your personal username, pick a password, and start receiving verifications, OTPs, receipts, and developer testing messages immediately.
            </p>

            <div className="grid gap-3 pt-2">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-[#0c1017]/70 p-3.5 backdrop-blur">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Zero Personal Data</p>
                  <p className="text-[11px] text-slate-500">No phone number, credit card, or recovery email required.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-[#0c1017]/70 p-3.5 backdrop-blur">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Shield className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Built-in OTP Detector</p>
                  <p className="text-[11px] text-slate-500">Instant 1-tap extraction for verification codes.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-[#0c1017]/70 p-3.5 backdrop-blur">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Free Core Tier Forever</p>
                  <p className="text-[11px] text-slate-500">Essential temp-mail capability is unconditionally free.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column Registration Form */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/80 p-6 sm:p-8 shadow-2xl backdrop-blur">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create Account</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select your custom handle on <span className="font-mono text-cyan-600 dark:text-cyan-400 font-semibold">{domain}</span>
            </p>

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-500 font-medium">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-500 font-medium">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Desired Username
                </label>
                <div className="flex rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 overflow-hidden focus-within:border-cyan-500">
                  <input
                    type="text"
                    required
                    minLength={3}
                    maxLength={20}
                    value={username}
                    onChange={(event) =>
                      setUsername(cleanUsername(event.target.value))
                    }
                    placeholder="alex"
                    autoComplete="username"
                    className="flex-1 bg-transparent px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-white outline-none placeholder:text-slate-500"
                  />
                  <span className="border-l border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-3 py-2.5 text-xs font-mono text-slate-500 dark:text-slate-400">
                    @{domain}
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] text-cyan-600 dark:text-cyan-400 font-mono">
                  Inbox address: <span className="font-semibold">{previewEmail}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={10}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 10 characters"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  minLength={10}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-type your password"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500 placeholder:text-slate-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-cyan-500 hover:bg-cyan-400 py-3 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
              >
                {loading ? 'Creating inbox...' : 'Claim Free Mailbox'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-white/5 text-center text-xs text-slate-500">
              Already have an address?{' '}
              <Link href="/login" className="font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
