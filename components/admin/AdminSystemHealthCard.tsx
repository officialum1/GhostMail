// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Activity,
  CheckCircle2,
  Clock,
  Database,
  RefreshCw,
  Send,
  ShieldAlert,
  Zap,
} from 'lucide-react'
import toast from 'react-hot-toast'

type HealthData = {
  status: 'operational' | 'degraded' | 'error'
  timestamp: string
  uptimeSeconds: number
  database: {
    status: string
    latencyMs: number
    provider: string
  }
  counts: {
    users: number
    emails: number
    webhookLogs: number
    cryptoOrders: number
    pendingOrders: number
    developerKeys: number
  }
  runtime: {
    nodeVersion: string
    memoryRssMb: number
    memoryHeapUsedMb: number
  }
  webhook: {
    isSecretConfigured: boolean
  }
}

export default function AdminSystemHealthCard() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [targetEmail, setTargetEmail] = useState('admin@ghostmail.store')
  const [testType, setTestType] = useState<'otp' | 'general'>('otp')
  const [sendingProbe, setSendingProbe] = useState(false)
  const [probeResult, setProbeResult] = useState<{
    probeId: string
    latencyMs: number
    otp: string
    targetEmail: string
  } | null>(null)

  const fetchHealth = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/system/health')
      if (res.ok) {
        setHealth(await res.json())
      }
    } catch (err) {
      console.error('Failed to fetch health data', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHealth()
  }, [fetchHealth])

  const sendSyntheticProbe = async (e: React.FormEvent) => {
    e.preventDefault()
    setSendingProbe(true)
    setProbeResult(null)
    try {
      const res = await fetch('/api/admin/system/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetEmail, testType }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed probe delivery')
      setProbeResult({
        probeId: data.probeId,
        latencyMs: data.latencyMs,
        otp: data.otp,
        targetEmail: data.targetEmail,
      })
      toast.success(`Synthetic email delivered in ${data.latencyMs}ms!`)
      fetchHealth()
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Delivery probe failed')
    } finally {
      setSendingProbe(false)
    }
  }

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return `${hrs}h ${mins}m`
  }

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 p-6 backdrop-blur shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              System Ingestion Pipeline & Health Monitor
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live diagnostics, database latency, and synthetic inbound webhook probe
            </p>
          </div>
        </div>

        <button
          onClick={fetchHealth}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Check Health
        </button>
      </div>

      {/* Diagnostics Status Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/20 p-3.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Database Ping</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <Database className="h-4 w-4 text-emerald-500" />
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {health?.database.latencyMs ?? '--'}ms
            </span>
          </div>
          <span className="text-[10px] text-emerald-500 font-medium">PostgreSQL Live</span>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/20 p-3.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Webhook Auth</span>
          <div className="mt-1 flex items-center gap-1.5">
            {health?.webhook.isSecretConfigured ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-bold text-emerald-500">Configured</span>
              </>
            ) : (
              <>
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-bold text-amber-500">Unset</span>
              </>
            )}
          </div>
          <span className="text-[10px] text-slate-500">Inbound Protection</span>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/20 p-3.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Process Memory</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {health?.runtime.memoryHeapUsedMb ?? '--'}
            </span>
            <span className="text-xs text-slate-500">MB heap</span>
          </div>
          <span className="text-[10px] text-slate-500">Node {health?.runtime.nodeVersion}</span>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/20 p-3.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">System Uptime</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <Clock className="h-4 w-4 text-cyan-500" />
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {health ? formatUptime(health.uptimeSeconds) : '--'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500">Continuous Service</span>
        </div>
      </div>

      {/* Synthetic Delivery Probe Tool */}
      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 via-slate-900 to-slate-900 p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-4 w-4 text-cyan-400" />
          <h4 className="text-sm font-bold text-white">Synthetic Inbound Delivery Probe</h4>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed mb-4">
          Test your mail ingestion and SSE real-time broadcast pipelines. This generates a synthetic delivery probe to benchmark end-to-end latency.
        </p>

        <form onSubmit={sendSyntheticProbe} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="email"
            required
            value={targetEmail}
            onChange={(e) => setTargetEmail(e.target.value)}
            placeholder="target@ghostmail.store"
            className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs font-mono text-cyan-300 outline-none focus:border-cyan-400"
          />
          <select
            value={testType}
            onChange={(e) => setTestType(e.target.value as 'otp' | 'general')}
            className="rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-xs text-white outline-none"
          >
            <option value="otp">OTP Verification Code Probe</option>
            <option value="general">Standard Email Probe</option>
          </select>
          <button
            type="submit"
            disabled={sendingProbe}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 px-4 py-2 text-xs font-bold text-slate-950 transition shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
            {sendingProbe ? 'Sending Probe...' : 'Send Test Probe'}
          </button>
        </form>

        {probeResult && (
          <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 font-mono text-xs text-emerald-300 flex flex-wrap items-center justify-between gap-2">
            <span>
              ✅ Probe Delivered in <strong>{probeResult.latencyMs}ms</strong> to {probeResult.targetEmail}
            </span>
            <span className="rounded bg-black/40 px-2 py-0.5 text-[11px] text-white">
              Generated OTP: <strong>{probeResult.otp}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
