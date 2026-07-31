'use client'

import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type ChartPoint = { date: string; count: number; label?: string }
type PeakHour = { hour: number; count: number }
type TopUser = { username: string; email: string; count?: number; _count?: { emails?: number } }

type Overview = {
  users: { total: number; today: number; growth: ChartPoint[] }
  emails: {
    total: number
    today: number
    volume: ChartPoint[]
    peakHours: PeakHour[]
    avgPerUser: number
    avgPerDay: number
  }
  topSenders: { domain: string; count: number }[]
  topUsers: { username: string; email: string; count: number }[]
  webhookStats: { total: number; success: number; successRate: number }
}

type OverviewPayload = {
  users?: Partial<Overview['users']>
  emails?: Partial<Overview['emails']>
  topSenders?: Overview['topSenders']
  topUsers?: TopUser[]
  webhookStats?: Partial<Overview['webhookStats']>
}

const emptyPeakHours = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }))

function asArray<T>(value: T[] | undefined) {
  return Array.isArray(value) ? value : []
}

function normalizeOverview(payload: OverviewPayload): Overview {
  const totalEmails = payload.emails?.total ?? 0
  const totalUsers = payload.users?.total ?? 0

  return {
    users: {
      total: totalUsers,
      today: payload.users?.today ?? 0,
      growth: asArray(payload.users?.growth),
    },
    emails: {
      total: totalEmails,
      today: payload.emails?.today ?? 0,
      volume: asArray(payload.emails?.volume),
      peakHours: asArray(payload.emails?.peakHours).length > 0 ? asArray(payload.emails?.peakHours) : emptyPeakHours,
      avgPerUser: payload.emails?.avgPerUser ?? (totalUsers > 0 ? Number((totalEmails / totalUsers).toFixed(1)) : 0),
      avgPerDay: payload.emails?.avgPerDay ?? 0,
    },
    topSenders: asArray(payload.topSenders),
    topUsers: asArray(payload.topUsers).map((user) => ({
      username: user.username,
      email: user.email,
      count: user.count ?? user._count?.emails ?? 0,
    })),
    webhookStats: {
      total: payload.webhookStats?.total ?? 0,
      success: payload.webhookStats?.success ?? 0,
      successRate: payload.webhookStats?.successRate ?? 0,
    },
  }
}

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState(30)
  const [data, setData] = useState<Overview | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/analytics/overview?days=${days}`)
      if (!res.ok) throw new Error('Failed')
      setData(normalizeOverview(await res.json()))
    } catch {
      toast.error('Failed to load analytics')
      setData(normalizeOverview({}))
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    load()
  }, [load])

  const blockDomain = async (domain: string) => {
    const res = await fetch('/api/admin/settings/blacklist/domains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain }),
    })
    if (res.ok) toast.success(`Blocked ${domain}`)
    else toast.error('Failed to block')
  }

  if (loading) return <div className="text-slate-500 dark:text-slate-400 py-20 text-center">Loading analytics...</div>

  if (!data) return <div className="text-red-400">Analytics unavailable</div>

  const peakHour = data.emails.peakHours.reduce((max, h) => (h.count > max.count ? h : max), { hour: 0, count: 0 })

  const userGrowth = data.users.growth.map((g) => ({
    ...g,
    label: new Date(g.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))

  const emailVolume = data.emails.volume.map((g) => ({
    ...g,
    label: new Date(g.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))

  const peakHours = data.emails.peakHours.map((h) => ({
    label: `${h.hour}:00`,
    count: h.count,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Platform growth, email volume, and delivery insights.</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border ${
                days === d ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border-cyan-500/30' : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Emails', value: data.emails.total },
          { label: 'Success Rate', value: `${data.webhookStats.successRate}%` },
          { label: 'Avg / User', value: data.emails.avgPerUser },
          { label: 'Avg / Day', value: data.emails.avgPerDay },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">User Growth</h2>
          <div className="h-72 min-h-72 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowth}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Area type="monotone" dataKey="count" stroke="#22d3ee" fill="#22d3ee33" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Email Volume</h2>
          <div className="h-72 min-h-72 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emailVolume}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Peak Hours</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Most emails received at {peakHour?.hour ?? 0}:00 ({peakHour?.count ?? 0} in last 7 days)
        </p>
        <div className="h-64 min-h-64 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={peakHours}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-6 overflow-x-auto">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Top Senders</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10">
                <th className="pb-3 text-left">Domain</th>
                <th className="pb-3 text-right">Count</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.topSenders.map((s) => (
                <tr key={s.domain} className="border-b border-slate-200 dark:border-white/5">
                  <td className="py-3 text-slate-900 dark:text-white">{s.domain}</td>
                  <td className="py-3 text-right text-cyan-600 dark:text-cyan-300">{s.count}</td>
                  <td className="py-3 text-right">
                    <button onClick={() => blockDomain(s.domain)} className="text-xs text-red-400 hover:underline">
                      Block
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-6 overflow-x-auto">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Top Users</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10">
                <th className="pb-3 text-left">User</th>
                <th className="pb-3 text-right">Emails</th>
              </tr>
            </thead>
            <tbody>
              {data.topUsers.map((u) => (
                <tr key={u.email} className="border-b border-slate-200 dark:border-white/5">
                  <td className="py-3">
                    <p className="text-slate-900 dark:text-white">{u.username}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </td>
                  <td className="py-3 text-right text-cyan-600 dark:text-cyan-300">{u.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


