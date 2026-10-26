// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import toast, { Toaster } from 'react-hot-toast'
import {
  Activity,
  Check,
  ChevronLeft,
  Copy,
  Download,
  Inbox,
  LogOut,
  Mail,
  Menu,
  PenSquare,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Star,
  Trash2,
  X,
  Key,
  Sparkles,
  KeyRound,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react'
import CryptoUpgradeModal from '@/components/CryptoUpgradeModal'
import DashboardApiKeys from '@/components/DashboardApiKeys'

type EmailItem = {
  id: number
  toAddress: string
  fromAddress: string
  subject: string
  bodyText: string
  receivedAt: string
  isRead: boolean
  sent: boolean
  starred?: boolean
}

type FullEmail = EmailItem & {
  bodyHtml: string | null
  rawHeaders: string | null
}

type MailboxKey = 'inbox' | 'sent' | 'starred' | 'trash' | 'api'

const senderColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899']

function formatMailboxTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hour = 1000 * 60 * 60
  const day = hour * 24

  if (diff < hour) {
    const mins = Math.max(1, Math.floor(diff / (1000 * 60)))
    return `${mins}m ago`
  }
  if (diff < day) {
    const hours = Math.max(1, Math.floor(diff / hour))
    return `${hours}h ago`
  }
  if (diff < day * 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function senderAvatarColor(email: string) {
  const index = (email || '').charCodeAt(0) % senderColors.length
  return senderColors[index]
}

function extractPreview(email: EmailItem) {
  return (email.bodyText || '').replace(/\s+/g, ' ').trim().slice(0, 80)
}

function detectOtpFromText(text: string): string | null {
  if (!text) return null
  const keywordMatch = text.match(/(?:code|otp|verification|pin|password|security\s+code)[^\d\w]{1,10}(\d{4,8})\b/i)
  if (keywordMatch) return keywordMatch[1]
  const standalone = text.match(/\b\d{6}\b/) || text.match(/\b\d{4,8}\b/)
  return standalone ? standalone[0] : null
}

function playNotificationChime() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12)
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.25)
  } catch {
    /* AudioContext requires user interaction first */
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [emails, setEmails] = useState<EmailItem[]>([])
  const [selectedEmail, setSelectedEmail] = useState<FullEmail | null>(null)
  const [loading, setLoading] = useState(true)
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [refreshCountdown, setRefreshCountdown] = useState(20)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [search, setSearch] = useState('')
  const [mailbox, setMailbox] = useState<MailboxKey>('inbox')
  const [starredIds, setStarredIds] = useState<number[]>([])
  const [deletedEmails, setDeletedEmails] = useState<EmailItem[]>([])
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [composeTo, setComposeTo] = useState('')
  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody, setComposeBody] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [apiKeyData, setApiKeyData] = useState<{
    isPro: boolean
    apiKey: string | null
    status: string
    pendingOrder?: {
      txId: string
      network: string
      createdAt: string
    } | null
  } | null>(null)
  const [showCryptoModal, setShowCryptoModal] = useState(false)
  const previousEmailsRef = useRef<EmailItem[]>([])

  const fetchApiKey = useCallback(async () => {
    try {
      const res = await fetch('/api/user/api-key')
      if (res.ok) {
        const data = await res.json()
        setApiKeyData(data)
      }
    } catch (err) {
      console.error('Failed to fetch api key data', err)
    }
  }, [])

  const fetchInbox = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true)
    setIsRefreshing(true)
    try {
      const res = await fetch('/api/email/inbox')
      if (!res.ok) throw new Error('Failed to fetch inbox')
      const data: EmailItem[] = await res.json()

      const previous = previousEmailsRef.current
      if (previous.length > 0 && data.length > previous.length) {
        const newItems = data.filter((item) => !previous.some((prev) => prev.id === item.id))
        if (newItems[0]) {
          if (soundEnabled) playNotificationChime()
          toast.success(`New email from ${newItems[0].fromAddress}`, {
            icon: '📩',
          })
        }
      }

      previousEmailsRef.current = data
      setEmails(data)
    } catch (error) {
      console.error('Failed to fetch inbox', error)
      toast.error('Failed to refresh inbox')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
      setRefreshCountdown(20)
    }
  }, [soundEnabled])

  const deleteEmail = useCallback(async (id: number) => {
    const existing = emails.find((email) => email.id === id)
    try {
      const res = await fetch(`/api/email/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      if (existing) {
        setDeletedEmails((current) => [existing, ...current.filter((item) => item.id !== existing.id)])
      }
      setEmails((current) => current.filter((email) => email.id !== id))
      setSelectedEmail((current) => (current?.id === id ? null : current))
      toast.success('Email deleted')
    } catch (error) {
      console.error('Delete failed', error)
      toast.error('Failed to delete email')
    }
  }, [emails])

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/login'
      return
    }

    if (status !== 'authenticated') return

    fetchInbox(true)
    fetchApiKey()
    const interval = window.setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          fetchInbox()
          return 20
        }
        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [fetchInbox, fetchApiKey, status])

  useEffect(() => {
    if (status !== 'authenticated') return

    let eventSource: EventSource | null = null
    let retryTimer: ReturnType<typeof setTimeout> | null = null

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/email/stream')
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data?.type === 'new_email') {
              fetchInbox()
            }
          } catch {
            /* Heartbeats ignored */
          }
        }
        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close()
            eventSource = null
          }
          retryTimer = setTimeout(connectSSE, 5000)
        }
      } catch (e) {
        console.error('SSE connection error:', e)
      }
    }

    connectSSE()

    return () => {
      if (eventSource) eventSource.close()
      if (retryTimer) clearTimeout(retryTimer)
    }
  }, [fetchInbox, status])

  const filteredEmails = useMemo(() => {
    const query = search.trim().toLowerCase()
    const pool =
      mailbox === 'trash'
        ? deletedEmails
        : mailbox === 'sent'
          ? emails.filter((email) => email.sent)
          : mailbox === 'starred'
            ? emails.filter((email) => starredIds.includes(email.id))
            : emails.filter((email) => !email.sent)

    if (!query) return pool

    return pool.filter((email) =>
      [email.fromAddress, email.toAddress, email.subject, email.bodyText]
        .join(' ')
        .toLowerCase()
        .includes(query)
    )
  }, [deletedEmails, emails, mailbox, search, starredIds])

  const unreadCount = emails.filter((email) => !email.sent && !email.isRead).length
  const sentCount = emails.filter((email) => email.sent).length
  const starredCount = emails.filter((email) => starredIds.includes(email.id)).length
  const trashCount = deletedEmails.length

  const copyEmail = () => {
    if (session?.user?.email) {
      navigator.clipboard.writeText(session.user.email)
      setCopied(true)
      toast.success('Email copied to clipboard!')
      window.setTimeout(() => setCopied(false), 2000)
    }
  }

  const copyOtpCode = (otp: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    navigator.clipboard.writeText(otp)
    toast.success(`OTP ${otp} copied!`)
  }

  const openEmail = async (id: number) => {
    try {
      const res = await fetch(`/api/email/${id}`)
      if (!res.ok) throw new Error('Failed to fetch message')
      const data: FullEmail = await res.json()
      setSelectedEmail(data)
      setEmails((current) => current.map((email) => (email.id === id ? { ...email, isRead: true } : email)))
    } catch (error) {
      console.error('Failed to fetch email details', error)
      toast.error('Failed to load email')
    }
  }

  const toggleStar = useCallback((email: FullEmail | EmailItem | null) => {
    if (!email) return
    const isStarred = starredIds.includes(email.id)
    setStarredIds((current) =>
      current.includes(email.id) ? current.filter((id) => id !== email.id) : [...current, email.id]
    )
    setEmails((current) =>
      current.map((item) => (item.id === email.id ? { ...item, starred: !isStarred } : item))
    )
    setSelectedEmail((current) =>
      current && current.id === email.id ? { ...current, starred: !isStarred } : current
    )
    toast.success(isStarred ? 'Email unstarred' : 'Email starred')
  }, [starredIds])

  const downloadEmail = useCallback((email: FullEmail | null) => {
    if (!email) return
    const content = `From: ${email.fromAddress}\nTo: ${email.toAddress}\nSubject: ${email.subject}\nDate: ${new Date(email.receivedAt).toLocaleString()}\n\n${email.bodyText || 'No plain text content'}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${(email.subject || 'email').replace(/[\\/:*?"<>|]/g, '_')}.txt`
    anchor.click()
    URL.revokeObjectURL(url)
    toast.success('Email downloaded')
  }, [])

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSending(true)
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: composeTo, subject: composeSubject, body: composeBody }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to send email')
      toast.success('Email sent successfully')
      setIsComposeOpen(false)
      setComposeTo('')
      setComposeSubject('')
      setComposeBody('')
      fetchInbox()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Failed to send email')
    } finally {
      setIsSending(false)
    }
  }

  const selectedEmailStarred =
    selectedEmail ? starredIds.includes(selectedEmail.id) : false

  const detectedSelectedOtp = useMemo(() => {
    if (!selectedEmail) return null
    return detectOtpFromText(selectedEmail.bodyText || '')
  }, [selectedEmail])

  const otpEmailsList = useMemo(() => {
    return emails
      .map((em) => ({
        ...em,
        detectedOtp: detectOtpFromText(em.bodyText || ''),
      }))
      .filter((em) => Boolean(em.detectedOtp))
  }, [emails])

  const totalOtpCount = otpEmailsList.length

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-white">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      </div>
    )
  }

  if (status === 'unauthenticated') return null

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 font-sans">
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#0c1017', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.08)' } }} />

      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* 1. Left Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-[#0c1017]/95 backdrop-blur-xl transition-transform md:static md:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-slate-200/60 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-sm shadow-cyan-500/20">
              <Mail className="h-4.5 w-4.5 text-slate-950 font-bold" />
            </span>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">GhostMail</h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Private Mailbox Hub</p>
            </div>
          </div>

          <button
            onClick={() => setIsComposeOpen(true)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 transition-all hover:scale-[1.01]"
          >
            <PenSquare className="h-3.5 w-3.5" />
            Compose Message
          </button>
        </div>

        {/* Mailbox Nav Folders */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { key: 'inbox' as const, icon: Inbox, count: unreadCount },
            { key: 'sent' as const, icon: Send, count: sentCount },
            { key: 'starred' as const, icon: Star, count: starredCount },
            { key: 'trash' as const, icon: Trash2, count: trashCount },
            { key: 'api' as const, icon: Key, count: apiKeyData?.isPro ? 'PRO' : 'FREE' },
          ].map((item) => {
            const Icon = item.icon
            const active = mailbox === item.key
            return (
              <button
                key={item.key}
                onClick={() => {
                  setMailbox(item.key)
                  setSelectedEmail(null)
                  setIsMobileSidebarOpen(false)
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                  active
                    ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left capitalize">{item.key === 'api' ? 'Developer API' : item.key}</span>
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-mono font-bold ${
                    item.key === 'api'
                      ? apiKeyData?.isPro
                        ? 'bg-emerald-500/20 text-emerald-500'
                        : 'bg-cyan-500/10 text-cyan-500'
                      : 'bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {item.count}
                </span>
              </button>
            )
          })}

          {!apiKeyData?.isPro && (
            <div className="mt-6 rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/30 to-black/40 p-3">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Developer Pro</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400 leading-tight">
                Automate OTP retrieval via REST API.
              </p>
              <button
                type="button"
                onClick={() => setShowCryptoModal(true)}
                className="mt-2.5 w-full rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-[11px] font-bold text-cyan-300 py-1.5 transition text-center"
              >
                Upgrade ($19) →
              </button>
            </div>
          )}
        </nav>

        {/* User Account Bar */}
        <div className="border-t border-slate-200/60 dark:border-white/5 p-3">
          <div className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-black/30 p-2.5 flex items-center justify-between">
            <div className="min-w-0 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold text-xs">
                {session?.user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{session?.user?.name || 'User'}</p>
                <p className="truncate text-[10px] font-mono text-cyan-600 dark:text-cyan-400">{session?.user?.email}</p>
              </div>
            </div>
            <button
              onClick={copyEmail}
              className="p-1 text-slate-400 hover:text-cyan-500 transition"
              title="Copy email address"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-red-500 hover:bg-red-500/10 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* 2. Main Mailbox Workspace */}
      <main className="flex min-w-0 flex-1 flex-col pb-16 md:pb-0">
        {/* Top Control Bar */}
        <header className="border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#07090e]/80 px-4 py-3 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
            <button
              className="rounded-xl border border-slate-200 dark:border-white/10 p-2 text-slate-600 dark:text-slate-300 md:hidden"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Search Input */}
            <div className="flex flex-1 max-w-md items-center gap-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-100/50 dark:bg-[#0c1017] px-3 py-1.5">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search messages..."
                className="w-full bg-transparent text-xs text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Right Status Actions */}
          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={() => {
                setSoundEnabled((v) => !v)
                toast.success(soundEnabled ? 'Chime muted' : 'Chime enabled')
              }}
              className="rounded-xl border border-slate-200/80 dark:border-white/10 p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
              title={soundEnabled ? 'Mute incoming mail sound' : 'Enable incoming mail sound'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4 text-cyan-500" /> : <VolumeX className="h-4 w-4" />}
            </button>

            {/* Manual Refresh & Circular Progress */}
            <button
              onClick={() => fetchInbox()}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-100/60 dark:bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition"
              title="Refresh inbox"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-cyan-500' : ''}`} />
              <span className="hidden sm:inline font-mono">{refreshCountdown}s</span>
            </button>

            {/* Address quick copy chip */}
            <button
              onClick={copyEmail}
              className="hidden lg:inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 transition hover:bg-cyan-500/20"
            >
              <span>{session?.user?.email}</span>
              {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>
        </header>

        {mailbox === 'api' ? (
          <DashboardApiKeys
            apiKeyData={apiKeyData}
            onOpenUpgrade={() => setShowCryptoModal(true)}
            onRefresh={fetchApiKey}
            userEmail={session?.user?.email || ''}
          />
        ) : (
          <div className="flex min-h-0 flex-1">
            {/* Email List Column */}
            <section
              className={`${
                selectedEmail ? 'hidden md:flex' : 'flex'
              } w-full flex-col border-r border-slate-200/80 dark:border-white/10 bg-white/50 dark:bg-[#07090e] md:w-[360px] lg:w-[400px]`}
            >
              {loading ? (
                <div className="space-y-3 p-4">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <div key={idx} className="animate-pulse rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-100/50 dark:bg-white/[0.02] p-3.5 space-y-2">
                      <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-white/10" />
                      <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-white/10" />
                    </div>
                  ))}
                </div>
              ) : filteredEmails.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                    <Mail className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">
                    {search ? 'No matching emails' : 'Your inbox is clear'}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                    {search ? 'Try clearing your query' : 'Emails sent to your address will appear here instantly.'}
                  </p>
                  {!search && (
                    <button
                      onClick={copyEmail}
                      className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400"
                    >
                      Copy {session?.user?.email}
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-y-auto p-2 space-y-1.5">
                  {filteredEmails.map((email) => {
                    const selected = selectedEmail?.id === email.id
                    const unread = !email.isRead && !email.sent
                    const detectedOtp = detectOtpFromText(email.bodyText || '')

                    return (
                      <div
                        key={email.id}
                        onClick={() => openEmail(email.id)}
                        className={`group cursor-pointer rounded-xl border p-3 transition-all ${
                          selected
                            ? 'border-cyan-500/40 bg-cyan-500/10 shadow-sm'
                            : 'border-slate-200/60 dark:border-white/5 bg-white/70 dark:bg-[#0c1017]/70 hover:border-slate-300 dark:hover:border-white/15'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-slate-950"
                              style={{ backgroundColor: senderAvatarColor(email.fromAddress) }}
                            >
                              {email.fromAddress[0]?.toUpperCase()}
                            </span>
                            <span className={`truncate text-xs ${unread ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-600 dark:text-slate-400'}`}>
                              {email.fromAddress}
                            </span>
                          </div>
                          <span className="shrink-0 text-[10px] text-slate-400">
                            {formatMailboxTime(email.receivedAt)}
                          </span>
                        </div>

                        <p className={`mt-1.5 truncate text-xs ${unread ? 'font-bold text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>
                          {email.subject || '(No Subject)'}
                        </p>

                        <p className="mt-1 truncate text-[11px] text-slate-500 dark:text-slate-400">
                          {extractPreview(email)}
                        </p>

                        {/* 1-Tap OTP Card Badge */}
                        {detectedOtp && (
                          <div className="mt-2 flex items-center justify-between rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2 py-1">
                            <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-300 font-bold">
                              OTP: {detectedOtp}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => copyOtpCode(detectedOtp, e)}
                              className="inline-flex items-center gap-1 rounded bg-cyan-500 hover:bg-cyan-400 px-1.5 py-0.5 text-[9px] font-bold text-slate-950"
                            >
                              <Copy className="h-2.5 w-2.5" />
                              Copy
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Email Reading Pane */}
            <section
              className={`${
                selectedEmail ? 'flex' : 'hidden md:flex'
              } min-w-0 flex-1 flex-col bg-slate-50 dark:bg-[#07090e]`}
            >
              {!selectedEmail ? (
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
                  {/* Top Welcome Banner */}
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/80 p-6 backdrop-blur shadow-sm">
                    <div className="absolute top-0 right-0 -mt-6 -mr-6 h-36 w-36 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">
                            Real-Time Listener Active
                          </span>
                        </div>
                        <h2 className="mt-1.5 text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                          Mailbox Command Center
                        </h2>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                          Incoming emails & verification codes arrive automatically via Cloudflare Edge.
                        </p>
                      </div>

                      {/* Address pill with 1-tap copy */}
                      <button
                        onClick={copyEmail}
                        className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-2 text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 transition self-start sm:self-auto group shadow-sm"
                        title="Click to copy address"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />}
                        <span>{session?.user?.email}</span>
                      </button>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-slate-200/60 dark:border-white/5">
                      <div className="rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-black/30 p-3">
                        <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Total Inbox</span>
                        <div className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">{emails.length}</div>
                        <span className="text-[10px] text-cyan-500 font-medium">{unreadCount} unread</span>
                      </div>

                      <div className="rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-black/30 p-3">
                        <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">OTPs Detected</span>
                        <div className="mt-1 text-xl font-extrabold text-cyan-400">{totalOtpCount}</div>
                        <span className="text-[10px] text-emerald-500 font-medium">1-tap copy ready</span>
                      </div>

                      <div className="rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-black/30 p-3">
                        <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Auto-Refresh</span>
                        <div className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">{refreshCountdown}s</div>
                        <span className="text-[10px] text-slate-500 font-medium">Auto-sync interval</span>
                      </div>

                      <div className="rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-black/30 p-3">
                        <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Privacy Status</span>
                        <div className="mt-1 text-xs font-bold text-emerald-500 flex items-center gap-1">
                          <ShieldCheck className="h-3.5 w-3.5" /> Protected
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">0 Ad Trackers</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Caught OTPs Quick Section */}
                  {otpEmailsList.length > 0 ? (
                    <div className="rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-cyan-950/20 to-black/40 p-4 sm:p-5 backdrop-blur">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-cyan-400" />
                          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                            Recent Caught OTP & Verification Codes
                          </h3>
                        </div>
                        <span className="text-[10px] text-slate-500">1-Tap Instant Copy</span>
                      </div>

                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {otpEmailsList.slice(0, 4).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-cyan-500/20 bg-[#0c1017] p-3 hover:border-cyan-400/40 transition cursor-pointer group"
                            onClick={() => openEmail(item.id)}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                                {item.fromAddress}
                              </p>
                              <p className="truncate text-[11px] text-slate-500">{item.subject || '(No Subject)'}</p>
                            </div>
                            <button
                              onClick={(e) => copyOtpCode(item.detectedOtp!, e)}
                              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/20 px-2.5 py-1 text-xs font-mono font-bold text-cyan-300 hover:bg-cyan-500/30 transition shadow-sm"
                              title="Click to copy OTP"
                            >
                              <Copy className="h-3 w-3" />
                              <span>{item.detectedOtp}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Quick Action Station */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                      Workspace Quick Actions
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <button
                        onClick={copyEmail}
                        className="flex flex-col items-start gap-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/70 p-4 text-left hover:border-cyan-500/40 hover:bg-cyan-500/5 transition group"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500 group-hover:scale-105 transition-transform">
                          <Copy className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">Copy Ghost Address</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Ready for signups, forms & test bots.</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setIsComposeOpen(true)}
                        className="flex flex-col items-start gap-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/70 p-4 text-left hover:border-cyan-500/40 hover:bg-cyan-500/5 transition group"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-105 transition-transform">
                          <PenSquare className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">Compose Message</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Send a test or reply email outbound.</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setMailbox('api')}
                        className="flex flex-col items-start gap-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/70 p-4 text-left hover:border-cyan-500/40 hover:bg-cyan-500/5 transition group"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-105 transition-transform">
                          <KeyRound className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">Developer API Key</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Automate inbox polling via REST API.</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Real-Time Push Delivery Status Banner */}
                  <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/50 dark:bg-[#0c1017]/50 p-4 sm:p-5 backdrop-blur flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
                        <Activity className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">Pro Tip: Automatic Push Delivery</h4>
                        <p className="text-[11px] text-slate-500">
                          No need to refresh. As soon as a service sends mail to your address, GhostMail automatically delivers it and rings a chime.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => fetchInbox()}
                      className="hidden sm:inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/30 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-cyan-500/30 transition shadow-sm"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                      <span>Sync Now</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col">
                  {/* Reading Pane Header */}
                  <div className="border-b border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/70 p-4 md:p-6 backdrop-blur space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <button
                          onClick={() => setSelectedEmail(null)}
                          className="inline-flex items-center gap-1 text-xs text-cyan-500 md:hidden mb-2"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                          Back to list
                        </button>
                        <h2 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white">
                          {selectedEmail.subject || '(No Subject)'}
                        </h2>
                      </div>

                      {/* Header Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleStar(selectedEmail)}
                          className="rounded-lg p-2 text-slate-500 hover:text-amber-400 transition"
                          title="Star message"
                        >
                          <Star className={`h-4 w-4 ${selectedEmailStarred ? 'fill-current text-amber-400' : ''}`} />
                        </button>
                        <button
                          onClick={() => downloadEmail(selectedEmail)}
                          className="rounded-lg p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
                          title="Download email"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteEmail(selectedEmail.id)}
                          className="rounded-lg p-2 text-red-400 hover:bg-red-500/10 transition"
                          title="Delete email"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Sender Info & Date */}
                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
                      <div>
                        From: <strong className="text-slate-900 dark:text-white font-mono">{selectedEmail.fromAddress}</strong>
                      </div>
                      <div>{new Date(selectedEmail.receivedAt).toLocaleString()}</div>
                    </div>

                    {/* Prominent 1-Tap OTP Banner inside Reader */}
                    {detectedSelectedOtp && (
                      <div className="flex items-center justify-between rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 shadow-sm">
                        <div className="flex items-center gap-2">
                          <KeyRound className="h-4 w-4 text-cyan-500" />
                          <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                            Verification OTP Code: <strong className="font-mono text-sm text-cyan-600 dark:text-cyan-300 ml-1">{detectedSelectedOtp}</strong>
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyOtpCode(detectedSelectedOtp)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 px-3 py-1 text-xs font-bold text-slate-950 transition"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          Copy OTP
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    {selectedEmail.bodyHtml ? (
                      <iframe
                        title="email-reading-pane"
                        sandbox="allow-popups allow-popups-to-escape-sandbox"
                        referrerPolicy="no-referrer"
                        srcDoc={`<html><head><base target="_blank"><meta name="referrer" content="no-referrer"></head><body style="margin:0;padding:16px;background:white;font-family:sans-serif;color:#111;">${selectedEmail.bodyHtml}</body></html>`}
                        className="min-h-[460px] w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white"
                      />
                    ) : (
                      <div className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/70 p-5 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans">
                        {selectedEmail.bodyText || 'This email has no text content.'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {/* 3. Mobile Floating Bottom Action Dock */}
        <div className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-[#0c1017]/95 backdrop-blur-xl px-4 py-2.5 flex items-center justify-around shadow-2xl">
          <button
            onClick={() => {
              setMailbox('inbox')
              setSelectedEmail(null)
            }}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
              mailbox === 'inbox' ? 'text-cyan-500' : 'text-slate-400'
            }`}
          >
            <Inbox className="h-4 w-4" />
            <span>Inbox</span>
          </button>

          <button
            onClick={copyEmail}
            className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-400 active:text-cyan-500"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            <span>Copy Mail</span>
          </button>

          <button
            onClick={() => setIsComposeOpen(true)}
            className="flex items-center justify-center -mt-5 h-11 w-11 rounded-full bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30"
          >
            <PenSquare className="h-5 w-5" />
          </button>

          <button
            onClick={() => fetchInbox()}
            className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-400 active:text-cyan-500"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-cyan-500' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => {
              setMailbox('api')
              setSelectedEmail(null)
            }}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
              mailbox === 'api' ? 'text-cyan-500' : 'text-slate-400'
            }`}
          >
            <Key className="h-4 w-4" />
            <span>API</span>
          </button>
        </div>
      </main>

      {/* Compose Modal */}
      {isComposeOpen && (
        <div className="fixed bottom-16 md:bottom-6 right-4 md:right-6 z-50 w-[min(480px,calc(100vw-2rem))]">
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/15 bg-white dark:bg-[#0c1017] shadow-2xl backdrop-blur-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 px-4 py-3 bg-slate-50 dark:bg-white/[0.02]">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">New Message</h3>
              <button onClick={() => setIsComposeOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSend} className="p-4 space-y-3">
              <input
                required
                type="email"
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
                placeholder="Recipient (e.g. user@example.com)"
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500"
              />
              <input
                required
                type="text"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                placeholder="Subject"
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500"
              />
              <textarea
                required
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder="Write your email body..."
                rows={5}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500 resize-none"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isSending}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 transition"
                >
                  <Send className="h-3.5 w-3.5" />
                  {isSending ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Crypto Upgrade Modal */}
      <CryptoUpgradeModal
        isOpen={showCryptoModal}
        onClose={() => {
          setShowCryptoModal(false)
          fetchApiKey()
        }}
        userEmail={session?.user?.email || ''}
      />
    </div>
  )
}
