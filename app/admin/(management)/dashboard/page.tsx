// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  AlertTriangle,
  CheckCircle,
  Download,
  Mail,
  Megaphone,
  RefreshCw,
  Shield,
  Trash2,
  TrendingUp,
  Users,
  Zap,
  ArrowUpRight,
  Radio,
  Server,
} from 'lucide-react'
import ActivityFeed from '@/components/admin/ActivityFeed'
import AdminAutoRefresh from '@/components/admin/AdminAutoRefresh'
import AdminDashboardCharts from '@/components/admin/AdminDashboardCharts'
import AdminSystemHealthCard from '@/components/admin/AdminSystemHealthCard'

type ChartPoint = { date: string; count: number; label: string }

type DashboardData = {
  stats: {
    totalUsers: number
    totalEmails: number
    emailsToday: number
    emailsThisWeek: number
    bannedUsers: number
    systemStatus: string
  }
  userGrowth: ChartPoint[]
  emailVolume: ChartPoint[]
  recentUsers: unknown[]
  recentEmails: unknown[]
  alerts: {
    failedLogins24h: number
    suspiciousUnresolved: number
    highSeverityCount: number
    bannedUsers: number
  }
  topUsers: {
    id: number
    username: string
    email: string
    lastActive: string | null
    _count: { emails: number }
  }[]
  topSenders: { domain: string; count: number }[]
  suspicious: {
    id: number
    type: string
    description: string
    severity: string
    createdAt: string
  }[]
}

type OverviewResponse = {
  users?: {
    total?: number
    today?: number
    thisWeek?: number
    growth?: ChartPoint[]
  }
  emails?: {
    total?: number
    today?: number
    thisWeek?: number
    volume?: ChartPoint[]
  }
  bannedUsers?: number
  recentUsers?: unknown[]
  recentEmails?: unknown[]
  alerts?: {
    failedLogins24h?: number
    suspiciousUnresolved?: number
    highSeverityCount?: number
    bannedUsers?: number
  }
  topUsers?: DashboardData['topUsers']
  topSenders?: DashboardData['topSenders']
  suspicious?: DashboardData['suspicious']
}

const severityClass: Record<string, string> = {
  low: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  medium: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  high: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
}

function createFallbackData(): DashboardData {
  return {
    stats: {
      totalUsers: 0,
      totalEmails: 0,
      emailsToday: 0,
      emailsThisWeek: 0,
      bannedUsers: 0,
      systemStatus: 'Operational',
    },
    userGrowth: [],
    emailVolume: [],
    recentUsers: [],
    recentEmails: [],
    alerts: {
      failedLogins24h: 0,
      suspiciousUnresolved: 0,
      highSeverityCount: 0,
      bannedUsers: 0,
    },
    topUsers: [],
    topSenders: [],
    suspicious: [],
  }
}

