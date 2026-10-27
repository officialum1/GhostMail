// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Eye,
  Mail,
  RefreshCw,
  Search,
  Trash2,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react'

type EmailRecord = {
  id: number
  fromAddress: string
  toAddress: string
  subject: string
  bodyText: string
  bodyHtml: string | null
  receivedAt: string
  isRead: boolean
  sent: boolean
  user: {
    username: string
    email: string
  }
}

type UserOption = {
  id: number
  username: string
  email: string
}

const senderColors = ['#06b6d4', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6']

function getAvatarColor(str: string) {
  const code = (str || '').charCodeAt(0) || 0
  return senderColors[code % senderColors.length]
}

function formatSenderDisplay(from: string): string {
  if (!from) return 'Unknown'
  const match = from.match(/^"?([^"<]+)"?\s*<.*>$/)
  if (match && match[1].trim()) return match[1].trim()
  const atIdx = from.indexOf('@')
  if (atIdx > 0) {
    const user = from.slice(0, atIdx)
    const domain = from.slice(atIdx + 1)
    if (['team', 'noreply', 'no-reply', 'support', 'info', 'notifications', 'mailer'].includes(user.toLowerCase())) {
      const parts = domain.split('.')
      if (parts.length >= 2) {
        const root = parts[parts.length - 2]
        return root[0].toUpperCase() + root.slice(1)
      }
    }
    return user[0].toUpperCase() + user.slice(1)
  }
  return from
}

