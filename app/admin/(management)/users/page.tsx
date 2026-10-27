// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  Ban,
  ChevronDown,
  Download,
  Eye,
  KeyRound,
  MoreHorizontal,
  Search,
  Trash2,
  Users,
  LogIn,
  CheckCircle,
  ShieldAlert,
  UserCheck,
} from 'lucide-react'
import { signIn } from 'next-auth/react'

type UserRecord = {
  id: number
  username: string
  email: string
  createdAt: string
  isBanned: boolean
  lastActive: string | null
  _count: { emails: number }
  bannedUser: { reason: string | null } | null
}

function formatRelativeDate(value: string | null) {
  if (!value) return 'Never'

  const date = new Date(value)
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString()
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState({ total: 0, active: 0, banned: 0 })
  const [menuOpenFor, setMenuOpenFor] = useState<number | null>(null)
  const [deleteModal, setDeleteModal] = useState<UserRecord | null>(null)
  const [banModal, setBanModal] = useState<UserRecord | null>(null)
  const [passwordModal, setPasswordModal] = useState<{ user: UserRecord; password: string } | null>(null)
  const [banReason, setBanReason] = useState('')
  const [confirmUsername, setConfirmUsername] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / 20)), [total])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/admin/users?search=${encodeURIComponent(search)}&page=${page}&limit=20&sort=${sort}`
      )
      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      setUsers(data.users || [])
      setTotal(data.total || 0)
      setStats(data.stats || { total: 0, active: 0, banned: 0 })
    } catch (error) {
      console.error(error)
      toast.error('Failed to load user directory')
    } finally {
      setLoading(false)
    }
  }, [page, search, sort])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleDelete = async () => {
    if (!deleteModal || confirmUsername !== deleteModal.username) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${deleteModal.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete user')
      toast.success('Account purged from database')
      setDeleteModal(null)
      setConfirmUsername('')
      await fetchUsers()
    } catch (error) {
      console.error(error)
      toast.error('Failed to delete user account')
    } finally {
      setActionLoading(false)
    }
  }

  const handleBanToggle = async () => {
    if (!banModal) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${banModal.id}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: banReason }),
      })
      if (!res.ok) throw new Error('Failed to update ban')
      toast.success(banModal.isBanned ? 'User status restored to Active' : 'User account banned')
      setBanModal(null)
      setBanReason('')
      await fetchUsers()
    } catch (error) {
      console.error(error)
      toast.error('Failed to update user status')
    } finally {
      setActionLoading(false)
    }
  }

  const handleResetPassword = async (user: UserRecord) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}/reset-password`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to reset password')
      const data = await res.json()
      setPasswordModal({ user, password: data.password })
      toast.success('New temporary password generated')
    } catch (error) {
      console.error(error)
      toast.error('Failed to reset password')
    } finally {
      setActionLoading(false)
      setMenuOpenFor(null)
    }
  }

  const handleExport = () => {
    window.open('/api/admin/users/export', '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
              <UserCheck className="h-3 w-3 text-cyan-400" />
              Member Directory
            </span>
            <span className="text-xs text-slate-400">officialum1 • umiskills</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Registered Accounts
          </h1>
          <p className="mt-1 text-xs lg:text-sm text-slate-500 dark:text-slate-400">
            Search, moderate, impersonate, and audit member activity across all custom domains.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 self-start lg:self-auto rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm backdrop-blur transition hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20"
        >
          <Download className="h-4 w-4 text-cyan-400" />
          <span>Export Users CSV</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 p-5 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Accounts
            </p>
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-2.5 text-cyan-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
            {stats.total.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Registered member profiles</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 p-5 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Status
            </p>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-emerald-400">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-black tracking-tight text-emerald-500 dark:text-emerald-400 font-mono">
            {stats.active.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">In good standing</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 p-5 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Banned Accounts
            </p>
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2.5 text-rose-400">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-black tracking-tight text-rose-500 dark:text-rose-400 font-mono">
            {stats.banned.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Enforced by security policy</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search accounts by username, email, or domain..."
            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 dark:text-white outline-none placeholder:text-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition backdrop-blur shadow-sm"
          />
        </div>

        <select
          value={sort}
          onChange={(event) => {
            setSort(event.target.value)
            setPage(1)
          }}
          className="rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-cyan-500 transition backdrop-blur shadow-sm cursor-pointer"
        >
          <option value="newest">Sort: Newest First</option>
          <option value="oldest">Sort: Oldest First</option>
          <option value="mostEmails">Sort: Most Inbound Mails</option>
          <option value="username">Sort: Username (A-Z)</option>
        </select>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/80 backdrop-blur-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Querying Accounts...
            </p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center">
            <Users className="mx-auto h-10 w-10 text-slate-400 mb-2 opacity-40" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">No accounts found</p>
            <p className="text-xs text-slate-400 mt-0.5">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="px-6 py-3.5">User Identity</th>
                  <th className="px-6 py-3.5">Primary Email</th>
                  <th className="px-6 py-3.5">Registered</th>
                  <th className="px-6 py-3.5 text-center">Inbound Mails</th>
                  <th className="px-6 py-3.5">Last Seen</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-black text-white shadow-sm shrink-0">
                          {user.username[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {user.username}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono">ID #{user.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-mono text-cyan-600 dark:text-cyan-400 font-medium">
                        {user.email}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {formatRelativeDate(user.createdAt)}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="inline-block rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-cyan-600 dark:text-cyan-300">
                        {user._count.emails}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {formatRelativeDate(user.lastActive)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                          user.isBanned
                            ? 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                            : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            user.isBanned ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                        />
                        {user.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-flex justify-end">
                        <button
                          onClick={() => setMenuOpenFor(menuOpenFor === user.id ? null : user.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 px-2.5 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition shadow-sm"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                          <ChevronDown className="h-3 w-3 text-slate-400" />
                        </button>

                        {menuOpenFor === user.id && (
                          <div className="absolute right-0 top-10 z-30 w-52 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1017] p-1.5 shadow-2xl backdrop-blur-xl animate-fade-in">
                            <button
                              onClick={() => {
                                router.push(`/admin/emails?userId=${user.id}`)
                                setMenuOpenFor(null)
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition"
                            >
                              <Eye className="h-3.5 w-3.5 text-cyan-400" /> View Emails
                            </button>

                            <button
                              onClick={() => {
                                signIn('impersonation', {
                                  userId: String(user.id),
                                  callbackUrl: '/dashboard',
                                })
                                setMenuOpenFor(null)
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 transition"
                            >
                              <LogIn className="h-3.5 w-3.5" /> Impersonate User
                            </button>

                            <button
                              onClick={() => {
                                setBanModal(user)
                                setMenuOpenFor(null)
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition"
                            >
                              <Ban className="h-3.5 w-3.5" />
                              {user.isBanned ? 'Unban Account' : 'Ban Account'}
                            </button>

                            <button
                              onClick={() => handleResetPassword(user)}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition"
                            >
                              <KeyRound className="h-3.5 w-3.5 text-purple-400" /> Reset Password
                            </button>

                            <div className="my-1 border-t border-slate-200/60 dark:border-white/5" />

                            <button
                              onClick={() => {
                                setDeleteModal(user)
                                setMenuOpenFor(null)
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete Account
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-200/80 dark:border-white/10 px-6 py-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing {Math.min((page - 1) * 20 + 1, total)}–{Math.min(page * 20, total)} of {total} accounts
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-40 transition hover:bg-slate-100 dark:hover:bg-white/10"
            >
              Previous
            </button>
            <span className="text-xs font-mono text-slate-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-40 transition hover:bg-slate-100 dark:hover:bg-white/10"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Ban / Moderation Modal */}
      {banModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1017] p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Ban className="h-5 w-5 text-amber-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {banModal.isBanned ? 'Restore Account' : 'Ban Account'}
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Update platform access for{' '}
              <strong className="text-slate-900 dark:text-white font-mono">{banModal.username}</strong> ({banModal.email}).
            </p>

            {!banModal.isBanned && (
              <div className="mt-4">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Ban Reason (Optional)
                </label>
                <input
                  value={banReason}
                  onChange={(event) => setBanReason(event.target.value)}
                  placeholder="e.g. Terms violation, spam bot, suspicious relay..."
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500 transition"
                />
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setBanModal(null)
                  setBanReason('')
                }}
                className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBanToggle}
                disabled={actionLoading}
                className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 py-2.5 text-xs font-bold text-white shadow-md hover:from-amber-400 hover:to-rose-500 disabled:opacity-60 transition"
              >
                {actionLoading ? 'Saving...' : banModal.isBanned ? 'Unban Account' : 'Confirm Ban'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-white dark:bg-[#0c1017] p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Trash2 className="h-5 w-5 text-rose-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Delete Account: {deleteModal.username}?
              </h2>
            </div>
            <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
              This action is irreversible. All generated aliases, stored mail, and tokens for this user will be permanently destroyed.
            </p>

            <div className="mt-4">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Type &quot;{deleteModal.username}&quot; to confirm
              </label>
              <input
                value={confirmUsername}
                onChange={(event) => setConfirmUsername(event.target.value)}
                placeholder={deleteModal.username}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500 transition font-mono"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setDeleteModal(null)
                  setConfirmUsername('')
                }}
                className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={confirmUsername !== deleteModal.username || actionLoading}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-rose-500 disabled:opacity-50 transition"
              >
                {actionLoading ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {passwordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-cyan-500/30 bg-white dark:bg-[#0c1017] p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <KeyRound className="h-5 w-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Password Generated</h2>
            </div>
            <p className="text-xs text-slate-500">
              Copy this temporary password now. It will only be shown once for{' '}
              <strong className="text-slate-900 dark:text-white">{passwordModal.user.username}</strong>.
            </p>

            <div className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3.5 font-mono text-center text-sm font-bold text-cyan-600 dark:text-cyan-300 select-all">
              {passwordModal.password}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setPasswordModal(null)}
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-cyan-400 hover:to-blue-500 transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
