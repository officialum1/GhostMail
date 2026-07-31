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
} from 'lucide-react'
import ActivityFeed from '@/components/admin/ActivityFeed'
import AdminAutoRefresh from '@/components/admin/AdminAutoRefresh'
import AdminDashboardCharts from '@/components/admin/AdminDashboardCharts'

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

const statCardStyles = [
  'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'text-purple-400 bg-purple-500/10 border-purple-500/20',
  'text-red-400 bg-red-500/10 border-red-500/20',
  'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
]

const severityClass: Record<string, string> = {
  low: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  medium: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
}

function createFallbackData(): DashboardData {
  return {
    stats: {
      totalUsers: 0,
      totalEmails: 0,
      emailsToday: 0,
      emailsThisWeek: 0,
      bannedUsers: 0,
      systemStatus: 'Online',
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
      systemStatus: 'Online',
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
      if (!res.ok) throw new Error('Failed')
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
    const res = await fetch('/api/admin/settings/cleanup', { method: 'POST' })
    const json = await res.json()
    if (res.ok) toast.success(`Deleted ${json.deleted ?? 0} emails`)
    else toast.error(json.error || 'Cleanup failed')
  }

  const blockDomain = async (domain: string) => {
    const res = await fetch('/api/admin/settings/blacklist/domains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain }),
    })
    if (res.ok) toast.success(`Blocked ${domain}`)
    else toast.error('Failed to block domain')
  }

  const resolveSuspicious = async (id: number) => {
    const res = await fetch(`/api/admin/suspicious/${id}`, { method: 'PATCH' })
    if (res.ok) {
      toast.success('Resolved')
      fetchDashboard()
    }
  }

  const saveAnnouncement = async () => {
    const res = await fetch('/api/admin/announcement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: announcementMsg, color: announcementColor, isActive: true }),
    })
    if (res.ok) {
      toast.success('Announcement published')
      setShowAnnouncement(false)
    } else toast.error('Failed to save announcement')
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px] text-slate-500 dark:text-slate-400">Loading dashboard...</div>
  }

  if (!data) return <div className="text-red-400">Dashboard unavailable</div>

  const stats = [
    { label: 'Total Users', value: data.stats.totalUsers, icon: Users },
    { label: 'Total Emails', value: data.stats.totalEmails, icon: Mail },
    { label: 'Emails Today', value: data.stats.emailsToday, icon: Zap },
    { label: 'Emails This Week', value: data.stats.emailsThisWeek, icon: TrendingUp },
    { label: 'Banned Users', value: data.stats.bannedUsers, icon: Shield },
    { label: 'System Status', value: data.stats.systemStatus, icon: CheckCircle },
  ]

  return (
    <div className="space-y-6">
      <AdminAutoRefresh interval={30000} onRefresh={fetchDashboard} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Live metrics, activity feed, and quick actions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`rounded-2xl border p-4 ${data.alerts.failedLogins24h > 10 ? 'border-red-500/30 bg-red-500/10' : 'border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5'}`}>
          <p className="text-sm text-slate-500 dark:text-slate-400">Failed Logins (24h)</p>
          <p className={`text-2xl font-bold mt-1 ${data.alerts.failedLogins24h > 10 ? 'text-red-400' : 'text-slate-900 dark:text-white'}`}>
            {data.alerts.failedLogins24h}
          </p>
        </div>
        <div className={`rounded-2xl border p-4 ${data.alerts.highSeverityCount > 0 ? 'border-red-500/30 bg-red-500/10' : 'border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5'}`}>
          <p className="text-sm text-slate-500 dark:text-slate-400">Suspicious Alerts</p>
          <p className={`text-2xl font-bold mt-1 ${data.alerts.suspiciousUnresolved > 0 ? 'text-orange-400' : 'text-slate-900 dark:text-white'}`}>
            {data.alerts.suspiciousUnresolved}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Banned Users</p>
          <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{data.alerts.bannedUsers}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </p>
                </div>
                <div className={`rounded-2xl border p-3 ${statCardStyles[index]}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button onClick={runCleanup} className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-900 dark:text-white hover:bg-white/5">
            <Trash2 className="h-4 w-4 text-red-400" /> Clean Old Emails
          </button>
          <button onClick={() => window.open('/api/admin/users/export')} className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-900 dark:text-white hover:bg-white/5">
            <Download className="h-4 w-4 text-cyan-400" /> Export Users CSV
          </button>
          <button onClick={() => setShowAnnouncement(true)} className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-900 dark:text-white hover:bg-white/5">
            <Megaphone className="h-4 w-4 text-purple-400" /> Send Announcement
          </button>
          <button onClick={fetchDashboard} className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-900 dark:text-white hover:bg-white/5">
            <RefreshCw className="h-4 w-4 text-emerald-400" /> Refresh Stats
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <AdminDashboardCharts userGrowth={data.userGrowth} emailVolume={data.emailVolume} />

          {data.suspicious.length > 0 && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-red-300">
                  <AlertTriangle className="h-5 w-5" />
                  <h2 className="font-semibold">{data.suspicious.length} Suspicious Alerts</h2>
                </div>
                <Link href="/admin/security" className="text-sm text-cyan-400 hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-2">
                {data.suspicious.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
                    <div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${severityClass[item.severity] || severityClass.low}`}>
                        {item.severity}
                      </span>
                      <p className="text-sm text-slate-900 dark:text-white mt-1">{item.description}</p>
                    </div>
                    <button onClick={() => resolveSuspicious(item.id)} className="text-xs text-emerald-400 hover:underline">
                      Resolve
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Top Users</h2>
              <div className="space-y-3">
                {data.topUsers.map((user, i) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <span className="text-slate-500 w-6">{i + 1}</span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-sm font-bold">
                      {user.username[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 dark:text-white font-medium truncate">{user.username}</p>
                      <p className="text-xs text-slate-500">
                        {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never active'}
                      </p>
                    </div>
                    <span className="rounded-full bg-cyan-500/10 text-cyan-300 text-xs px-2 py-1 border border-cyan-500/20">
                      {user._count.emails}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Top Senders</h2>
              <div className="space-y-3">
                {data.topSenders.map((sender) => (
                  <div key={sender.domain} className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-slate-900 dark:text-white font-medium">{sender.domain}</p>
                      <p className="text-xs text-slate-500">{sender.count} emails</p>
                    </div>
                    <button
                      onClick={() => blockDomain(sender.domain)}
                      className="text-xs text-red-400 border border-red-500/30 rounded-lg px-2 py-1 hover:bg-red-500/10"
                    >
                      Block
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <ActivityFeed />
      </div>

      {showAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-white/10 bg-[#0d1425] p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Send Announcement</h3>
            <textarea
              value={announcementMsg}
              onChange={(e) => setAnnouncementMsg(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-black/30 px-4 py-3 text-slate-900 dark:text-white mb-3"
              placeholder="Announcement message..."
            />
            <select
              value={announcementColor}
              onChange={(e) => setAnnouncementColor(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-black/30 px-4 py-3 text-slate-900 dark:text-white mb-4"
            >
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="yellow">Yellow</option>
              <option value="red">Red</option>
            </select>
            <div className="flex gap-3">
              <button onClick={saveAnnouncement} className="flex-1 rounded-xl bg-cyan-500 py-2 text-slate-900 dark:text-white font-medium">
                Publish
              </button>
              <button onClick={() => setShowAnnouncement(false)} className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 py-2 text-slate-600 dark:text-slate-300">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


