'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import toast, { Toaster } from 'react-hot-toast'
import {
  AlertCircle,
  Archive,
  Bell,
  Check,
  ChevronLeft,
  Copy,
  Download,
  Eye,
  Filter,
  Inbox,
  LogOut,
  Mail,
  Maximize2,
  Minimize2,
  MoreVertical,
  PenSquare,
  RefreshCw,
  Search,
  Send,
  Shield,
  Star,
  Trash2,
  X,
} from 'lucide-react'

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

type MailboxKey = 'inbox' | 'sent' | 'starred' | 'trash'

const cssVars = {
  '--bg-primary': '#0a0f1e',
  '--bg-secondary': '#0d1117',
  '--bg-tertiary': '#0f1623',
  '--bg-card': 'rgba(255,255,255,0.05)',
  '--border': 'rgba(255,255,255,0.08)',
  '--text-primary': '#ffffff',
  '--text-secondary': '#94a3b8',
  '--text-muted': '#475569',
  '--accent-cyan': '#22d3ee',
  '--accent-blue': '#3b82f6',
  '--danger': '#ef4444',
  '--success': '#22c55e',
  '--warning': '#f59e0b',
} as React.CSSProperties

const senderColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899']

function formatMailboxTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hour = 1000 * 60 * 60
  const day = hour * 24

  if (diff < hour) {
    const mins = Math.max(1, Math.floor(diff / (1000 * 60)))
    return `${mins} mins ago`
  }
  if (diff < day) {
    const hours = Math.max(1, Math.floor(diff / hour))
    return `${hours} hours ago`
  }
  if (diff < day * 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function senderAvatarColor(email: string) {
  const index = email.charCodeAt(0) % senderColors.length
  return senderColors[index]
}

function extractPreview(email: EmailItem) {
  return (email.bodyText || '').replace(/\s+/g, ' ').trim().slice(0, 80)
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [emails, setEmails] = useState<EmailItem[]>([])
  const [selectedEmail, setSelectedEmail] = useState<FullEmail | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingEmail, setLoadingEmail] = useState(false)
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [isComposeMinimized, setIsComposeMinimized] = useState(false)
  const [copied, setCopied] = useState(false)
  const [refreshCountdown, setRefreshCountdown] = useState(20)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [mailbox, setMailbox] = useState<MailboxKey>('inbox')
  const [starredIds, setStarredIds] = useState<number[]>([])
  const [deletedEmails, setDeletedEmails] = useState<EmailItem[]>([])
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [composeTo, setComposeTo] = useState('')
  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody, setComposeBody] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const previousEmailsRef = useRef<EmailItem[]>([])
  const moreMenuRef = useRef<HTMLDivElement | null>(null)

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
          toast.success(`📧 New email from ${newItems[0].fromAddress}`)
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
  }, [])

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
      setShowMoreMenu(false)
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
  }, [fetchInbox, status])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement)?.tagName === 'INPUT' || (event.target as HTMLElement)?.tagName === 'TEXTAREA') {
        if (event.key === 'Escape') {
          setIsComposeOpen(false)
          setSelectedEmail(null)
        }
        return
      }

      if (event.key.toLowerCase() === 'r') {
        event.preventDefault()
        fetchInbox()
      }
      if (event.key.toLowerCase() === 'c') {
        event.preventDefault()
        setIsComposeOpen(true)
        setIsComposeMinimized(false)
      }
      if (event.key === 'Escape') {
        setIsComposeOpen(false)
        setSelectedEmail(null)
      }
      if (event.key === 'Delete' && selectedEmail) {
        event.preventDefault()
        void deleteEmail(selectedEmail.id)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [fetchInbox, selectedEmail, deleteEmail])

  useEffect(() => {
    if (!showMoreMenu) return

    const handleClickOutside = (event: MouseEvent) => {
      if (!moreMenuRef.current?.contains(event.target as Node)) {
        setShowMoreMenu(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showMoreMenu])

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
      window.setTimeout(() => setCopied(false), 2000)
    }
  }

  const openEmail = async (id: number) => {
    setShowMoreMenu(false)
    setLoadingEmail(true)
    try {
      const res = await fetch(`/api/email/${id}`)
      if (!res.ok) throw new Error('Failed to fetch message')
      const data: FullEmail = await res.json()
      setSelectedEmail(data)
      setEmails((current) => current.map((email) => (email.id === id ? { ...email, isRead: true } : email)))
    } catch (error) {
      console.error('Failed to fetch email details', error)
      toast.error('Failed to load email')
    } finally {
      setLoadingEmail(false)
    }
  }

  const toggleRead = useCallback((email: FullEmail | EmailItem | null) => {
    if (!email) return

    setEmails((current) =>
      current.map((item) =>
        item.id === email.id ? { ...item, isRead: !item.isRead } : item
      )
    )
    setSelectedEmail((current) =>
      current && current.id === email.id
        ? { ...current, isRead: !current.isRead }
        : current
    )
    toast.success(email.isRead ? 'Marked as unread' : 'Marked as read')
  }, [])

  const toggleStar = useCallback((email: FullEmail | EmailItem | null) => {
    if (!email) return

    const isStarred = starredIds.includes(email.id)
    setStarredIds((current) =>
      current.includes(email.id)
        ? current.filter((id) => id !== email.id)
        : [...current, email.id]
    )
    setEmails((current) =>
      current.map((item) =>
        item.id === email.id ? { ...item, starred: !isStarred } : item
      )
    )
    setSelectedEmail((current) =>
      current && current.id === email.id
        ? { ...current, starred: !isStarred }
        : current
    )
    toast.success(isStarred ? 'Email unstarred' : 'Email starred')
  }, [starredIds])

  const downloadEmail = useCallback((email: FullEmail | null) => {
    if (!email) return

    const content = `From: ${email.fromAddress}
To: ${email.toAddress}
Subject: ${email.subject}
Date: ${new Date(email.receivedAt).toLocaleString()}

${email.bodyText || 'No plain text content'}`

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
      setIsComposeMinimized(false)
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

  const handleReply = () => {
    if (!selectedEmail) return
    setComposeTo(selectedEmail.fromAddress)
    setComposeSubject(`Re: ${selectedEmail.subject}`)
    setComposeBody(`\n\n--- On ${new Date(selectedEmail.receivedAt).toLocaleString()}, ${selectedEmail.fromAddress} wrote: ---\n\n${selectedEmail.bodyText}`)
    setIsComposeOpen(true)
    setIsComposeMinimized(false)
  }

  const handleForward = () => {
    if (!selectedEmail) return
    setComposeTo('')
    setComposeSubject(`Fwd: ${selectedEmail.subject}`)
    setComposeBody(`\n\n--- Forwarded message ---\nFrom: ${selectedEmail.fromAddress}\nDate: ${new Date(selectedEmail.receivedAt).toLocaleString()}\nSubject: ${selectedEmail.subject}\nTo: ${selectedEmail.toAddress}\n\n${selectedEmail.bodyText}`)
    setIsComposeOpen(true)
    setIsComposeMinimized(false)
  }

  const selectedMailboxLabel = mailbox[0].toUpperCase() + mailbox.slice(1)
  const selectedEmailStarred =
    selectedEmail ? starredIds.includes(selectedEmail.id) : false

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0a0f1e] text-slate-900 dark:text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    )
  }

  if (status === 'unauthenticated') return null

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0a0f1e] text-slate-900 dark:text-white" style={cssVars}>
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#111827', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' } }} />

      {isMobileSidebarOpen ? (
        <button
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      ) : null}

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-slate-200 dark:border-white/10 bg-[#0d1117] transition-transform md:static md:translate-x-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-[0_18px_38px_rgba(34,211,238,0.18)]">
              <Mail className="h-5 w-5 text-slate-900 dark:text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">GhostMail</h1>
              <p className="text-xs text-slate-500">Private inbox</p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsComposeOpen(true)
              setIsComposeMinimized(false)
            }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 font-semibold text-slate-900 dark:text-white shadow-[0_20px_40px_rgba(59,130,246,0.25)] transition hover:scale-[1.01]"
          >
            <PenSquare className="h-4 w-4" />
            Compose
          </button>
        </div>

        <nav className="flex-1 px-4">
          {[
            { key: 'inbox' as const, icon: Inbox, count: unreadCount },
            { key: 'sent' as const, icon: Send, count: sentCount },
            { key: 'starred' as const, icon: Star, count: starredCount },
            { key: 'trash' as const, icon: Trash2, count: trashCount },
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
                className={`mb-1 flex w-full items-center gap-3 rounded-xl border-l-2 px-4 py-3 text-left transition ${
                  active
                    ? 'border-cyan-400 bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="flex-1 capitalize">{item.key}</span>
                <span className="rounded-full bg-slate-200 dark:bg-white/10 px-2 py-0.5 text-xs text-slate-700 dark:text-slate-200">{item.count}</span>
              </button>
            )
          })}
        </nav>

        <div className="border-t border-slate-200 dark:border-white/10 p-4">
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-bold text-slate-900 dark:text-white">
                {session?.user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900 dark:text-white">{session?.user?.name || 'User'}</p>
                <p className="truncate text-xs text-cyan-600 dark:text-cyan-300">{session?.user?.email}</p>
              </div>
              <button onClick={copyEmail} className="rounded-lg p-2 text-slate-500 dark:text-slate-400 transition hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white">
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <div className="my-4 h-px bg-slate-200 dark:bg-white/10" />
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-slate-200 dark:border-white/10 bg-slate-50/90 dark:bg-[#0a0f1e]/90 px-4 py-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-2 text-slate-600 dark:text-slate-300 md:hidden"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 dark:border-white/10 bg-[#0f1623] px-4 py-3">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search emails..."
                className="w-full bg-transparent text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-500"
              />
              <Filter className="h-4 w-4 text-slate-500" />
            </div>

            <button
              onClick={() => fetchInbox()}
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-3 text-slate-600 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-cyan-600 dark:text-cyan-400' : ''}`} />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{selectedMailboxLabel}</h2>
              <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-xs font-medium text-cyan-600 dark:text-cyan-300">{unreadCount} unread</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-white/5 px-3 py-1.5">
                <Bell className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                Auto refresh in {refreshCountdown}s
              </span>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
          <section className={`${selectedEmail ? 'hidden md:flex' : 'flex'} w-full flex-col border-r border-slate-200 dark:border-white/10 bg-[#0f1623] md:w-[380px]`}>
            {loading ? (
              <div className="space-y-4 px-4 py-5">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="animate-pulse rounded-2xl border border-slate-200 dark:border-white/5 bg-white/[0.03] p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-white/10" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-white/10" />
                        <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-white/10" />
                        <div className="h-3 w-full rounded bg-slate-200 dark:bg-white/10" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredEmails.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400/15 to-blue-500/15">
                  {search ? <Search className="h-10 w-10 text-cyan-600 dark:text-cyan-300" /> : <Mail className="h-10 w-10 text-cyan-600 dark:text-cyan-300" />}
                </div>
                <h3 className="mt-6 text-xl font-semibold text-slate-900 dark:text-white">{search ? 'No emails match your search' : 'Your inbox is empty'}</h3>
                <p className="mt-2 max-w-xs text-sm text-slate-500 dark:text-slate-400">
                  {search ? 'Try different keywords' : 'Share your address to start receiving emails'}
                </p>
                {!search && session?.user?.email ? (
                  <button
                    onClick={copyEmail}
                    className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-600 dark:text-cyan-300"
                  >
                    {session.user.email}
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="overflow-y-auto px-2 py-3">
                {filteredEmails.map((email, index) => {
                  const selected = selectedEmail?.id === email.id
                  const unread = !email.isRead && !email.sent
                  return (
                    <button
                      key={email.id}
                      onClick={() => openEmail(email.id)}
                      className={`group relative mb-2 flex w-full items-start gap-3 rounded-2xl border-l-2 px-4 py-4 text-left transition ${selected ? 'border-cyan-400 bg-slate-200 dark:bg-white/10' : 'border-transparent hover:bg-slate-200 dark:hover:bg-white/5'} ${index < 1 ? 'animate-[fadeInUp_0.4s_ease-out]' : ''}`}
                    >
                      <div className={`mt-3 h-2 w-2 rounded-full ${unread ? 'bg-cyan-400 animate-pulse' : 'bg-transparent'}`} />
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-slate-900 dark:text-white"
                        style={{ backgroundColor: senderAvatarColor(email.fromAddress) }}
                      >
                        {email.fromAddress[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className={`truncate text-sm ${unread ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>{email.fromAddress}</p>
                          <span className="shrink-0 text-xs text-slate-500">{formatMailboxTime(email.receivedAt)}</span>
                        </div>
                        <p className={`mt-1 truncate text-sm ${unread ? 'font-semibold text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>{email.subject || '(No Subject)'}</p>
                        <p className="mt-1 truncate text-xs text-slate-500">{extractPreview(email)}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          <section className={`${selectedEmail ? 'flex' : 'hidden md:flex'} min-w-0 flex-1 flex-col bg-slate-50 dark:bg-[#0a0f1e]`}>
            {!selectedEmail ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <div className="relative flex h-32 w-32 items-center justify-center rounded-[2rem] bg-gradient-to-br from-cyan-400/10 to-blue-500/10">
                  <Mail className="h-16 w-16 text-cyan-600 dark:text-cyan-300" />
                  <div className="absolute -right-3 -top-3 rounded-full border border-cyan-400/20 bg-cyan-400/10 p-3">
                    <Shield className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
                  </div>
                </div>
                <h3 className="mt-8 text-2xl font-semibold text-slate-900 dark:text-white">Your inbox is ready</h3>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Select a message to read</p>
              </div>
            ) : (
              <div className="flex h-full flex-col">
                <div className="border-b border-slate-200 dark:border-white/10 px-5 py-5 md:px-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="mb-3 flex items-center gap-2 md:hidden">
                        <button
                          onClick={() => setSelectedEmail(null)}
                          className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-2 text-slate-600 dark:text-slate-300"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="text-sm text-slate-500">Back to list</span>
                      </div>
                      <h2 className="text-2xl font-semibold text-slate-900 dark:text-white md:text-3xl">{selectedEmail.subject || '(No Subject)'}</h2>
                      <div className="mt-4 space-y-1 text-sm text-slate-500 dark:text-slate-400">
                        <p><span className="text-slate-500">From:</span> {selectedEmail.fromAddress}</p>
                        <p><span className="text-slate-500">To:</span> {session?.user?.email || selectedEmail.toAddress}</p>
                        <p><span className="text-slate-500">Date:</span> {new Date(selectedEmail.receivedAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStar(selectedEmail)}
                        className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-3 text-slate-600 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
                      >
                        <Star className={`h-4 w-4 ${selectedEmailStarred ? 'fill-current text-amber-300' : ''}`} />
                      </button>
                      <button
                        onClick={() => toast('Archive is not configured yet')}
                        className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-3 text-slate-600 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteEmail(selectedEmail.id)}
                        className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-red-300 transition hover:bg-red-500/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="relative" ref={moreMenuRef}>
                        <button
                          onClick={(event) => {
                            event.stopPropagation()
                            setShowMoreMenu((current) => !current)
                          }}
                          className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-3 text-slate-600 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {showMoreMenu ? (
                          <div className="absolute right-0 top-14 z-50 w-48 rounded-xl border border-slate-200 dark:border-white/10 bg-[#1a2035] py-2 shadow-2xl">
                            <button
                              onClick={() => {
                                toggleRead(selectedEmail)
                                setShowMoreMenu(false)
                              }}
                              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-600 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                            >
                              <Eye className="h-4 w-4" />
                              Mark as {selectedEmail.isRead ? 'Unread' : 'Read'}
                            </button>
                            <button
                              onClick={() => {
                                toggleStar(selectedEmail)
                                setShowMoreMenu(false)
                              }}
                              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-600 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                            >
                              <Star className="h-4 w-4" />
                              {selectedEmailStarred ? 'Unstar' : 'Star'} email
                            </button>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(selectedEmail.fromAddress || '')
                                setShowMoreMenu(false)
                                toast.success('Copied!')
                              }}
                              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-600 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                            >
                              <Copy className="h-4 w-4" />
                              Copy sender email
                            </button>
                            <hr className="my-1 border-slate-200 dark:border-white/10" />
                            <button
                              onClick={() => {
                                downloadEmail(selectedEmail)
                                setShowMoreMenu(false)
                              }}
                              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-600 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                            >
                              <Download className="h-4 w-4" />
                              Download .txt
                            </button>
                            <button
                              onClick={() => {
                                void deleteEmail(selectedEmail.id)
                                setShowMoreMenu(false)
                              }}
                              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-400 transition hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete email
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-6 md:px-8">
                  {loadingEmail ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-5 py-4 text-slate-600 dark:text-slate-300">
                        <RefreshCw className="h-4 w-4 animate-spin text-cyan-600 dark:text-cyan-400" />
                        Loading email...
                      </div>
                    </div>
                  ) : selectedEmail.bodyHtml ? (
                    <iframe
                      title="email-reading-pane"
                      sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                      srcDoc={`<html><head><base target="_blank"></head><body style="margin:0;padding:0;background:white;">${selectedEmail.bodyHtml}</body></html>`}
                      className="min-h-[420px] w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white"
                    />
                  ) : (
                    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-6 text-sm leading-7 text-slate-700 dark:text-slate-200">
                      {selectedEmail.bodyText ? (
                        <div className="whitespace-pre-wrap font-sans">{selectedEmail.bodyText}</div>
                      ) : (
                        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                          <AlertCircle className="h-4 w-4 text-amber-300" />
                          This email has no plain text body.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200 dark:border-white/10 px-5 py-4 md:px-8">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleReply}
                      className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 text-sm font-medium text-slate-900 dark:text-white"
                    >
                      Reply
                    </button>
                    <button
                      onClick={handleForward}
                      className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-4 py-3 text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10"
                    >
                      Forward
                    </button>
                    <button
                      onClick={() => deleteEmail(selectedEmail.id)}
                      className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300 hover:bg-red-500/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {isComposeOpen ? (
        <div className="pointer-events-none fixed bottom-0 right-0 z-50 p-4 md:p-6">
          <div className={`pointer-events-auto flex w-[min(520px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#1a2035] shadow-[0_25px_50px_rgba(0,0,0,0.5)] transition-all ${isComposeMinimized ? 'h-[70px]' : 'h-[480px]'}`}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 px-4 py-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">New Message</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsComposeMinimized((value) => !value)}
                  className="rounded-lg p-2 text-slate-500 dark:text-slate-400 transition hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
                >
                  {isComposeMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setIsComposeOpen(false)}
                  className="rounded-lg p-2 text-slate-500 dark:text-slate-400 transition hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {!isComposeMinimized ? (
              <form onSubmit={handleSend} className="flex flex-1 flex-col">
                <div className="space-y-3 px-4 py-4">
                  <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-3 py-2.5">
                    <label className="mb-1 block text-[11px] uppercase tracking-[0.2em] text-slate-500">To</label>
                    <input
                      required
                      type="email"
                      value={composeTo}
                      onChange={(event) => setComposeTo(event.target.value)}
                      className="w-full bg-transparent text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-500"
                      placeholder="recipient@example.com"
                    />
                  </div>
                  <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-3 py-2.5">
                    <label className="mb-1 block text-[11px] uppercase tracking-[0.2em] text-slate-500">Subject</label>
                    <input
                      required
                      type="text"
                      value={composeSubject}
                      onChange={(event) => setComposeSubject(event.target.value)}
                      className="w-full bg-transparent text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-500"
                      placeholder="Subject"
                    />
                  </div>
                </div>

                <div className="flex-1 px-4 pb-4">
                  <textarea
                    required
                    value={composeBody}
                    onChange={(event) => setComposeBody(event.target.value)}
                    className="h-full min-h-[200px] w-full resize-none rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-3 py-3 text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-500"
                    placeholder="Write your message..."
                  />
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 dark:border-white/10 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      disabled={isSending}
                      type="submit"
                      className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white disabled:opacity-60"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        {isSending ? 'Sending...' : 'Send'}
                      </span>
                    </button>
                    <span className="text-xs text-slate-500">Plain text</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setComposeTo('')
                      setComposeSubject('')
                      setComposeBody('')
                      setIsComposeOpen(false)
                    }}
                    className="rounded-lg p-2 text-red-300 transition hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </div>
      ) : null}

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
