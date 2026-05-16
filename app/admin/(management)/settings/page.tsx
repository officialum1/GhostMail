'use client'

import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { HardDrive, Save, Server, Shield, Trash2, Webhook } from 'lucide-react'

type SettingsState = {
  siteName: string
  maxEmailsPerUser: string
  emailRetentionDays: string
}

type BlacklistedItem = {
  id: string
  username?: string
  domain?: string
  isDefault?: boolean
}

type WebhookLog = {
  id: number
  toAddress: string
  fromAddress: string
  status: string
  error: string | null
  receivedAt: string
}

type FailedLogin = {
  id: number
  email: string
  ip: string | null
  attemptedAt: string
}

type Stats = {
  users: number
  emails: number
  webhookLogs: number
  oldEmails: number
  estimatedStorageBytes: number
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsState>({
    siteName: 'GhostMail',
    maxEmailsPerUser: '1000',
    emailRetentionDays: '30',
  })
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [usernameItems, setUsernameItems] = useState<BlacklistedItem[]>([])
  const [domainItems, setDomainItems] = useState<BlacklistedItem[]>([])
  const [newUsername, setNewUsername] = useState('')
  const [newDomain, setNewDomain] = useState('')
  const [logs, setLogs] = useState<WebhookLog[]>([])
  const [failedLogins, setFailedLogins] = useState<FailedLogin[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [settingsRes, usernameRes, domainRes, logsRes, failedRes, statsRes] = await Promise.all([
        fetch('/api/admin/settings'),
        fetch('/api/admin/settings/blacklist/usernames'),
        fetch('/api/admin/settings/blacklist/domains'),
        fetch('/api/admin/settings/webhook-logs'),
        fetch('/api/admin/settings/failed-logins'),
        fetch('/api/admin/settings/stats'),
      ])

      const settingsData = settingsRes.ok ? await settingsRes.json() : {}
      setSettings({
        siteName: settingsData.siteName || 'GhostMail',
        maxEmailsPerUser: settingsData.maxEmailsPerUser || '1000',
        emailRetentionDays: settingsData.emailRetentionDays || '30',
      })

      if (usernameRes.ok) setUsernameItems(await usernameRes.json())
      if (domainRes.ok) setDomainItems(await domainRes.json())
      if (logsRes.ok) setLogs(await logsRes.json())
      if (failedRes.ok) setFailedLogins(await failedRes.json())
      if (statsRes.ok) setStats(await statsRes.json())
    } catch (error) {
      console.error(error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const saveGeneralSettings = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error('Failed to save settings')
      toast.success('Settings saved')
      await loadData()
    } catch (error) {
      console.error(error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to change password')
      toast.success('Admin password changed')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const addUsername = async () => {
    try {
      const res = await fetch('/api/admin/settings/blacklist/usernames', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername }),
      })
      if (!res.ok) throw new Error('Failed to add username')
      toast.success('Blacklisted username added')
      setNewUsername('')
      await loadData()
    } catch (error) {
      console.error(error)
      toast.error('Failed to add username')
    }
  }

  const removeUsername = async (id: string) => {
    if (id.startsWith('default:')) {
      toast.error('Default usernames cannot be removed')
      return
    }

    try {
      const res = await fetch('/api/admin/settings/blacklist/usernames', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error('Failed to delete username')
      toast.success('Blacklisted username removed')
      await loadData()
    } catch (error) {
      console.error(error)
      toast.error('Failed to remove username')
    }
  }

  const addDomain = async () => {
    try {
      const res = await fetch('/api/admin/settings/blacklist/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: newDomain }),
      })
      if (!res.ok) throw new Error('Failed to add domain')
      toast.success('Blacklisted domain added')
      setNewDomain('')
      await loadData()
    } catch (error) {
      console.error(error)
      toast.error('Failed to add domain')
    }
  }

  const removeDomain = async (id: string) => {
    if (id.startsWith('default:')) {
      toast.error('Default domains cannot be removed')
      return
    }

    try {
      const res = await fetch('/api/admin/settings/blacklist/domains', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error('Failed to delete domain')
      toast.success('Blacklisted domain removed')
      await loadData()
    } catch (error) {
      console.error(error)
      toast.error('Failed to remove domain')
    }
  }

  const runCleanup = async () => {
    try {
      const res = await fetch('/api/admin/settings/cleanup', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error('Failed to cleanup')
      toast.success(`Deleted ${data.deleted} emails`)
      await loadData()
    } catch (error) {
      console.error(error)
      toast.error('Failed to cleanup emails')
    }
  }

  const clearFailedLogins = async () => {
    try {
      const res = await fetch('/api/admin/settings/failed-logins', { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to clear failed logins')
      toast.success('Failed login attempts cleared')
      await loadData()
    } catch (error) {
      console.error(error)
      toast.error('Failed to clear failed logins')
    }
  }

  const storageEstimate = stats ? `${(stats.estimatedStorageBytes / 1024 / 1024).toFixed(2)} MB` : '--'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="mt-2 text-slate-400">Manage retention, security, blacklists, and diagnostics.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <section className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Server className="h-5 w-5 text-cyan-400" />
                <h2 className="text-lg font-semibold text-white">General Settings</h2>
              </div>
              <input value={settings.siteName} onChange={(event) => setSettings((current) => ({ ...current, siteName: event.target.value }))} placeholder="Site name" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
              <input value={settings.maxEmailsPerUser} onChange={(event) => setSettings((current) => ({ ...current, maxEmailsPerUser: event.target.value }))} placeholder="Max emails per user" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
              <input value={settings.emailRetentionDays} onChange={(event) => setSettings((current) => ({ ...current, emailRetentionDays: event.target.value }))} placeholder="Email retention days" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
              <button onClick={saveGeneralSettings} disabled={saving} className="rounded-2xl bg-cyan-500 px-4 py-3 font-medium text-white disabled:opacity-60">
                <span className="inline-flex items-center gap-2"><Save className="h-4 w-4" /> Save Settings</span>
              </button>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-amber-400" />
                <h2 className="text-lg font-semibold text-white">Security Settings</h2>
              </div>
              <input value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} type="password" placeholder="Current password" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
              <input value={newPassword} onChange={(event) => setNewPassword(event.target.value)} type="password" placeholder="New password" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
              <input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type="password" placeholder="Confirm new password" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
              <button onClick={changePassword} disabled={saving} className="rounded-2xl bg-white/10 px-4 py-3 font-medium text-white hover:bg-white/20 disabled:opacity-60">
                Save Password
              </button>
            </section>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <section className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white">Blacklisted Usernames</h2>
              <div className="flex gap-3">
                <input value={newUsername} onChange={(event) => setNewUsername(event.target.value)} placeholder="Add username" className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
                <button onClick={addUsername} className="rounded-2xl bg-white/10 px-4 py-3 text-white hover:bg-white/20">Add</button>
              </div>
              <div className="space-y-2">
                {usernameItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <span className="text-slate-200">{item.username}</span>
                    <button onClick={() => removeUsername(item.id)} className="text-red-300 hover:text-red-200"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white">Blacklisted Sender Domains</h2>
              <div className="flex gap-3">
                <input value={newDomain} onChange={(event) => setNewDomain(event.target.value)} placeholder="Add domain" className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
                <button onClick={addDomain} className="rounded-2xl bg-white/10 px-4 py-3 text-white hover:bg-white/20">Add</button>
              </div>
              <div className="space-y-2">
                {domainItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <span className="text-slate-200">{item.domain}</span>
                    <button onClick={() => removeDomain(item.id)} className="text-red-300 hover:text-red-200"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <section className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur p-6 space-y-4">
              <div className="flex items-center gap-3">
                <HardDrive className="h-5 w-5 text-red-400" />
                <h2 className="text-lg font-semibold text-white">Cleanup Tools</h2>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Emails older than retention period</p>
                <p className="mt-2 text-3xl font-bold text-white">{stats?.oldEmails ?? 0}</p>
                <button onClick={runCleanup} className="mt-4 rounded-2xl bg-red-500 px-4 py-3 text-white">Run Cleanup</button>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Database Stats</p>
                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  <p>Users: {stats?.users ?? 0}</p>
                  <p>Emails: {stats?.emails ?? 0}</p>
                  <p>Webhook logs: {stats?.webhookLogs ?? 0}</p>
                  <p>Estimated storage: {storageEstimate}</p>
                </div>
              </div>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Webhook className="h-5 w-5 text-cyan-400" />
                <h2 className="text-lg font-semibold text-white">Webhook Logs</h2>
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {logs.map((log) => (
                  <div key={log.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-white">{log.toAddress}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${log.status === 'success' || log.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'}`}>{log.status}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{log.fromAddress}</p>
                    <p className="mt-1 text-xs text-slate-500">{new Date(log.receivedAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Failed Login Attempts</h2>
              <button onClick={clearFailedLogins} className="rounded-2xl bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20">Clear all</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-slate-400">
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">IP</th>
                    <th className="pb-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {failedLogins.map((attempt) => (
                    <tr key={attempt.id} className="border-b border-white/5">
                      <td className="py-3 text-white">{attempt.email}</td>
                      <td className="py-3 text-slate-300">{attempt.ip || 'Unknown'}</td>
                      <td className="py-3 text-slate-400">{new Date(attempt.attemptedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
