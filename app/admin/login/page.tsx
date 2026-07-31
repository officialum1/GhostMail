'use client'

import { useState } from 'react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [totpToken, setTotpToken] = useState('')
  const [adminId, setAdminId] = useState<number | null>(null)
  const [requires2FA, setRequires2FA] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const body = requires2FA
        ? { adminId, token: totpToken }
        : { email, password }

      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (data.requires2FA) {
        setRequires2FA(true)
        setAdminId(data.adminId)
        setLoading(false)
        return
      }

      if (res.ok) {
        window.location.href = '/admin/dashboard'
      } else {
        setError(data.error || 'Login failed')
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1e] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
              ✉️
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">GhostMail</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400">Admin Portal</p>
        </div>

        <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-8 backdrop-blur-xl">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-2">
            {requires2FA ? 'Two-Factor Auth' : 'Sign In'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-center mb-8 text-sm">
            {requires2FA ? 'Enter the 6-digit code from your authenticator app' : 'Access the GhostMail admin dashboard'}
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {!requires2FA ? (
              <>
                <div>
                  <label className="text-slate-600 dark:text-slate-300 text-sm mb-2 block">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@ghostmail.store"
                    required
                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-300 text-sm mb-2 block">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="text-slate-600 dark:text-slate-300 text-sm mb-2 block">Authentication Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={totpToken}
                  onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  required
                  className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-center text-2xl tracking-widest placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 dark:text-white font-semibold py-3 rounded-xl hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : requires2FA ? 'Verify' : 'Sign In'}
            </button>

            {requires2FA && (
              <button
                type="button"
                onClick={() => {
                  setRequires2FA(false)
                  setAdminId(null)
                  setTotpToken('')
                }}
                className="w-full text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                ← Back to login
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