function normalizeDashboardData(payload: OverviewResponse): DashboardData {
  const fallback = createFallbackData()

  return {
    stats: {
      totalUsers: payload.users?.total ?? fallback.stats.totalUsers,
      totalEmails: payload.emails?.total ?? fallback.stats.totalEmails,
      emailsToday: payload.emails?.today ?? fallback.stats.emailsToday,
      emailsThisWeek: payload.emails?.thisWeek ?? fallback.stats.emailsThisWeek,
      bannedUsers: payload.bannedUsers ?? fallback.stats.bannedUsers,
      systemStatus: 'Operational',
    },
    userGrowth: payload.users?.growth ?? fallback.userGrowth,
    emailVolume: payload.emails?.volume ?? fallback.emailVolume,
    recentUsers: payload.recentUsers ?? fallback.recentUsers,
    recentEmails: payload.recentEmails ?? fallback.recentEmails,
    alerts: {
      failedLogins24h: payload.alerts?.failedLogins24h ?? fallback.alerts.failedLogins24h,
      suspiciousUnresolved:
        payload.alerts?.suspiciousUnresolved ?? fallback.alerts.suspiciousUnresolved,
      highSeverityCount: payload.alerts?.highSeverityCount ?? fallback.alerts.highSeverityCount,
      bannedUsers: payload.alerts?.bannedUsers ?? payload.bannedUsers ?? fallback.alerts.bannedUsers,
    },
    topUsers: payload.topUsers ?? fallback.topUsers,
    topSenders: payload.topSenders ?? fallback.topSenders,
    suspicious: payload.suspicious ?? fallback.suspicious,
  }
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAnnouncement, setShowAnnouncement] = useState(false)
  const [announcementMsg, setAnnouncementMsg] = useState('')
  const [announcementColor, setAnnouncementColor] = useState('blue')

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/analytics/overview')
      if (!res.ok) throw new Error('Failed to fetch overview')
      const payload: OverviewResponse = await res.json()
      setData(normalizeDashboardData(payload))
    } catch (error) {
      console.error('Dashboard error:', error)
      setData(createFallbackData())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const runCleanup = async () => {
    try {
      const res = await fetch('/api/admin/settings/cleanup', { method: 'POST' })
      const json = await res.json()
      if (res.ok) toast.success(`Pruned ${json.deleted ?? 0} expired emails`)
      else toast.error(json.error || 'Cleanup failed')
    } catch {
      toast.error('Cleanup operation error')
    }
  }

  const blockDomain = async (domain: string) => {
    try {
      const res = await fetch('/api/admin/settings/blacklist/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      })
      if (res.ok) toast.success(`Blocked domain: ${domain}`)
      else toast.error('Failed to block domain')
    } catch {
      toast.error('Network error blocking domain')
    }
  }

  const resolveSuspicious = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/suspicious/${id}`, { method: 'PATCH' })
      if (res.ok) {
        toast.success('Alert resolved')
        fetchDashboard()
      }
    } catch {
      toast.error('Failed to resolve alert')
    }
  }

  const saveAnnouncement = async () => {
    if (!announcementMsg.trim()) {
      toast.error('Please enter an announcement message')
      return
    }
    try {
      const res = await fetch('/api/admin/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: announcementMsg, color: announcementColor, isActive: true }),
      })
      if (res.ok) {
        toast.success('Announcement broadcast published')
        setShowAnnouncement(false)
        setAnnouncementMsg('')
      } else {
        toast.error('Failed to publish announcement')
      }
    } catch {
      toast.error('Failed to publish announcement')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-3 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        <p className="text-xs uppercase tracking-wider font-semibold">Loading Mission Control Telemetry...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
        Telemetry unavailable. Please check backend connection.
      </div>
    )
  }

  const stats = [
    {
      label: 'Total Registered Users',
      value: data.stats.totalUsers,
      icon: Users,
      glow: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      sub: 'Active accounts across domains',
    },
    {
      label: 'Total Ingested Mails',
      value: data.stats.totalEmails,
      icon: Mail,
      glow: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      sub: 'All-time mail relay count',
    },
    {
      label: "Today's Live Volume",
      value: data.stats.emailsToday,
      icon: Zap,
      glow: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      sub: 'Ingested since 00:00 UTC',
    },
    {
      label: '7-Day Rolling Ingestion',
      value: data.stats.emailsThisWeek,
      icon: TrendingUp,
      glow: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      sub: 'Past 168 hours total',
    },
    {
      label: 'Banned / Blacklisted',
      value: data.stats.bannedUsers,
      icon: Shield,
      glow: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      sub: 'Restricted from platform',
    },
    {
      label: 'Infrastructure State',
      value: data.stats.systemStatus,
      icon: CheckCircle,
      glow: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      sub: 'Worker & Edge operational',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
              <Radio className="h-3 w-3 animate-pulse text-cyan-400" />
              Live Operations
            </span>
            <span className="text-xs text-slate-400">officialum1 • umiskills</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Admin Mission Control
          </h1>
          <p className="mt-1 text-xs lg:text-sm text-slate-500 dark:text-slate-400">
            Real-time telemetry, inbound mail stream analysis, security mitigations, and user management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AdminAutoRefresh interval={30000} onRefresh={fetchDashboard} />
          <button
            onClick={fetchDashboard}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm backdrop-blur transition hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <RefreshCw className="h-3.5 w-3.5 text-cyan-400" />
            Sync Now
          </button>
        </div>
      </div>

      {/* Security Alerts / Health Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className={`rounded-2xl border p-4.5 backdrop-blur transition ${
            data.alerts.failedLogins24h > 10
              ? 'border-rose-500/30 bg-rose-500/10 text-rose-200'
              : 'border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Failed Logins (24h)
            </span>
            <span
              className={`h-2 w-2 rounded-full ${
                data.alerts.failedLogins24h > 10 ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'
              }`}
            />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-black ${
                data.alerts.failedLogins24h > 10 ? 'text-rose-400' : 'text-slate-900 dark:text-white'
              }`}
            >
              {data.alerts.failedLogins24h}
            </span>
            <span className="text-xs text-slate-500">
              {data.alerts.failedLogins24h > 10 ? 'Elevated failure rate' : 'Normal threshold'}
            </span>
          </div>
        </div>

        <div
          className={`rounded-2xl border p-4.5 backdrop-blur transition ${
            data.alerts.suspiciousUnresolved > 0
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
              : 'border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Suspicious Alerts
            </span>
            <span
              className={`h-2 w-2 rounded-full ${
                data.alerts.suspiciousUnresolved > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
              }`}
            />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-black ${
                data.alerts.suspiciousUnresolved > 0 ? 'text-amber-400' : 'text-slate-900 dark:text-white'
              }`}
            >
              {data.alerts.suspiciousUnresolved}
            </span>
            <span className="text-xs text-slate-500">
              {data.alerts.suspiciousUnresolved > 0 ? 'Require inspection' : 'Zero flags active'}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/80 p-4.5 backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Banned Accounts
            </span>
            <Shield className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {data.alerts.bannedUsers}
            </span>
            <span className="text-xs text-slate-500">Enforced by security policy</span>
          </div>
        </div>
      </div>

      {/* 6 Executive KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 p-5 shadow-sm backdrop-blur transition hover:border-slate-300 dark:hover:border-white/20"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{stat.sub}</p>
                </div>
                <div className={`rounded-xl border p-3 ${stat.glow}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions Panel */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/80 p-5 backdrop-blur shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Executive Actions
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">One-click operations</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={runCleanup}
            className="flex items-center gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-xs font-semibold text-rose-600 dark:text-rose-400 transition hover:bg-rose-500/10 hover:border-rose-500/30"
          >
            <Trash2 className="h-4 w-4 text-rose-500" />
            <span>Purge Expired Mails</span>
          </button>

          <button
            onClick={() => window.open('/api/admin/users/export')}
            className="flex items-center gap-2.5 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-xs font-semibold text-cyan-600 dark:text-cyan-400 transition hover:bg-cyan-500/10 hover:border-cyan-500/30"
          >
            <Download className="h-4 w-4 text-cyan-500" />
            <span>Export Users CSV</span>
          </button>

          <button
            onClick={() => setShowAnnouncement(true)}
            className="flex items-center gap-2.5 rounded-xl border border-purple-500/20 bg-purple-500/5 px-4 py-3 text-xs font-semibold text-purple-600 dark:text-purple-400 transition hover:bg-purple-500/10 hover:border-purple-500/30"
          >
            <Megaphone className="h-4 w-4 text-purple-500" />
            <span>Broadcast Alert</span>
          </button>

          <button
            onClick={fetchDashboard}
            className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 transition hover:bg-emerald-500/10 hover:border-emerald-500/30"
          >
            <RefreshCw className="h-4 w-4 text-emerald-500" />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Telemetry, Charts & Activity Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <AdminSystemHealthCard />
          <AdminDashboardCharts userGrowth={data.userGrowth} emailVolume={data.emailVolume} />

          {/* Suspicious Alerts Box */}
          {data.suspicious.length > 0 && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-rose-300">
                  <AlertTriangle className="h-5 w-5 text-rose-400" />
                  <h2 className="font-bold text-sm tracking-wide">
                    {data.suspicious.length} Unresolved Security Flag(s)
                  </h2>
                </div>
                <Link
                  href="/admin/security"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline"
                >
                  Inspect in Security Center <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="space-y-2">
                {data.suspicious.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-white/5 bg-[#07090e]/60 px-4 py-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                            severityClass[item.severity] || severityClass.low
                          }`}
                        >
                          {item.severity}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{item.type}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-100 mt-1">{item.description}</p>
                    </div>
                    <button
                      onClick={() => resolveSuspicious(item.id)}
                      className="self-end sm:self-center text-xs font-semibold text-emerald-400 hover:text-emerald-300 px-3 py-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 transition"
                    >
                      Resolve Flag
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Users & Top Senders Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Users Card */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/80 p-5 backdrop-blur shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-cyan-400" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Top Active Accounts
                  </h2>
                </div>
                <Link
                  href="/admin/users"
                  className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {data.topUsers.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-500">No active accounts registered yet.</p>
                ) : (
                  data.topUsers.map((user, i) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 rounded-xl border border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] p-2.5 transition hover:bg-slate-100 dark:hover:bg-white/5"
                    >
                      <span className="text-xs font-mono font-bold text-slate-400 w-5 text-center">
                        #{i + 1}
                      </span>
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-black text-white shadow-sm">
                        {user.username[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {user.username}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-xs font-bold font-mono text-cyan-600 dark:text-cyan-300">
                          {user._count.emails} mails
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Top Senders Card */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/80 p-5 backdrop-blur shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-purple-400" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Top Inbound Domains
                  </h2>
                </div>
                <Link
                  href="/admin/emails"
                  className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                  Inspect Mails
                </Link>
              </div>

              <div className="space-y-3">
                {data.topSenders.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-500">No inbound domain telemetry yet.</p>
                ) : (
                  data.topSenders.map((sender) => (
                    <div
                      key={sender.domain}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] p-2.5 transition hover:bg-slate-100 dark:hover:bg-white/5"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate">
                          @{sender.domain}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">{sender.count} messages delivered</p>
                      </div>
                      <button
                        onClick={() => blockDomain(sender.domain)}
                        className="text-[11px] font-semibold text-rose-400 border border-rose-500/30 rounded-lg px-2.5 py-1 hover:bg-rose-500/10 transition"
                      >
                        Block
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Activity Feed Sidebar */}
        <div className="space-y-6">
          <ActivityFeed />
        </div>
      </div>

      {/* Broadcast Announcement Modal */}
      {showAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1017] p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Megaphone className="h-5 w-5 text-purple-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Broadcast Global Banner</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              This message will display across all active user dashboard sessions instantly.
            </p>

            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Banner Message
            </label>
            <textarea
              value={announcementMsg}
              onChange={(e) => setAnnouncementMsg(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 mb-3"
              placeholder="e.g. Scheduled maintenance at 03:00 UTC. Ingestion remains uninterrupted..."
            />

            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Banner Accent Color
            </label>
            <div className="grid grid-cols-4 gap-2 mb-6">
              {[
                { id: 'blue', label: 'Blue', border: 'border-blue-500', bg: 'bg-blue-500/20' },
                { id: 'green', label: 'Green', border: 'border-emerald-500', bg: 'bg-emerald-500/20' },
                { id: 'yellow', label: 'Yellow', border: 'border-amber-500', bg: 'bg-amber-500/20' },
                { id: 'red', label: 'Red', border: 'border-rose-500', bg: 'bg-rose-500/20' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setAnnouncementColor(c.id)}
                  className={`rounded-xl border py-2 text-xs font-bold capitalize transition ${
                    announcementColor === c.id
                      ? `${c.border} ${c.bg} text-white`
                      : 'border-slate-200 dark:border-white/10 text-slate-400 hover:border-slate-400'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAnnouncement(false)}
                className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveAnnouncement}
                className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-xs font-bold text-white shadow-md hover:from-cyan-400 hover:to-blue-500 transition"
              >
                Publish Broadcast
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
