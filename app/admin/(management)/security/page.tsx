'use client'

import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Shield } from 'lucide-react'

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
  low: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  medium: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
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

  const load = useCallback(async () => {
    try {
      const [sRes, fRes, ipRes, aRes] = await Promise.all([
        fetch('/api/admin/suspicious'),
        fetch('/api/admin/settings/failed-logins'),
        fetch('/api/admin/security/ip-blacklist'),
        fetch('/api/admin/audit?limit=50'),
      ])
      if (sRes.ok) setSuspicious(await sRes.json())
      if (fRes.ok) setFailedLogins(await fRes.json())
      if (ipRes.ok) setIpList(await ipRes.json())
      if (aRes.ok) {
        const data = await aRes.json()
        setAuditLogs(data.logs || [])
      }
    } catch {
      toast.error('Failed to load security data')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const resolve = async (id: number) => {
    const res = await fetch(`/api/admin/suspicious/${id}`, { method: 'PATCH' })
    if (res.ok) {
      toast.success('Resolved')
      load()
    }
  }

  const clearFailed = async () => {
    const res = await fetch('/api/admin/settings/failed-logins', { method: 'DELETE' })
    if (res.ok) {
      toast.success('Cleared')
      load()
    }
  }

  const blockIp = async (ip: string) => {
    const res = await fetch('/api/admin/security/ip-blacklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip, reason: 'Blocked from failed logins' }),
    })
    if (res.ok) {
      toast.success(`Blocked ${ip}`)
      load()
    }
  }

  const addIp = async () => {
    if (!newIp) return
    const res = await fetch('/api/admin/security/ip-blacklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip: newIp, reason: newIpReason }),
    })
    if (res.ok) {
      toast.success('IP blocked')
      setNewIp('')
      setNewIpReason('')
      load()
    }
  }

  const removeIp = async (id: number) => {
    const res = await fetch(`/api/admin/security/ip-blacklist?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Removed')
      load()
    }
  }

  const setup2FA = async () => {
    const res = await fetch('/api/admin/security/2fa/setup')
    if (res.ok) {
      const data = await res.json()
      setQrCode(data.qrCode)
    }
  }

  const verify2FA = async () => {
    const res = await fetch('/api/admin/security/2fa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: totpToken }),
    })
    if (res.ok) {
      toast.success('2FA enabled')
      setTwoFactorEnabled(true)
      setQrCode(null)
    } else toast.error('Invalid code')
  }

  const disable2FA = async () => {
    const res = await fetch('/api/admin/security/2fa/disable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: totpToken }),
    })
    if (res.ok) {
      toast.success('2FA disabled')
      setTwoFactorEnabled(false)
    } else toast.error('Invalid code')
  }

  const filtered = suspicious.filter((s) => {
    if (filter === 'unresolved') return !s.resolved
    if (filter === 'high') return s.severity === 'high'
    return true
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Security Center</h1>
          <p className="text-slate-500 dark:text-slate-400">Threats, access control, and audit trail.</p>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Suspicious Activity</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-900 dark:text-white"
          >
            <option value="all">All</option>
            <option value="unresolved">Unresolved</option>
            <option value="high">High severity</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10">
                <th className="pb-3 text-left">Severity</th>
                <th className="pb-3 text-left">Type</th>
                <th className="pb-3 text-left">Description</th>
                <th className="pb-3 text-left">IP</th>
                <th className="pb-3 text-left">Time</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-slate-200 dark:border-white/5">
                  <td className="py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${severityClass[item.severity]}`}>
                      {item.severity}
                    </span>
                  </td>
                  <td className="py-3 text-slate-600 dark:text-slate-300">{item.type}</td>
                  <td className="py-3 text-slate-900 dark:text-white max-w-xs truncate">{item.description}</td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">{item.ip || '—'}</td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">{new Date(item.createdAt).toLocaleString()}</td>
                  <td className="py-3 text-right">
                    {!item.resolved ? (
                      <button onClick={() => resolve(item.id)} className="text-emerald-400 text-xs hover:underline">
                        Resolve
                      </button>
                    ) : (
                      <span className="text-slate-500 text-xs">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Failed Login Attempts</h2>
          <button onClick={clearFailed} className="text-sm text-red-400 hover:underline">
            Clear all
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10">
              <th className="pb-3 text-left">Email</th>
              <th className="pb-3 text-left">IP</th>
              <th className="pb-3 text-left">Time</th>
              <th className="pb-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {failedLogins.map((f) => (
              <tr key={f.id} className="border-b border-slate-200 dark:border-white/5">
                <td className="py-3 text-slate-900 dark:text-white">{f.email}</td>
                <td className="py-3 text-slate-500 dark:text-slate-400">{f.ip || '—'}</td>
                <td className="py-3 text-slate-500 dark:text-slate-400">{new Date(f.attemptedAt).toLocaleString()}</td>
                <td className="py-3 text-right">
                  {f.ip ? (
                    <button onClick={() => blockIp(f.ip!)} className="text-xs text-red-400 hover:underline">
                      Block IP
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">IP Blacklist</h2>
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            value={newIp}
            onChange={(e) => setNewIp(e.target.value)}
            placeholder="IP address"
            className="rounded-xl border border-slate-200 dark:border-white/10 bg-black/30 px-4 py-2 text-slate-900 dark:text-white text-sm"
          />
          <input
            value={newIpReason}
            onChange={(e) => setNewIpReason(e.target.value)}
            placeholder="Reason"
            className="rounded-xl border border-slate-200 dark:border-white/10 bg-black/30 px-4 py-2 text-slate-900 dark:text-white text-sm flex-1 min-w-[200px]"
          />
          <button onClick={addIp} className="rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 px-4 py-2 text-sm">
            Add
          </button>
        </div>
        <div className="space-y-2">
          {ipList.map((ip) => (
            <div key={ip.id} className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
              <div>
                <p className="text-slate-900 dark:text-white font-mono">{ip.ip}</p>
                <p className="text-xs text-slate-500">{ip.reason || 'No reason'}</p>
              </div>
              <button onClick={() => removeIp(ip.id)} className="text-xs text-red-400 hover:underline">
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Audit Log</h2>
          <a href="/api/admin/audit?format=csv" className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline">
            Export CSV
          </a>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10">
              <th className="pb-3 text-left">Admin</th>
              <th className="pb-3 text-left">Action</th>
              <th className="pb-3 text-left">Target</th>
              <th className="pb-3 text-left">IP</th>
              <th className="pb-3 text-left">Time</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log) => (
              <tr key={log.id} className="border-b border-slate-200 dark:border-white/5">
                <td className="py-3 text-slate-900 dark:text-white">{log.admin.email}</td>
                <td className="py-3 text-cyan-600 dark:text-cyan-300">{log.action}</td>
                <td className="py-3 text-slate-500 dark:text-slate-400">{log.target || '—'}</td>
                <td className="py-3 text-slate-500 dark:text-slate-400">{log.ip || '—'}</td>
                <td className="py-3 text-slate-500 dark:text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Admin 2FA (Google Authenticator)</h2>
        {!twoFactorEnabled ? (
          <div className="space-y-4">
            <button onClick={setup2FA} className="rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 px-4 py-2 text-sm">
              Generate QR Code
            </button>
            {qrCode && (
              <div className="flex flex-col items-start gap-4">
                <img src={qrCode} alt="2FA QR" className="w-48 h-48 rounded-xl border border-slate-200 dark:border-white/10" />
                <input
                  value={totpToken}
                  onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  placeholder="6-digit code"
                  className="rounded-xl border border-slate-200 dark:border-white/10 bg-black/30 px-4 py-2 text-slate-900 dark:text-white w-40"
                />
                <button onClick={verify2FA} className="rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-4 py-2 text-sm">
                  Enable 2FA
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-emerald-400 text-sm">2FA is enabled on your account.</p>
            <input
              value={totpToken}
              onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              placeholder="Code to disable"
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-black/30 px-4 py-2 text-slate-900 dark:text-white w-40"
            />
            <button onClick={disable2FA} className="rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 px-4 py-2 text-sm">
              Disable 2FA
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
