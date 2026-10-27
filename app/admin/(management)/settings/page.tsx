// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

'use client'

import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  HardDrive,
  Save,
  Server,
  Shield,
  Trash2,
  Webhook,
  Sliders,
  Bell,
  Ban,
  Lock,
  Plus,
} from 'lucide-react'
import AdminCryptoAndApiManagement from '@/components/AdminCryptoAndApiManagement'

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
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [registrationEnabled, setRegistrationEnabled] = useState(true)
  const [minUsernameLength, setMinUsernameLength] = useState('3')
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false)
  const [maintenanceMessage, setMaintenanceMessage] = useState('')
  const [announcementMsg, setAnnouncementMsg] = useState('')
  const [announcementColor, setAnnouncementColor] = useState('blue')
  const [announcementActive, setAnnouncementActive] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [settingsRes, usernameRes, domainRes, logsRes, statsRes, regRes, maintRes, annRes] =
        await Promise.all([
          fetch('/api/admin/settings'),
          fetch('/api/admin/settings/blacklist/usernames'),
          fetch('/api/admin/settings/blacklist/domains'),
          fetch('/api/admin/settings/webhook-logs'),
          fetch('/api/admin/settings/stats'),
          fetch('/api/admin/settings/registration'),
          fetch('/api/admin/settings/maintenance'),
          fetch('/api/admin/announcement'),
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
      if (statsRes.ok) setStats(await statsRes.json())
      if (regRes.ok) {
        const reg = await regRes.json()
        setRegistrationEnabled(reg.enabled !== false)
        if (reg.minUsernameLength) {
          setMinUsernameLength(String(reg.minUsernameLength))
        }
      }
      if (maintRes.ok) {
        const maint = await maintRes.json()
        setMaintenanceEnabled(maint.enabled)
        setMaintenanceMessage(maint.message || '')
      }
      if (annRes.ok) {
        const ann = await annRes.json()
        if (ann) {
          setAnnouncementMsg(ann.message || '')
          setAnnouncementColor(ann.color || 'blue')
          setAnnouncementActive(ann.isActive)
        }
      }
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
      toast.success('General settings saved successfully')
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
      toast.error('New passwords do not match')
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
      toast.success('Admin password updated')
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
    if (!newUsername.trim()) return
    try {
      const res = await fetch('/api/admin/settings/blacklist/usernames', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername.trim() }),
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
      toast.error('Default system usernames cannot be deleted')
      return
    }

    try {
      const res = await fetch('/api/admin/settings/blacklist/usernames', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error('Failed to delete username')
      toast.success('Username removed from blacklist')
      await loadData()
    } catch (error) {
      console.error(error)
      toast.error('Failed to remove username')
    }
  }

  const addDomain = async () => {
    if (!newDomain.trim()) return
    try {
      const res = await fetch('/api/admin/settings/blacklist/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: newDomain.trim() }),
      })
      if (!res.ok) throw new Error('Failed to add domain')
      toast.success('Sender domain added to blacklist')
      setNewDomain('')
      await loadData()
    } catch (error) {
      console.error(error)
      toast.error('Failed to add domain')
    }
  }

  const removeDomain = async (id: string) => {
    if (id.startsWith('default:')) {
      toast.error('Default domain rules cannot be deleted')
      return
    }

    try {
      const res = await fetch('/api/admin/settings/blacklist/domains', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error('Failed to delete domain')
      toast.success('Domain removed from blacklist')
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
      toast.success(`Purged ${data.deleted} expired emails`)
      await loadData()
    } catch (error) {
      console.error(error)
      toast.error('Failed to cleanup emails')
    }
  }

  const saveRegistration = async () => {
    try {
      const res = await fetch('/api/admin/settings/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: registrationEnabled, minUsernameLength }),
      })
      if (res.ok) toast.success('Registration policy updated')
      else toast.error('Failed to save registration policy')
    } catch {
      toast.error('Network error saving registration policy')
    }
  }

  const saveMaintenance = async () => {
    try {
      const res = await fetch('/api/admin/settings/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: maintenanceEnabled, message: maintenanceMessage }),
      })
      if (res.ok) toast.success('Maintenance mode updated')
      else toast.error('Failed to update maintenance mode')
    } catch {
      toast.error('Network error saving maintenance mode')
    }
  }

  const saveAnnouncement = async () => {
    try {
      if (announcementActive) {
        const res = await fetch('/api/admin/announcement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: announcementMsg, color: announcementColor, isActive: true }),
        })
        if (res.ok) toast.success('Banner announcement published')
        else toast.error('Failed to save banner')
      } else {
        const res = await fetch('/api/admin/announcement', { method: 'DELETE' })
        if (res.ok) toast.success('Banner announcement disabled')
      }
    } catch {
      toast.error('Network error updating announcement')
    }
  }

  const storageEstimate = stats ? `${(stats.estimatedStorageBytes / 1024 / 1024).toFixed(2)} MB` : '--'
  const announcementPreviewClass: Record<string, string> = {
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    green: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    yellow: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    red: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
              <Sliders className="h-3 w-3 text-cyan-400" />
              Configuration Engine
            </span>
            <span className="text-xs text-slate-400">System Parameters & Moderation Rules</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            System Settings
          </h1>
          <p className="mt-1 text-xs lg:text-sm text-slate-500 dark:text-slate-400">
            Configure global mail retention policies, user registration gates, blacklists, and broadcast announcements.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Loading System Configuration...
          </p>
        </div>
      ) : (
        <>
          {/* Section: General Settings & Security Settings */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* General Settings */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 backdrop-blur-xl shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <Server className="h-4 w-4 text-cyan-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  General Platform Parameters
                </h2>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Platform Name
                </label>
                <input
                  value={settings.siteName}
                  onChange={(e) => setSettings((c) => ({ ...c, siteName: e.target.value }))}
                  placeholder="e.g. GhostMail"
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Max Inbound Emails Per Mailbox
                </label>
                <input
                  value={settings.maxEmailsPerUser}
                  onChange={(e) => setSettings((c) => ({ ...c, maxEmailsPerUser: e.target.value }))}
                  type="number"
                  placeholder="1000"
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Email Retention Window (Days)
                </label>
                <input
                  value={settings.emailRetentionDays}
                  onChange={(e) => setSettings((c) => ({ ...c, emailRetentionDays: e.target.value }))}
                  type="number"
                  placeholder="30"
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <button
                onClick={saveGeneralSettings}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:from-cyan-400 hover:to-blue-500 transition disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save General Settings</span>
              </button>
            </div>

            {/* Admin Password Change */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 backdrop-blur-xl shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <Lock className="h-4 w-4 text-amber-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Administrator Credentials
                </h2>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Current Password
                </label>
                <input
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  New Password
                </label>
                <input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <button
                onClick={changePassword}
                disabled={saving || !newPassword}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition disabled:opacity-50"
              >
                <Shield className="h-3.5 w-3.5 text-amber-400" />
                <span>Update Admin Password</span>
              </button>
            </div>
          </div>

          {/* Registration & Maintenance Mode */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Registration Access */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 backdrop-blur-xl shadow-sm p-6 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Registration &amp; Access Gate
              </h2>

              <label className="flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-black/30 p-3.5 cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Allow Public Registrations</p>
                  <p className="text-[11px] text-slate-500">When disabled, new signups are blocked</p>
                </div>
                <input
                  type="checkbox"
                  checked={registrationEnabled}
                  onChange={(e) => setRegistrationEnabled(e.target.checked)}
                  className="h-4 w-4 rounded accent-cyan-500 cursor-pointer"
                />
              </label>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Minimum Username Length
                </label>
                <input
                  value={minUsernameLength}
                  onChange={(e) => setMinUsernameLength(e.target.value)}
                  type="number"
                  min={3}
                  max={20}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <button
                onClick={saveRegistration}
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-cyan-400 hover:to-blue-500 transition"
              >
                Save Registration Policy
              </button>
            </div>

            {/* Maintenance Mode */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 backdrop-blur-xl shadow-sm p-6 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Platform Maintenance Mode
              </h2>

              <label className="flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-black/30 p-3.5 cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Activate Maintenance</p>
                  <p className="text-[11px] text-slate-500">Redirects public visitors to maintenance screen</p>
                </div>
                <input
                  type="checkbox"
                  checked={maintenanceEnabled}
                  onChange={(e) => setMaintenanceEnabled(e.target.checked)}
                  className="h-4 w-4 rounded accent-amber-500 cursor-pointer"
                />
              </label>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Maintenance Notice Message
                </label>
                <textarea
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  rows={2}
                  placeholder="System undergoing scheduled infrastructure upgrade..."
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              <button
                onClick={saveMaintenance}
                className="rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 shadow-md transition"
              >
                Save Maintenance Status
              </button>
            </div>
          </div>

          {/* Announcement Banner Configuration */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 backdrop-blur-xl shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-purple-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Global Banner Announcement
              </h2>
            </div>

            <label className="flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-black/30 p-3.5 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Display Global Dashboard Banner</p>
                <p className="text-[11px] text-slate-500">Visible to all signed-in users on their mailboxes</p>
              </div>
              <input
                type="checkbox"
                checked={announcementActive}
                onChange={(e) => setAnnouncementActive(e.target.checked)}
                className="h-4 w-4 rounded accent-purple-500 cursor-pointer"
              />
            </label>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Announcement Copy
              </label>
              <textarea
                value={announcementMsg}
                onChange={(e) => setAnnouncementMsg(e.target.value)}
                rows={2}
                placeholder="Scheduled Cloudflare edge maintenance at 03:00 UTC..."
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {['blue', 'green', 'yellow', 'red'].map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAnnouncementColor(color)}
                  className={`rounded-xl border py-2 text-xs font-bold capitalize transition ${
                    announcementColor === color
                      ? 'border-purple-500 bg-purple-500/20 text-white'
                      : 'border-slate-200 dark:border-white/10 text-slate-400 hover:border-slate-400'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>

            {announcementMsg && (
              <div className={`rounded-xl border p-3 text-xs font-medium ${announcementPreviewClass[announcementColor]}`}>
                <strong>Preview:</strong> {announcementMsg}
              </div>
            )}

            <button
              onClick={saveAnnouncement}
              className="rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-bold text-white shadow-md transition"
            >
              Update Banner Status
            </button>
          </div>

          {/* Blacklists Section: Usernames & Sender Domains */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Username Blacklist */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 backdrop-blur-xl shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Ban className="h-4 w-4 text-rose-500" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Reserved &amp; Blacklisted Usernames
                </h2>
              </div>

              <div className="flex gap-2">
                <input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. root, support, billing"
                  className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                />
                <button
                  onClick={addUsername}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>

              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {usernameItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] px-3.5 py-2 text-xs"
                  >
                    <span className="font-mono text-slate-700 dark:text-slate-200 font-semibold">
                      {item.username}
                    </span>
                    {!item.isDefault && (
                      <button
                        onClick={() => removeUsername(item.id)}
                        className="text-slate-400 hover:text-rose-400 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Domain Blacklist */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 backdrop-blur-xl shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Ban className="h-4 w-4 text-rose-500" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Blacklisted Inbound Sender Domains
                </h2>
              </div>

              <div className="flex gap-2">
                <input
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="e.g. spammer-relay.com"
                  className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                />
                <button
                  onClick={addDomain}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Block
                </button>
              </div>

              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {domainItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] px-3.5 py-2 text-xs"
                  >
                    <span className="font-mono text-slate-700 dark:text-slate-200 font-semibold">
                      @{item.domain}
                    </span>
                    {!item.isDefault && (
                      <button
                        onClick={() => removeDomain(item.id)}
                        className="text-slate-400 hover:text-rose-400 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Database & Storage Telemetry */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 backdrop-blur-xl shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-rose-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Database Pruning &amp; Cleanup
                </h2>
              </div>

              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Emails older than retention policy:</p>
                  <p className="text-2xl font-black font-mono text-rose-400 mt-1">
                    {stats?.oldEmails ?? 0}
                  </p>
                </div>
                <button
                  onClick={runCleanup}
                  className="rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition"
                >
                  Purge Expired Now
                </button>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Registered Users</span>
                  <span className="font-mono font-bold text-slate-200">{stats?.users ?? 0}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Ingested Emails</span>
                  <span className="font-mono font-bold text-slate-200">{stats?.emails ?? 0}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Stored Webhook Logs</span>
                  <span className="font-mono font-bold text-slate-200">{stats?.webhookLogs ?? 0}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Estimated DB Disk Size</span>
                  <span className="font-mono font-bold text-cyan-400">{storageEstimate}</span>
                </div>
              </div>
            </div>

            {/* Webhook Stream Logs */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 backdrop-blur-xl shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Webhook className="h-4 w-4 text-cyan-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Recent Cloudflare Webhook Logs
                </h2>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="py-8 text-center text-xs text-slate-400">No webhook telemetry captured.</p>
                ) : (
                  logs.slice(0, 8).map((log) => (
                    <div
                      key={log.id}
                      className="rounded-xl border border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] p-3 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900 dark:text-white truncate">
                          {log.toAddress}
                        </span>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                            log.status === 'success' || log.status === 'delivered'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {log.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono truncate">{log.fromAddress}</p>
                      <p className="text-[10px] text-slate-500">{new Date(log.receivedAt).toLocaleTimeString()}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <AdminCryptoAndApiManagement />
        </>
      )}
    </div>
  )
}
