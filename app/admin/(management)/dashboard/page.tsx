'use client'

import { useCallback, useEffect, useState } from 'react'
import { CheckCircle, Mail, Shield, TrendingUp, Users, Zap } from 'lucide-react'
import AdminAutoRefresh from '@/components/admin/AdminAutoRefresh'
import AdminDashboardCharts from '@/components/admin/AdminDashboardCharts'

type ChartPoint = {
  date: string
  count: number
  label: string
}

type RecentUser = {
  id: number
  username: string
  email: string
  createdAt: string
  _count: { emails: number }
}

type RecentEmail = {
  id: number
  fromAddress: string
  subject: string
  receivedAt: string
  user: { username: string; email: string }
}

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
  recentUsers: RecentUser[]
  recentEmails: RecentEmail[]
}

const statCardStyles = [
  'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'text-purple-400 bg-purple-500/10 border-purple-500/20',
  'text-red-400 bg-red-500/10 border-red-500/20',
  'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
]

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/dashboard')
      if (!res.ok) throw new Error('Failed to load dashboard')
      const json = await res.json()
      setData(json)
      setError('')
    } catch (err) {
      console.error(err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px] text-slate-400">Loading dashboard...</div>
  }

  if (error || !data) {
    return <div className="text-red-400">{error || 'Dashboard unavailable'}</div>
  }

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

      <div>
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="mt-2 text-slate-400">Live system metrics, user growth, and recent platform activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const cardStyle = statCardStyles[index]
          return (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </p>
                </div>
                <div className={`rounded-2xl border p-3 ${cardStyle}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <AdminDashboardCharts userGrowth={data.userGrowth} emailVolume={data.emailVolume} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-slate-400">
                  <th className="pb-3 font-medium">User</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Joined</th>
                  <th className="pb-3 font-medium text-right">Emails</th>
                </tr>
              </thead>
              <tbody>
                {data.recentUsers.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 font-semibold text-white">
                          {user.username[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-white">{user.username}</span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-300">{user.email}</td>
                    <td className="py-4 text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 text-right">
                      <span className="rounded-full px-2 py-0.5 text-xs bg-cyan-400/10 text-cyan-300">
                        {user._count.emails}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Emails</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-slate-400">
                  <th className="pb-3 font-medium">From</th>
                  <th className="pb-3 font-medium">To</th>
                  <th className="pb-3 font-medium">Subject</th>
                  <th className="pb-3 font-medium text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {data.recentEmails.map((email) => (
                  <tr key={email.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-4 text-white max-w-[180px] truncate">{email.fromAddress}</td>
                    <td className="py-4 text-cyan-300">{email.user.username}</td>
                    <td className="py-4 text-slate-300 max-w-[220px] truncate">{email.subject}</td>
                    <td className="py-4 text-right text-slate-400">
                      {new Date(email.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}


