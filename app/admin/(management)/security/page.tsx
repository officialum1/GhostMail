// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

'use client'

import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Shield,
  AlertTriangle,
  Lock,
  KeyRound,
  ShieldAlert,
  Trash2,
  Download,
  CheckCircle,
  Plus,
  RefreshCw,
  QrCode,
  Flame,
} from 'lucide-react'
import Image from 'next/image'

type Suspicious = {
  id: number
  type: string
  description: string
  ip: string | null
  severity: string
  resolved: boolean
  createdAt: string
}

type FailedLogin = { id: number; email: string; ip: string | null; attemptedAt: string }
type IpEntry = { id: number; ip: string; reason: string | null; createdAt: string }
type AuditEntry = {
  id: number
  action: string
  target: string | null
  details: string | null
  ip: string | null
  createdAt: string
  admin: { email: string }
}

const severityClass: Record<string, string> = {
  low: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  medium: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  high: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
}

export default function AdminSecurityPage() {
  const [suspicious, setSuspicious] = useState<Suspicious[]>([])
  const [failedLogins, setFailedLogins] = useState<FailedLogin[]>([])
  const [ipList, setIpList] = useState<IpEntry[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([])
  const [filter, setFilter] = useState('all')
  const [newIp, setNewIp] = useState('')
  const [newIpReason, setNewIpReason] = useState('')
  const [totpToken, setTotpToken] = useState('')
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [sRes, fRes, ipRes, aRes, meRes] = await Promise.all([
        fetch('/api/admin/suspicious'),
        fetch('/api/admin/settings/failed-logins'),
        fetch('/api/admin/security/ip-blacklist'),
        fetch('/api/admin/audit?limit=50'),
        fetch('/api/admin/me'),
      ])
      if (sRes.ok) setSuspicious(await sRes.json())
      if (fRes.ok) setFailedLogins(await fRes.json())
      if (ipRes.ok) setIpList(await ipRes.json())
      if (aRes.ok) {
        const data = await aRes.json()
        setAuditLogs(data.logs || [])
      }
      if (meRes.ok) {
        const me = await meRes.json()
        setTwoFactorEnabled(Boolean(me.twoFactorEnabled))
      }
    } catch {
      toast.error('Failed to load security telemetry')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const resolve = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/suspicious/${id}`, { method: 'PATCH' })
      if (res.ok) {
        toast.success('Security alert resolved')
        load()
      }
    } catch {
      toast.error('Failed to resolve alert')
    }
  }

  const clearFailed = async () => {
    try {
      const res = await fetch('/api/admin/settings/failed-logins', { method: 'DELETE' })
      if (res.ok) {
        toast.success('Failed logins cleared')
        load()
      }
    } catch {
      toast.error('Failed to clear failed logins')
    }
  }

  const blockIp = async (ip: string) => {
    try {
      const res = await fetch('/api/admin/security/ip-blacklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, reason: 'Auto-blocked from failed logins rate limit' }),
      })
      if (res.ok) {
        toast.success(`Blocked IP: ${ip}`)
        load()
      }
    } catch {
      toast.error('Failed to block IP')
    }
  }

  const addIp = async () => {
    if (!newIp.trim()) return
    try {
      const res = await fetch('/api/admin/security/ip-blacklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: newIp.trim(), reason: newIpReason.trim() || 'Manual blacklist entry' }),
      })
      if (res.ok) {
        toast.success(`IP added to blacklist: ${newIp}`)
        setNewIp('')
        setNewIpReason('')
        load()
      } else {
        toast.error('Failed to add IP to blacklist')
      }
    } catch {
      toast.error('Error adding IP')
    }
  }

  const removeIp = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/security/ip-blacklist?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('IP removed from blacklist')
        load()
      }
    } catch {
      toast.error('Failed to remove IP')
    }
  }

  const setup2FA = async () => {
    try {
      const res = await fetch('/api/admin/security/2fa/setup')
      const data = await res.json()
      if (res.ok) {
        setQrCode(data.qrCode)
      } else {
        toast.error(data.error || 'Failed to start 2FA setup')
        if (res.status === 409) {
          setTwoFactorEnabled(true)
        }
      }
    } catch {
      toast.error('Failed to initialize 2FA setup')
    }
  }

  const verify2FA = async () => {
    try {
      const res = await fetch('/api/admin/security/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: totpToken }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Google 2FA Authenticator activated!')
        setTwoFactorEnabled(true)
        setQrCode(null)
        setTotpToken('')
        load()
      } else toast.error(data.error || 'Invalid TOTP code')
    } catch {
      toast.error('Verification failed')
    }
  }

  const disable2FA = async () => {
    try {
      const res = await fetch('/api/admin/security/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: totpToken }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('2FA disabled on account')
        setTwoFactorEnabled(false)
        setTotpToken('')
        load()
      } else toast.error(data.error || 'Invalid code')
    } catch {
      toast.error('Failed to disable 2FA')
    }
  }

  const filtered = suspicious.filter((s) => {
    if (filter === 'unresolved') return !s.resolved
    if (filter === 'high') return s.severity === 'high'
    return true
  })

  const unresolvedCount = suspicious.filter((s) => !s.resolved).length

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-rose-400">
              <Shield className="h-3 w-3 text-rose-400" />
              Perimeter Defense
            </span>
            <span className="text-xs text-slate-400">Threat Mitigation & Audit Engine</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Security Command Center
          </h1>
          <p className="mt-1 text-xs lg:text-sm text-slate-500 dark:text-slate-400">
            Real-time anomaly monitoring, brute-force mitigation, IP blacklist rules, and two-factor TOTP protection.
          </p>
        </div>

        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start lg:self-auto rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/80 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm backdrop-blur transition hover:bg-slate-100 dark:hover:bg-white/10"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-cyan-500' : ''}`} />
          <span>Sync Security Logs</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 p-5 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Open Anomaly Flags
            </p>
            <div className={`rounded-xl p-2 ${unresolvedCount > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className={`mt-2 text-3xl font-black tracking-tight font-mono ${unresolvedCount > 0 ? 'text-rose-400' : 'text-slate-900 dark:text-white'}`}>
            {unresolvedCount}
          </p>
          <p className="mt-1 text-xs text-slate-400">{unresolvedCount > 0 ? 'Require administrator review' : 'Zero unaddressed threats'}</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 p-5 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Failed Logins (24h)
            </p>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2 text-amber-400">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
            {failedLogins.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">Logged authentication faults</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 p-5 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Blacklisted IPs
            </p>
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-2 text-cyan-400">
              <Lock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
            {ipList.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">Denied from accessing platform</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 p-5 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Admin 2FA Status
            </p>
            <div className={`rounded-xl p-2 ${twoFactorEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
              <KeyRound className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${twoFactorEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <p className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {twoFactorEnabled ? 'Protected' : 'Disabled'}
            </p>
          </div>
          <p className="mt-1 text-xs text-slate-400">{twoFactorEnabled ? 'Google Authenticator Active' : 'Setup recommended'}</p>
        </div>
      </div>

      {/* Suspicious Activity Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 backdrop-blur-xl shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-rose-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Anomaly Stream & Threat Flags
            </h2>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-cyan-500 transition cursor-pointer"
          >
            <option value="all">All Anomalies</option>
            <option value="unresolved">Unresolved Only</option>
            <option value="high">High Severity Only</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">Origin IP</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No threat anomalies matching current filter.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${severityClass[item.severity] || severityClass.low}`}>
                        {item.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-cyan-600 dark:text-cyan-400 font-medium">
                      {item.type}
                    </td>
                    <td className="px-4 py-3.5 text-slate-900 dark:text-slate-100 max-w-sm truncate">
                      {item.description}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-500">
                      {item.ip || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {!item.resolved ? (
                        <button
                          onClick={() => resolve(item.id)}
                          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition"
                        >
                          Resolve
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Failed Logins & IP Blacklist 2-Column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Failed Login Attempts */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 backdrop-blur-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Failed Login Attempts
              </h2>
            </div>
            {failedLogins.length > 0 && (
              <button
                onClick={clearFailed}
                className="text-xs font-semibold text-rose-400 hover:underline"
              >
                Clear History
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {failedLogins.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">Zero failed login events recorded.</p>
            ) : (
              failedLogins.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] p-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{f.email}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      IP: {f.ip || 'Unknown'} • {new Date(f.attemptedAt).toLocaleTimeString()}
                    </p>
                  </div>
                  {f.ip && (
                    <button
                      onClick={() => blockIp(f.ip!)}
                      className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold text-rose-400 hover:bg-rose-500/20 transition shrink-0"
                    >
                      Block IP
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* IP Perimeter Blacklist */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 backdrop-blur-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              IP Perimeter Blacklist
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr_auto] gap-2">
            <input
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
              placeholder="e.g. 192.168.1.1"
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-cyan-500"
            />
            <input
              value={newIpReason}
              onChange={(e) => setNewIpReason(e.target.value)}
              placeholder="Reason for block"
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500"
            />
            <button
              onClick={addIp}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:from-rose-400 hover:to-red-500 transition"
            >
              <Plus className="h-3.5 w-3.5" /> Block
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {ipList.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">Firewall blacklist is empty.</p>
            ) : (
              ipList.map((ip) => (
                <div
                  key={ip.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] p-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-mono font-bold text-slate-900 dark:text-white">{ip.ip}</p>
                    <p className="text-[11px] text-slate-500 truncate">{ip.reason || 'No reason provided'}</p>
                  </div>
                  <button
                    onClick={() => removeIp(ip.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 transition"
                    title="Remove from blacklist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Admin 2FA (Google Authenticator) Box */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 backdrop-blur-xl shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Admin 2FA Two-Factor Authentication
          </h2>
        </div>

        {!twoFactorEnabled ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 max-w-xl">
              Protect your administrative session with Time-based One-Time Password (TOTP) compatible with Google Authenticator, Authy, or 1Password.
            </p>
            {!qrCode ? (
              <button
                onClick={setup2FA}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:from-cyan-400 hover:to-blue-500 transition"
              >
                <QrCode className="h-4 w-4" /> Setup 2FA Key
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-start gap-6 p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5">
                <div className="relative w-44 h-44 rounded-xl overflow-hidden bg-white p-2 border border-slate-300">
                  <Image
                    src={qrCode}
                    alt="2FA QR Code"
                    width={160}
                    height={160}
                    unoptimized
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-xs text-slate-300 font-medium">
                    1. Scan this QR code in your Google Authenticator or 1Password app.
                  </p>
                  <p className="text-xs text-slate-300 font-medium">
                    2. Enter the 6-digit code shown in your app to activate:
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      value={totpToken}
                      onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, ''))}
                      maxLength={6}
                      placeholder="000000"
                      className="w-36 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3.5 py-2 font-mono text-center text-sm font-bold tracking-widest text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                    />
                    <button
                      onClick={verify2FA}
                      className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md hover:bg-emerald-400 transition"
                    >
                      Verify &amp; Activate
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Two-Factor Authentication is currently Active
                </p>
                <p className="text-[11px] text-slate-400">
                  TOTP code will be required on each administrative login.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                value={totpToken}
                onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                placeholder="6-digit code to disable"
                className="w-44 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3 py-2 text-xs font-mono text-center text-slate-900 dark:text-white outline-none focus:border-rose-500"
              />
              <button
                onClick={disable2FA}
                className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition"
              >
                Disable 2FA
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 backdrop-blur-xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Administrative Audit Trail
          </h2>
          <a
            href="/api/admin/audit?format=csv"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:underline"
          >
            <Download className="h-3.5 w-3.5" /> Export Audit CSV
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3">Administrator</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Target Subject</th>
                <th className="px-4 py-3">Origin IP</th>
                <th className="px-4 py-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Audit log is clear.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">
                      {log.admin.email}
                    </td>
                    <td className="px-4 py-3 text-cyan-400 font-mono font-bold">{log.action}</td>
                    <td className="px-4 py-3 text-slate-400 truncate max-w-xs">{log.target || '—'}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{log.ip || '—'}</td>
                    <td className="px-4 py-3 text-right text-slate-500 font-mono">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
