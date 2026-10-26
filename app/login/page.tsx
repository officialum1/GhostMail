// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Mail, Shield } from 'lucide-react'
import { signIn } from 'next-auth/react'
import toast from 'react-hot-toast'
import PageLayout from '@/components/PageLayout'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        const message = result.error.includes('suspended')
          ? 'Your account has been suspended'
          : 'Invalid email or password'
        setError(message)
        toast.error(message)
      } else {
        toast.success('Welcome back')
        window.location.href = '/dashboard'
      }
    } catch {
      setError('An error occurred during login')
      toast.error('An error occurred during login')
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
              Welcome Back
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Access your private GhostMail inbox.
            </h1>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400 max-w-md">
              Retrieve incoming OTPs, confirmations, and security notices from a clean workspace tuned for speed and privacy.
            </p>

            <div className="grid gap-3 pt-2">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-[#0c1017]/70 p-3.5 backdrop-blur">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500">
                  <Mail className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Real-Time Ingestion</p>
                  <p className="text-[11px] text-slate-500">Live SSE push delivery right to your browser.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-[#0c1017]/70 p-3.5 backdrop-blur">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Shield className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Private By Architecture</p>
                  <p className="text-[11px] text-slate-500">Zero advertising trackers or commercial cookies.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column Login Form */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/80 p-6 sm:p-8 shadow-2xl backdrop-blur">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Account Login</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sign in with your username or full email address.</p>

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-500 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Username or Email
                </label>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                  placeholder="username or user@ghostmail.store"
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-cyan-500 hover:bg-cyan-400 py-3 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
              >
                {loading ? 'Authenticating...' : 'Sign In to Mailbox'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-white/5 text-center text-xs text-slate-500">
              Don&apos;t have an inbox yet?{' '}
              <Link href="/register" className="font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
                Claim free address
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
