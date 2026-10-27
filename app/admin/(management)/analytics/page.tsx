// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

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
import {
  BarChart3,
  Mail,
  Zap,
  Users,
  TrendingUp,
  Clock,
  Server,
} from 'lucide-react'

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
      if (!res.ok) throw new Error('Failed to load')
      setData(normalizeOverview(await res.json()))
    } catch {
      toast.error('Failed to load telemetry analytics')
      setData(normalizeOverview({}))
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    load()
  }, [load])

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-3 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        <p className="text-xs uppercase tracking-wider font-semibold">Aggregating Stream Telemetry...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
        Telemetry unavailable.
      </div>
    )
  }

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
      {/* Top Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
              <BarChart3 className="h-3 w-3 text-cyan-400" />
              Stream Analytics
            </span>
            <span className="text-xs text-slate-400">Edge Ingestion & Traffic Distribution</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Telemetry & Analytics
          </h1>
          <p className="mt-1 text-xs lg:text-sm text-slate-500 dark:text-slate-400">
            Platform user acquisition velocity, inbound message volume, load distribution, and edge webhook health.
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/80 p-1 backdrop-blur shadow-sm self-start lg:self-auto">
          {[
            { id: 7, label: 'Past 7 Days' },
            { id: 30, label: 'Past 30 Days' },
            { id: 90, label: 'Past 90 Days' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDays(tab.id)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                days === tab.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Core Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 p-5 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Ingested
            </p>
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-2 text-cyan-400">
              <Mail className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
            {data.emails.total.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-400">All-time messages received</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 p-5 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Webhook Success
            </p>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-400">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-black tracking-tight text-emerald-500 dark:text-emerald-400 font-mono">
            {data.webhookStats.successRate}%
          </p>
          <p className="mt-1 text-xs text-slate-400">Cloudflare edge delivery rate</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 p-5 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Avg Mails / User
            </p>
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-2 text-purple-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-black tracking-tight text-purple-400 font-mono">
            {data.emails.avgPerUser}
          </p>
          <p className="mt-1 text-xs text-slate-400">Per registered mailbox</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 p-5 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Daily Velocity
            </p>
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2 text-blue-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-black tracking-tight text-blue-400 font-mono">
            {data.emails.avgPerDay}
          </p>
          <p className="mt-1 text-xs text-slate-400">Messages per 24 hours</p>
        </div>
      </div>

      {/* Main Charts Grid: User Growth & Email Volume */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* User Growth Area Chart */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 p-6 backdrop-blur shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                User Acquisition Growth
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">New registered account trend over {days} days</p>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
              +{data.users.today} today
            </span>
          </div>

          <div className="h-72 min-h-72 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowth}>
                <defs>
                  <linearGradient id="userGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: '#0c1017',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  }}
                  itemStyle={{ color: '#06b6d4', fontWeight: 'bold' }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Users"
                  stroke="#06b6d4"
                  fill="url(#userGrowthGradient)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Email Volume Bar Chart */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 p-6 backdrop-blur shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Daily Email Ingestion Volume
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Incoming message counts per calendar day</p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
              {data.emails.today} today
            </span>
          </div>

          <div className="h-72 min-h-72 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emailVolume}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: '#0c1017',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  }}
                  itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" name="Messages" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Peak Load Hours */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 p-6 backdrop-blur shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Clock className="h-4 w-4 text-purple-400" />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Hourly Peak Load Distribution (24-Hour Cycle)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Highest inbound frequency observed at{' '}
                <strong className="text-purple-400 font-mono">{peakHour?.hour ?? 0}:00 UTC</strong> ({peakHour?.count ?? 0} messages in window)
              </p>
            </div>
          </div>
        </div>

        <div className="h-64 min-h-64 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={peakHours}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: '#0c1017',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                }}
                itemStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
              />
              <Bar dataKey="count" name="Traffic" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Senders & Top Users Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Senders Card */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 p-6 backdrop-blur shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-cyan-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Top Inbound Senders
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">By volume</span>
          </div>

          <div className="space-y-2.5">
            {data.topSenders.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">No sender domains recorded yet.</p>
            ) : (
              data.topSenders.map((s) => (
                <div
                  key={s.domain}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] p-3 transition hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate">
                      @{s.domain}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">{s.count.toLocaleString()} messages ingested</p>
                  </div>
                  <button
                    onClick={() => blockDomain(s.domain)}
                    className="text-[11px] font-semibold text-rose-400 border border-rose-500/30 rounded-lg px-2.5 py-1 hover:bg-rose-500/10 transition"
                  >
                    Block Domain
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Accounts Card */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 p-6 backdrop-blur shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Highest Ingestion Accounts
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">User activity</span>
          </div>

          <div className="space-y-2.5">
            {data.topUsers.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">No member accounts registered yet.</p>
            ) : (
              data.topUsers.map((u, i) => (
                <div
                  key={u.email}
                  className="flex items-center gap-3 rounded-xl border border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] p-3 transition hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <span className="text-xs font-mono font-bold text-slate-400 w-5 text-center">
                    #{i + 1}
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-black text-white shadow-sm shrink-0">
                    {u.username[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {u.username}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono truncate">{u.email}</p>
                  </div>
                  <span className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-xs font-bold font-mono text-cyan-600 dark:text-cyan-300">
                    {u.count.toLocaleString()} mails
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
