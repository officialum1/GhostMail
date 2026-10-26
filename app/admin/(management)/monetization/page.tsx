// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Check,
  Coins,
  DollarSign,
  ExternalLink,
  Key,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
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
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
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

export default function AdminMonetizationPage() {
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
  const [searchQuery, setSearchQuery] = useState('')
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL')

  // Manual key issuance state
  const [newKeyEmail, setNewKeyEmail] = useState('')
  const [newKeyTier, setNewKeyTier] = useState('PRO')
  const [issuingKey, setIssuingKey] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [walletRes, ordersRes, keysRes] = await Promise.all([
        fetch('/api/admin/crypto-wallet'),
        fetch('/api/admin/crypto-orders'),
        fetch('/api/admin/developer-keys'),
      ])

      if (walletRes.ok) {
        setConfig(await walletRes.json())
      }
      if (ordersRes.ok) {
        setOrders(await ordersRes.json())
      }
      if (keysRes.ok) {
        setKeys(await keysRes.json())
      }
    } catch (err) {
      console.error('Failed to load monetization data', err)
      toast.error('Failed to load monetization data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

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
      toast.success('Wallet settings updated successfully')
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
      loadData()
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
      loadData()
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
      loadData()
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Failed to issue key')
    } finally {
      setIssuingKey(false)
    }
  }

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this developer key? All API requests using this key will immediately return 402.')) return
    try {
      const res = await fetch(`/api/admin/developer-keys?keyId=${encodeURIComponent(keyId)}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to revoke key')
      toast.success('Developer API key revoked')
      loadData()
    } catch (err) {
      console.error(err)
      toast.error('Revoke failed')
    }
  }

  const getExplorerLink = (txId: string, network: string) => {
    if (network === 'USDT_TRC20') return `https://tronscan.org/#/transaction/${txId}`
    if (network === 'USDT_BEP20') return `https://bscscan.com/tx/${txId}`
    return null
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesFilter = orderFilter === 'ALL' || order.status === orderFilter
      const matchesSearch =
        searchQuery === '' ||
        order.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.txId.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [orders, orderFilter, searchQuery])

  const stats = useMemo(() => {
    const approvedCount = orders.filter((o) => o.status === 'APPROVED').length
    const pendingCount = orders.filter((o) => o.status === 'PENDING').length
    const totalRevenue = approvedCount * (config.proPriceUsd || 19)
    return {
      totalRevenue,
      approvedCount,
      pendingCount,
      activeKeysCount: keys.length,
    }
  }, [orders, keys, config.proPriceUsd])

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-cyan-500 shadow-lg shadow-amber-500/20">
              <Coins className="h-6 w-6 text-slate-950 font-bold" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Crypto & API Monetization Hub</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage cryptocurrency wallets, approve blockchain TxID submissions, and govern Developer Pro API keys
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 shadow-sm transition"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-cyan-500' : ''}`} />
          Refresh Hub
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 p-5 backdrop-blur shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Crypto Revenue</span>
            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-500">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">${stats.totalRevenue}</p>
          <p className="mt-1 text-xs text-slate-500">{stats.approvedCount} approved subscriptions</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 p-5 backdrop-blur shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pending Review</span>
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-500">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.pendingCount}</p>
            {stats.pendingCount > 0 && (
              <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 animate-pulse">
                ACTION REQUIRED
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">Awaiting TxID validation</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 p-5 backdrop-blur shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active API Keys</span>
            <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-500">
              <Key className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">{stats.activeKeysCount}</p>
          <p className="mt-1 text-xs text-slate-500">Developers with live API access</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 p-5 backdrop-blur shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pro Plan Pricing</span>
            <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-500">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">${config.proPriceUsd}<span className="text-sm font-normal text-slate-500"> /mo</span></p>
          <p className="mt-1 text-xs text-slate-500">USDT / Binance Pay checkout</p>
        </div>
      </div>

      {/* Receiving Wallets Configuration Card */}
      <section className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 p-6 md:p-8 backdrop-blur shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Crypto Receiving Wallets & Checkout Configuration</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Users will send upgrade payments to these wallets during checkout</p>
          </div>
        </div>

        <form onSubmit={saveWalletConfig} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                USDT (TRC-20) Receiving Address
              </label>
              <input
                type="text"
                value={config.usdtTrc20Address}
                onChange={(e) => setConfig({ ...config, usdtTrc20Address: e.target.value })}
                placeholder="T..."
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 px-3.5 py-2.5 text-sm font-mono text-slate-900 dark:text-white outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                USDT (BEP-20 / BSC) Receiving Address
              </label>
              <input
                type="text"
                value={config.usdtBep20Address}
                onChange={(e) => setConfig({ ...config, usdtBep20Address: e.target.value })}
                placeholder="0x..."
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 px-3.5 py-2.5 text-sm font-mono text-slate-900 dark:text-white outline-none focus:border-cyan-400"
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
                placeholder="e.g. 849201948"
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 px-3.5 py-2.5 text-sm font-mono text-slate-900 dark:text-white outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Pro Monthly Subscription Price ($USD)
              </label>
              <input
                type="number"
                min="1"
                value={config.proPriceUsd}
                onChange={(e) => setConfig({ ...config, proPriceUsd: Number(e.target.value) || 19 })}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 px-3.5 py-2.5 text-sm font-mono text-slate-900 dark:text-white outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingConfig}
              className="flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-md transition"
            >
              <Save className="h-4 w-4" />
              {savingConfig ? 'Saving Settings...' : 'Save Wallet Configuration'}
            </button>
          </div>
        </form>
      </section>

      {/* Orders Table Section */}
      <section className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 p-6 md:p-8 backdrop-blur shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Crypto Upgrade Orders ({filteredOrders.length})
            </h2>
          </div>

          {/* Filter & Search Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/30 p-1">
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setOrderFilter(filter)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold uppercase tracking-wider transition ${
                    orderFilter === filter
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/30 px-3 py-1.5">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search email or TxID..."
                className="bg-transparent text-xs text-slate-900 dark:text-white outline-none w-44"
              />
            </div>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/10 p-10 text-center text-slate-500 text-sm">
            No crypto upgrade orders matching the current filter.
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
                  <th className="pb-3 font-semibold">Submitted</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {filteredOrders.map((order) => {
                  const explorerUrl = getExplorerLink(order.txId, order.network)
                  return (
                    <tr key={order.id} className="hover:bg-black/5 dark:hover:bg-white/[0.02] transition">
                      <td className="py-3.5 font-medium text-slate-900 dark:text-white">{order.userEmail}</td>
                      <td className="py-3.5 font-mono text-xs text-cyan-600 dark:text-cyan-400">{order.network}</td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2 font-mono text-xs text-slate-600 dark:text-slate-300">
                          <span className="max-w-[180px] truncate" title={order.txId}>
                            {order.txId}
                          </span>
                          {explorerUrl && (
                            <a
                              href={explorerUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-cyan-400 hover:text-cyan-300 transition"
                              title="Inspect on Blockchain Explorer"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            order.status === 'APPROVED'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : order.status === 'REJECTED'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-amber-500/20 text-amber-400 animate-pulse'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-xs text-slate-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 text-right space-x-2">
                        {order.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => approveOrder(order.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-3 py-1.5 text-xs font-bold text-slate-950 transition"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Approve & Issue Key
                            </button>
                            <button
                              onClick={() => rejectOrder(order.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1.5 text-xs font-medium text-red-400 transition"
                            >
                              <X className="h-3.5 w-3.5" />
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-slate-500">Completed</span>
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

      {/* Developer API Keys Section */}
      <section className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 p-6 md:p-8 backdrop-blur shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Key className="h-5 w-5 text-cyan-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Developer API Keys ({keys.length})</h2>
          </div>
        </div>

        {/* Manual Key Issuance Form */}
        <form onSubmit={handleIssueCustomKey} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/30 p-4">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Issue Manual Developer Key
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
              {issuingKey ? 'Issuing...' : 'Generate Live Key'}
            </button>
          </div>
        </form>

        {keys.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/10 p-8 text-center text-slate-500 text-sm">
            No active developer API keys issued.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-left text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="pb-3 font-semibold">User Email</th>
                  <th className="pb-3 font-semibold">Key Token</th>
                  <th className="pb-3 font-semibold">Tier</th>
                  <th className="pb-3 font-semibold">Rate Limit</th>
                  <th className="pb-3 font-semibold">Issued Date</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-black/5 dark:hover:bg-white/[0.02] transition">
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
