'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Eye, Mail, Search, Trash2, X } from 'lucide-react'

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
  return date.toLocaleDateString()
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
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  const toggleSelectAll = () => {
    setSelectedIds((current) => current.length === emails.length ? [] : emails.map((email) => email.id))
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
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-900 dark:text-white">
          <Mail className="h-8 w-8 text-cyan-400" />
          Emails
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Search, review, and clean up inbound and outbound email activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl backdrop-blur p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total emails</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl backdrop-blur p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Today</p>
          <p className="mt-2 text-3xl font-bold text-cyan-300">{stats.today}</p>
        </div>
        <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl backdrop-blur p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">This week</p>
          <p className="mt-2 text-3xl font-bold text-blue-300">{stats.thisWeek}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="relative lg:col-span-2">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search by from, to, or subject" className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 py-3 pl-11 pr-4 text-slate-900 dark:text-white outline-none placeholder:text-slate-500 focus:border-cyan-400" />
        </div>
        <select value={userId} onChange={(event) => { setUserId(event.target.value); setPage(1) }} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-cyan-400">
          <option value="">All users</option>
          {users.map((user) => <option key={user.id} value={user.id}>{user.username}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setPage(1) }} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-cyan-400" />
        <input type="date" value={dateTo} onChange={(event) => { setDateTo(event.target.value); setPage(1) }} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-cyan-400" />
      </div>

      {selectedIds.length > 0 ? (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-4 py-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">{selectedIds.length} selected</p>
          <button onClick={handleBulkDelete} className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-slate-900 dark:text-white">Delete selected</button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 backdrop-blur">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          </div>
        ) : emails.length === 0 ? (
          <div className="py-20 text-center text-slate-500 dark:text-slate-400">No emails found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-left text-slate-500 dark:text-slate-400">
                  <th className="px-6 py-4"><input type="checkbox" checked={selectedIds.length === emails.length && emails.length > 0} onChange={toggleSelectAll} /></th>
                  <th className="px-6 py-4 font-medium">From</th>
                  <th className="px-6 py-4 font-medium">To</th>
                  <th className="px-6 py-4 font-medium">Subject</th>
                  <th className="px-6 py-4 font-medium">Received</th>
                  <th className="px-6 py-4 font-medium">Read</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {emails.map((email) => (
                  <tr key={email.id} className="border-b border-slate-200 dark:border-white/5 hover:bg-white/5">
                    <td className="px-6 py-4"><input type="checkbox" checked={selectedIds.includes(email.id)} onChange={() => toggleSelected(email.id)} /></td>
                    <td className="px-6 py-4 text-slate-900 dark:text-white max-w-[220px] truncate">{email.fromAddress}</td>
                    <td className="px-6 py-4 text-cyan-300 max-w-[220px] truncate">{email.toAddress}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 max-w-[300px] truncate">{email.subject.slice(0, 50)}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{relativeTime(email.receivedAt)}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${email.isRead ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300'}`}>
                        {email.isRead ? 'Read' : 'Unread'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setSelectedEmail(email)} className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-2 text-slate-900 dark:text-white hover:bg-white/10">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(email.id)} className="rounded-xl border border-red-500/20 bg-red-500/10 p-2 text-red-300 hover:bg-red-500/20">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Showing {Math.min((page - 1) * 20 + 1, total)}-{Math.min(page * 20, total)} of {total}
        </p>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1} className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-4 py-2 text-slate-900 dark:text-white disabled:opacity-50">Previous</button>
          <span className="text-sm text-slate-500 dark:text-slate-400">Page {page} / {totalPages}</span>
          <button onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page >= totalPages} className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-4 py-2 text-slate-900 dark:text-white disabled:opacity-50">Next</button>
        </div>
      </div>

      {selectedEmail ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-[#0a0f1e]">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{selectedEmail.subject || '(No Subject)'}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{selectedEmail.fromAddress} → {selectedEmail.toAddress}</p>
              </div>
              <button onClick={() => setSelectedEmail(null)} className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-2 text-slate-900 dark:text-white hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 border-b border-slate-200 dark:border-white/10 px-6 py-4 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2">
              <p><span className="text-slate-500">From:</span> {selectedEmail.fromAddress}</p>
              <p><span className="text-slate-500">To:</span> {selectedEmail.toAddress}</p>
              <p><span className="text-slate-500">User:</span> {selectedEmail.user.username}</p>
              <p><span className="text-slate-500">Date:</span> {new Date(selectedEmail.receivedAt).toLocaleString()}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {selectedEmail.bodyHtml ? (
                <iframe
                  title="email-body"
                  sandbox="allow-popups"
                  srcDoc={selectedEmail.bodyHtml}
                  className="h-[500px] w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white"
                />
              ) : (
                <div className="whitespace-pre-wrap rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-5 text-slate-700 dark:text-slate-200">
                  {selectedEmail.bodyText}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