function relativeTime(value: string) {
  const date = new Date(value)
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function AdminEmailsPage() {
  const [emails, setEmails] = useState<EmailRecord[]>([])
  const [users, setUsers] = useState<UserOption[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [userId, setUserId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState({ total: 0, today: 0, thisWeek: 0 })
  const [selectedEmail, setSelectedEmail] = useState<EmailRecord | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [previewTab, setPreviewTab] = useState<'html' | 'text'>('html')
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / 20)), [total])

  const fetchEmails = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search,
        page: String(page),
        limit: '20',
      })
      if (userId) params.set('userId', userId)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)

      const res = await fetch(`/api/admin/emails?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch emails')
      const data = await res.json()
      setEmails(data.emails || [])
      setTotal(data.total || 0)
      setUsers(data.users || [])
      setStats(data.stats || { total: 0, today: 0, thisWeek: 0 })
      setSelectedIds([])
    } catch (error) {
      console.error(error)
      toast.error('Failed to load emails')
    } finally {
      setLoading(false)
    }
  }, [dateFrom, dateTo, page, search, userId])

  useEffect(() => {
    fetchEmails()
  }, [fetchEmails])

  const toggleSelected = (id: number) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    )
  }

  const toggleSelectAll = () => {
    setSelectedIds((current) =>
      current.length === emails.length ? [] : emails.map((email) => email.id)
    )
  }

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/emails/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete email')
      toast.success('Email deleted')
      if (selectedEmail?.id === id) setSelectedEmail(null)
      await fetchEmails()
    } catch (error) {
      console.error(error)
      toast.error('Failed to delete email')
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} emails?`)) return
    try {
      const res = await fetch('/api/admin/emails/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      })
      if (!res.ok) throw new Error('Failed to delete emails')
      toast.success(`Deleted ${selectedIds.length} emails`)
      await fetchEmails()
    } catch (error) {
      console.error(error)
      toast.error('Failed to delete selected emails')
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Email Activity Management
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Audit, inspect, and manage inbound & outbound messages across all inboxes.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => fetchEmails()}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/80 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-cyan-500/40 hover:text-cyan-400 transition backdrop-blur shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-cyan-500' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 3 Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/80 p-5 backdrop-blur shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Ingested
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <Mail className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {stats.total.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-slate-500">all-time messages</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 to-[#0c1017] p-5 backdrop-blur shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Today&apos;s Volume
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300">
              <Zap className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-cyan-400 tracking-tight">
              {stats.today.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
              Last 24 Hours
            </span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/80 p-5 backdrop-blur shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Past 7 Days
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-400 tracking-tight">
              {stats.thisWeek.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-slate-500">weekly throughput</span>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/80 p-4 backdrop-blur shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search sender, recipient, subject..."
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-white outline-none placeholder:text-slate-500 focus:border-cyan-500 transition"
            />
          </div>

          {/* User Filter */}
          <div className="relative">
            <select
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0c1017] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500 transition appearance-none"
            >
              <option value="">All Mailbox Users</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username} ({u.email})
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div className="relative">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0c1017] px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500 transition"
              title="Date From"
            />
          </div>

          {/* Date To */}
          <div className="relative">
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0c1017] px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500 transition"
              title="Date To"
            />
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5">
            <span className="text-xs font-bold text-red-400">
              {selectedIds.length} email{selectedIds.length > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 hover:bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition shadow-sm"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Selected</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Data Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/80 backdrop-blur shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
            <p className="mt-3 text-xs text-slate-500">Querying email logs...</p>
          </div>
        ) : emails.length === 0 ? (
          <div className="py-20 text-center">
            <Mail className="h-10 w-10 text-slate-400 mx-auto" />
            <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">No messages found</h3>
            <p className="mt-1 text-xs text-slate-500">Try adjusting your search criteria or date filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-black/30 text-slate-500 dark:text-slate-400">
                  <th className="px-5 py-3.5 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === emails.length && emails.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 dark:border-white/20"
                    />
                  </th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Sender</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Recipient Inbox</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Subject</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Received</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
                {emails.map((email) => {
                  const senderName = formatSenderDisplay(email.fromAddress)
                  const isChecked = selectedIds.includes(email.id)

                  return (
                    <tr
                      key={email.id}
                      className={`hover:bg-slate-100/60 dark:hover:bg-[#101520] transition-colors ${
                        isChecked ? 'bg-cyan-500/5' : ''
                      }`}
                    >
                      <td className="px-5 py-3.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelected(email.id)}
                          className="rounded border-slate-300 dark:border-white/20"
                        />
                      </td>

                      <td className="px-5 py-3.5 max-w-[200px]">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-slate-950"
                            style={{ backgroundColor: getAvatarColor(email.fromAddress) }}
                          >
                            {senderName[0]?.toUpperCase() || 'E'}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-900 dark:text-slate-100">{senderName}</p>
                            <p className="truncate text-[10px] font-mono text-slate-500 dark:text-slate-400">
                              {email.fromAddress}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 max-w-[200px]">
                        <span className="font-mono text-cyan-600 dark:text-cyan-400 font-semibold truncate block">
                          {email.toAddress}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          user: {email.user.username}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 max-w-[280px]">
                        <p className="truncate font-medium text-slate-800 dark:text-slate-200">
                          {email.subject || '(No Subject)'}
                        </p>
                        <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                          {(email.bodyText || '').slice(0, 60)}
                        </p>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono">
                        {relativeTime(email.receivedAt)}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            email.isRead
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {email.isRead ? 'Read' : 'Unread'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedEmail(email)}
                            className="rounded-lg border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-black/30 p-1.5 text-slate-600 dark:text-slate-300 hover:border-cyan-500/40 hover:text-cyan-400 transition"
                            title="Inspect Email"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(email.id)}
                            className="rounded-lg border border-red-500/20 bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20 transition"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-200/80 dark:border-white/10 px-5 py-3.5 text-xs text-slate-500">
          <span>
            Showing {Math.min((page - 1) * 20 + 1, total)}-{Math.min(page * 20, total)} of {total} messages
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((v) => Math.max(1, v - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-black/30 px-3 py-1.5 font-bold text-slate-700 dark:text-slate-300 hover:border-cyan-500/30 transition disabled:opacity-40"
            >
              Previous
            </button>
            <span className="font-mono text-slate-400">
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((v) => Math.min(totalPages, v + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-black/30 px-3 py-1.5 font-bold text-slate-700 dark:text-slate-300 hover:border-cyan-500/30 transition disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modern Email Inspector Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0c1017] shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-black/30 p-5">
              <div className="min-w-0 flex-1 pr-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-500">
                  Email Inspector • #{selectedEmail.id}
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate mt-1">
                  {selectedEmail.subject || '(No Subject)'}
                </h2>
              </div>
              <button
                onClick={() => setSelectedEmail(null)}
                className="rounded-lg border border-slate-200 dark:border-white/10 p-1.5 text-slate-500 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Meta Attributes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-slate-200/80 dark:border-white/10 bg-white/40 dark:bg-black/10 p-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">From</span>
                <p className="font-mono text-slate-800 dark:text-slate-200 truncate mt-0.5">{selectedEmail.fromAddress}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">To</span>
                <p className="font-mono text-cyan-500 truncate mt-0.5">{selectedEmail.toAddress}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Account</span>
                <p className="text-slate-800 dark:text-slate-200 truncate mt-0.5">@{selectedEmail.user.username}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Received</span>
                <p className="font-mono text-slate-800 dark:text-slate-200 truncate mt-0.5">
                  {new Date(selectedEmail.receivedAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 px-5 py-2.5 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/60 dark:bg-black/20 text-xs">
              <button
                onClick={() => setPreviewTab('html')}
                className={`rounded-lg px-3 py-1 font-bold transition ${
                  previewTab === 'html'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Rich HTML
              </button>
              <button
                onClick={() => setPreviewTab('text')}
                className={`rounded-lg px-3 py-1 font-bold transition ${
                  previewTab === 'text'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Plain Text
              </button>
            </div>

            {/* Email Canvas Preview */}
            <div className="flex-1 overflow-y-auto p-5 bg-slate-100/50 dark:bg-[#07090e]">
              {previewTab === 'html' && selectedEmail.bodyHtml ? (
                <iframe
                  title="email-preview"
                  sandbox="allow-popups"
                  referrerPolicy="no-referrer"
                  srcDoc={`<!DOCTYPE html><html><head><base target="_blank"><style>
                    body { margin: 0; padding: 20px; font-family: sans-serif; line-height: 1.6; color: #1e293b; background: #fff; }
                    img { max-width: 100%; height: auto; }
                  </style></head><body>${selectedEmail.bodyHtml}</body></html>`}
                  className="w-full min-h-[450px] rounded-xl border border-slate-200 dark:border-white/10 bg-white"
                />
              ) : (
                <div className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0c1017] p-5 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {selectedEmail.bodyText || 'No plain text content available.'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
