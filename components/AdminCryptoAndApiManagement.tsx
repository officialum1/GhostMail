// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Check,
  Coins,
  ExternalLink,
  Key,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  X,
  Zap,
} from 'lucide-react'
import toast from 'react-hot-toast'

type CryptoConfig = {
  usdtTrc20Address: string
  usdtBep20Address: string
  binancePayId: string
  proPriceUsd: number
}

type CryptoOrder = {
  id: string
  userEmail: string
  network: string
  txId: string
  status: string
  createdAt: string
  approvedAt?: string
  apiKey?: string
}

type DeveloperKey = {
  id: string
  key: string
  prefix: string
  userEmail: string
  tier: string
  createdAt: string
  rateLimitPerMinute: number
}

export default function AdminCryptoAndApiManagement() {
  const [config, setConfig] = useState<CryptoConfig>({
    usdtTrc20Address: '',
    usdtBep20Address: '',
    binancePayId: '',
    proPriceUsd: 19,
  })
  const [orders, setOrders] = useState<CryptoOrder[]>([])
  const [keys, setKeys] = useState<DeveloperKey[]>([])
  const [loading, setLoading] = useState(true)
  const [savingConfig, setSavingConfig] = useState(false)

  // Manual key issuance state
  const [newKeyEmail, setNewKeyEmail] = useState('')
  const [newKeyTier, setNewKeyTier] = useState('PRO')
  const [issuingKey, setIssuingKey] = useState(false)

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [walletRes, ordersRes, keysRes] = await Promise.all([
        fetch('/api/admin/crypto-wallet'),
        fetch('/api/admin/crypto-orders'),
        fetch('/api/admin/developer-keys'),
      ])

      if (walletRes.ok) {
        const walletData = await walletRes.json()
        setConfig(walletData)
      }
      if (ordersRes.ok) {
        setOrders(await ordersRes.json())
      }
      if (keysRes.ok) {
        setKeys(await keysRes.json())
      }
    } catch (err) {
      console.error('Failed to load admin crypto data', err)
      toast.error('Failed to load crypto & API settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const saveWalletConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingConfig(true)
    try {
      const res = await fetch('/api/admin/crypto-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (!res.ok) throw new Error('Failed to save wallet configuration')
      toast.success('Crypto wallet settings updated successfully')
    } catch (err) {
      console.error(err)
      toast.error('Error saving wallet configuration')
    } finally {
      setSavingConfig(false)
    }
  }

  const approveOrder = async (orderId: string) => {
    try {
      const res = await fetch('/api/admin/crypto-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action: 'approve' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to approve order')
      toast.success(`Order approved! API Key issued: ${data.apiKey?.slice(0, 14)}...`)
      loadAll()
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Approval failed')
    }
  }

  const rejectOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to reject this crypto order?')) return
    try {
      const res = await fetch(`/api/admin/crypto-orders?orderId=${encodeURIComponent(orderId)}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to reject order')
      toast.success('Order marked as rejected')
      loadAll()
    } catch (err) {
      console.error(err)
      toast.error('Rejection failed')
    }
  }

  const handleIssueCustomKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKeyEmail.trim()) {
      toast.error('Please enter a user email')
      return
    }
    setIssuingKey(true)
    try {
      const res = await fetch('/api/admin/developer-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: newKeyEmail.trim(), tier: newKeyTier }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to issue key')
      toast.success(`Custom API key generated for ${newKeyEmail}!`)
      setNewKeyEmail('')
      loadAll()
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Failed to issue key')
    } finally {
      setIssuingKey(false)
    }
  }

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this developer key? All API requests using this key will immediately fail with 402.')) return
    try {
      const res = await fetch(`/api/admin/developer-keys?keyId=${encodeURIComponent(keyId)}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to revoke key')
      toast.success('Developer API key revoked')
      loadAll()
    } catch (err) {
      console.error(err)
      toast.error('Revoke failed')
    }
  }

  return (
    <div className="space-y-8 mt-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-cyan-500 shadow-md">
            <Coins className="h-5 w-5 text-slate-950 font-bold" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Crypto & Developer API Monetization</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Configure crypto wallets, verify TxID payments, and manage Developer Pro API keys</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/monetization"
            className="flex items-center gap-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 hover:bg-cyan-500/20 px-3 py-2 text-xs font-semibold transition"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Full Monetization Hub →
          </Link>
          <button
            onClick={loadAll}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* 1. Crypto Wallet Config */}
      <section className="border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 rounded-2xl backdrop-blur-xl shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500 dark:text-amber-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Crypto Wallet Receiving Addresses & Pricing</h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Users will send payments to these addresses during the web upgrade flow. Ensure these addresses are valid and under your control.
        </p>

        <form onSubmit={saveWalletConfig} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                USDT (TRC-20) Wallet Address
              </label>
              <input
                type="text"
                value={config.usdtTrc20Address}
                onChange={(e) => setConfig({ ...config, usdtTrc20Address: e.target.value })}
                placeholder="T..."
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/30 px-3.5 py-2.5 text-sm font-mono text-slate-900 dark:text-white outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                USDT (BEP-20 / BSC) Wallet Address
              </label>
              <input
                type="text"
                value={config.usdtBep20Address}
                onChange={(e) => setConfig({ ...config, usdtBep20Address: e.target.value })}
                placeholder="0x..."
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/30 px-3.5 py-2.5 text-sm font-mono text-slate-900 dark:text-white outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Binance Pay ID
              </label>
              <input
                type="text"
                value={config.binancePayId}
                onChange={(e) => setConfig({ ...config, binancePayId: e.target.value })}
                placeholder="e.g. 528391024"
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/30 px-3.5 py-2.5 text-sm font-mono text-slate-900 dark:text-white outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Developer Pro Monthly Price (USD)
              </label>
              <input
                type="number"
                min="1"
                value={config.proPriceUsd}
                onChange={(e) => setConfig({ ...config, proPriceUsd: Number(e.target.value) || 19 })}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/30 px-3.5 py-2.5 text-sm font-mono text-slate-900 dark:text-white outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingConfig}
              className="flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-5 py-2.5 text-sm font-bold text-slate-950 transition"
            >
              <Save className="h-4 w-4" />
              {savingConfig ? 'Saving...' : 'Save Wallet Config'}
            </button>
          </div>
        </form>
      </section>

      {/* 2. Crypto Upgrade Orders */}
      <section className="border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 rounded-2xl backdrop-blur-xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Crypto Upgrade Submissions ({orders.length})</h3>
          </div>
          <span className="text-xs text-slate-500">
            {orders.filter((o) => (o.status || '').toUpperCase() === 'PENDING').length} Pending Review
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-white/10 p-8 text-center text-slate-500 text-sm">
            No crypto upgrade requests submitted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-left text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="pb-3 font-semibold">User Email</th>
                  <th className="pb-3 font-semibold">Network</th>
                  <th className="pb-3 font-semibold">Transaction ID (TxID)</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Submitted At</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {orders.map((order) => {
                  const statusUpper = (order.status || '').toUpperCase()
                  const isPending = statusUpper === 'PENDING'
                  const isApproved = statusUpper === 'APPROVED'
                  const isRejected = statusUpper === 'REJECTED'

                  return (
                    <tr key={order.id} className="hover:bg-black/10 transition">
                      <td className="py-3.5 font-medium text-slate-900 dark:text-white">{order.userEmail}</td>
                      <td className="py-3.5 text-xs font-mono text-cyan-600 dark:text-cyan-400">{order.network}</td>
                      <td className="py-3.5 font-mono text-xs text-slate-600 dark:text-slate-300 max-w-[200px] truncate" title={order.txId}>
                        {order.txId}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            isApproved
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : isRejected
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-amber-500/20 text-amber-400 animate-pulse'
                          }`}
                        >
                          {statusUpper || 'PENDING'}
                        </span>
                      </td>
                      <td className="py-3.5 text-xs text-slate-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 text-right space-x-2">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => approveOrder(order.id)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-md transition"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Approve & Issue Key
                            </button>
                            <button
                              onClick={() => rejectOrder(order.id)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1.5 text-xs font-medium text-red-300 transition"
                            >
                              <X className="h-3.5 w-3.5" />
                              Reject
                            </button>
                          </div>
                        ) : isApproved ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                            <Check className="h-3.5 w-3.5" /> Approved & Key Active
                          </span>
                        ) : (
                          <span className="text-xs text-red-400 font-semibold">Rejected</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 3. Active Developer API Keys */}
      <section className="border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 rounded-2xl backdrop-blur-xl shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Active Developer API Keys ({keys.length})</h3>
          </div>
        </div>

        {/* Manual key issue form */}
        <form onSubmit={handleIssueCustomKey} className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-200/50 dark:bg-black/30 p-4">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Issue Custom Developer Key Manually
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              value={newKeyEmail}
              onChange={(e) => setNewKeyEmail(e.target.value)}
              placeholder="user@example.com or user@ghostmail.store"
              className="flex-1 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-black/40 px-3.5 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-cyan-400"
            />
            <select
              value={newKeyTier}
              onChange={(e) => setNewKeyTier(e.target.value)}
              className="rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white outline-none"
            >
              <option value="PRO">PRO Tier (120 req/min)</option>
              <option value="ENTERPRISE">ENTERPRISE Tier (300 req/min)</option>
            </select>
            <button
              type="submit"
              disabled={issuingKey}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 transition shrink-0"
            >
              <Plus className="h-4 w-4" />
              {issuingKey ? 'Issuing...' : 'Generate Key'}
            </button>
          </div>
        </form>

        {/* Keys table */}
        {keys.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-white/10 p-8 text-center text-slate-500 text-sm">
            No developer API keys issued yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-left text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="pb-3 font-semibold">User Email</th>
                  <th className="pb-3 font-semibold">API Key Prefix</th>
                  <th className="pb-3 font-semibold">Tier</th>
                  <th className="pb-3 font-semibold">Rate Limit</th>
                  <th className="pb-3 font-semibold">Created</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-black/10 transition">
                    <td className="py-3.5 font-medium text-slate-900 dark:text-white">{k.userEmail}</td>
                    <td className="py-3.5 font-mono text-xs text-cyan-600 dark:text-cyan-400">
                      {k.prefix || k.key?.slice(0, 16)}••••••••
                    </td>
                    <td className="py-3.5">
                      <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-xs font-bold text-cyan-300">
                        {k.tier}
                      </span>
                    </td>
                    <td className="py-3.5 text-xs text-slate-500 dark:text-slate-400">{k.rateLimitPerMinute} / min</td>
                    <td className="py-3.5 text-xs text-slate-500">{new Date(k.createdAt).toLocaleDateString()}</td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleRevokeKey(k.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1 text-xs font-medium text-red-400 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
