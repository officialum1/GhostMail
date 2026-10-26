// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

'use client'

import { useEffect, useState } from 'react'
import { Check, Copy, QrCode, Sparkles, X, ArrowRight, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import QRCode from 'qrcode'

type CryptoConfig = {
  usdtTrc20Address: string
  usdtBep20Address: string
  binancePayId: string
  proPriceUsd: number
}

type CryptoUpgradeModalProps = {
  isOpen: boolean
  onClose: () => void
  userEmail?: string
}

export default function CryptoUpgradeModal({ isOpen, onClose, userEmail = '' }: CryptoUpgradeModalProps) {
  const [config, setConfig] = useState<CryptoConfig | null>(null)
  const [network, setNetwork] = useState<'USDT_TRC20' | 'USDT_BEP20' | 'BINANCE_PAY'>('USDT_TRC20')
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [email, setEmail] = useState(userEmail)
  const [txId, setTxId] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setSubmitted(false)
      setTxId('')
      return
    }

    if (userEmail) setEmail(userEmail)

    fetch('/api/upgrade/crypto')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.usdtTrc20Address) {
          setConfig(data)
        }
      })
      .catch((err) => console.error('Failed to load crypto config', err))
  }, [isOpen, userEmail])

  const activeAddress =
    network === 'USDT_TRC20'
      ? config?.usdtTrc20Address || ''
      : network === 'USDT_BEP20'
        ? config?.usdtBep20Address || ''
        : config?.binancePayId || ''

  useEffect(() => {
    if (!activeAddress) return
    QRCode.toDataURL(activeAddress, { margin: 2, width: 220 })
      .then((url) => setQrDataUrl(url))
      .catch(() => {})
  }, [activeAddress])

  if (!isOpen) return null

  const handleCopy = () => {
    if (!activeAddress) return
    navigator.clipboard.writeText(activeAddress)
    setCopied(true)
    toast.success('Address copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid account email')
      return
    }
    if (!txId || txId.trim().length < 8) {
      toast.error('Please enter a valid Transaction Hash (TxID) or Binance Pay ID')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/upgrade/crypto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: email,
          network,
          txId,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')

      setSubmitted(true)
      toast.success('Payment submitted for verification!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1322] shadow-[0_32px_120px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950 font-bold">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upgrade to Developer Pro</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Unlock Full REST API, Automated Inboxes & Instant OTP Extraction</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 dark:border-white/10 p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Clock className="h-8 w-8 animate-pulse" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Payment Submitted!</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                We have received your verification request for <strong className="text-cyan-600 dark:text-cyan-400">{email}</strong>. Once confirmed on the blockchain, your account will be activated with Developer Pro access and your API key will appear in your dashboard.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4 text-xs text-slate-500 text-left font-mono">
              TxID: {txId}
            </div>
            <button
              onClick={onClose}
              className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 font-semibold text-slate-950 hover:opacity-90 transition"
            >
              Done / Return to Dashboard
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Price Badge */}
            <div className="flex items-center justify-between rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4">
              <div>
                <span className="text-xs uppercase font-semibold text-cyan-600 dark:text-cyan-400">Developer Pro Plan</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white">${config?.proPriceUsd || 19} <span className="text-xs font-normal text-slate-500">/ month</span></p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold"><Check className="h-4 w-4" /> Instant On-Chain Processing</span>
                <p>USDT or Binance Pay</p>
              </div>
            </div>

            {/* Network Selector Tabs */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Select Crypto Payment Network</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'USDT_TRC20', label: 'USDT (TRC-20)' },
                  { id: 'USDT_BEP20', label: 'USDT (BEP-20)' },
                  { id: 'BINANCE_PAY', label: 'Binance Pay ID' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setNetwork(item.id as typeof network)}
                    className={`rounded-xl border py-2.5 px-3 text-xs font-semibold transition ${
                      network === item.id
                        ? 'border-cyan-400 bg-cyan-400/10 text-cyan-600 dark:text-cyan-400 shadow-sm'
                        : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* QR Code & Address Display */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-5 flex flex-col sm:flex-row items-center gap-5">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Payment QR"
                  className="w-28 h-28 rounded-xl border border-slate-200 dark:border-white/10 bg-white p-1 shrink-0 shadow-sm"
                />
              ) : (
                <div className="w-28 h-28 rounded-xl border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center text-slate-400 shrink-0">
                  <QrCode className="h-8 w-8" />
                </div>
              )}
              <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Send exactly <strong className="text-slate-900 dark:text-white">${config?.proPriceUsd || 19} USDT</strong> to:
                </p>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/30 p-2.5">
                  <span className="min-w-0 flex-1 truncate font-mono text-xs text-slate-900 dark:text-white">
                    {activeAddress || 'Loading...'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="shrink-0 rounded-lg p-1.5 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-white/10"
                    title="Copy Address"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  {network === 'USDT_TRC20' && 'Requires TRON network. Do NOT send via other chains.'}
                  {network === 'USDT_BEP20' && 'Requires BNB Smart Chain (BEP20).'}
                  {network === 'BINANCE_PAY' && 'Send via Binance App > Pay > Send to Pay ID.'}
                </p>
              </div>
            </div>

            {/* Proof of Transfer Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your GhostMail Account Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@ghostmail.store"
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Transaction Hash (TxID) or Binance Pay Order Reference
                </label>
                <input
                  type="text"
                  value={txId}
                  onChange={(e) => setTxId(e.target.value)}
                  placeholder="Paste transaction hash / TxID after sending..."
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 px-4 py-2.5 text-sm font-mono text-slate-900 dark:text-white outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3 font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? 'Submitting Verification...' : 'Submit Payment Verification'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
