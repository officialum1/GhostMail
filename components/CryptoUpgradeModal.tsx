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
    if (!txId.trim()) {
      toast.error('Please enter the Transaction Hash (TxID)')
      return
    }
    if (!email.trim()) {
      toast.error('Please enter your GhostMail email address')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/upgrade/crypto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: email.trim(),
          network,
          txId: txId.trim(),
          amount: config?.proPriceUsd || 19,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit order')

      setSubmitted(true)
      toast.success('Upgrade order submitted! Verification in progress.')
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0c1017] shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 p-5 bg-slate-50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Sparkles className="h-4.5 w-4.5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Upgrade to Developer Pro</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Unlock REST API & Automated OTP Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
              <Clock className="h-7 w-7 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Payment Submitted!</h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                We received your submission for <strong className="text-cyan-600 dark:text-cyan-400">{email}</strong>. Once confirmed on the blockchain, your account will be upgraded to Pro automatically.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/40 p-3 text-xs text-slate-600 dark:text-slate-400 font-mono break-all text-left">
              TxID: {txId}
            </div>
            <button
              onClick={onClose}
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 px-6 py-2.5 text-xs font-bold text-slate-950 transition"
            >
              Done / Return to Dashboard
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
            {/* Price Chip */}
            <div className="flex items-center justify-between rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3.5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Developer Pro Subscription</span>
                <p className="text-xl font-black text-slate-900 dark:text-white font-mono">
                  ${config?.proPriceUsd || 19} <span className="text-xs font-normal text-slate-500">/ month</span>
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> Instant On-Chain Verification
              </span>
            </div>

            {/* Network Selector Tabs */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Select Crypto Network
              </label>
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
                    className={`rounded-xl border py-2 px-2.5 text-xs font-bold transition ${
                      network === item.id
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shadow-sm'
                        : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* QR Code & Address Display */}
            <div className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-black/30 p-4 flex flex-col sm:flex-row items-center gap-4">
              {qrDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={qrDataUrl}
                  alt="Payment QR Code"
                  className="w-24 h-24 rounded-lg border border-slate-200 dark:border-white/10 bg-white p-1 shrink-0"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center text-slate-400 shrink-0">
                  <QrCode className="h-6 w-6" />
                </div>
              )}

              <div className="min-w-0 flex-1 space-y-1.5 text-center sm:text-left">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Send exactly ${config?.proPriceUsd || 19} USDT to:
                </p>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 p-2">
                  <span className="min-w-0 flex-1 truncate font-mono text-xs text-slate-900 dark:text-white">
                    {activeAddress || 'Loading address...'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1 text-cyan-600 dark:text-cyan-400 hover:opacity-80 shrink-0"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleSubmit} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Your Account Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@ghostmail.store"
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Transaction Hash / Order TxID
                </label>
                <input
                  type="text"
                  required
                  value={txId}
                  onChange={(e) => setTxId(e.target.value)}
                  placeholder="Paste blockchain TxID or Binance Pay Order ID"
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-cyan-500 hover:bg-cyan-400 py-2.5 text-xs font-bold text-slate-950 shadow-md transition"
                >
                  {loading ? 'Submitting...' : 'Confirm Payment & Issue Pro Key'}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
