'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Ban, ChevronDown, Download, Eye, KeyRound, MoreHorizontal, Search, Trash2, Users, LogIn } from 'lucide-react'
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
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}&page=${page}&limit=20&sort=${sort}`)
      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      setUsers(data.users || [])
      setTotal(data.total || 0)
      setStats(data.stats || { total: 0, active: 0, banned: 0 })
    } catch (error) {
      console.error(error)
      toast.error('Failed to load users')
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
      toast.success('User deleted successfully')
      setDeleteModal(null)
      setConfirmUsername('')
      await fetchUsers()
    } catch (error) {
      console.error(error)
      toast.error('Failed to delete user')
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
      toast.success(banModal.isBanned ? 'User unbanned' : 'User banned')
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
      toast.success('Password reset successfully')
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-900 dark:text-white">
            <Users className="h-8 w-8 text-cyan-400" />
            Users
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Search, moderate, export, and manage registered users.</p>
        </div>
        <button onClick={handleExport} className="rounded-2xl bg-slate-200 dark:bg-white/10 px-4 py-3 text-sm font-medium text-slate-900 dark:text-white transition hover:bg-white/20">
          <span className="inline-flex items-center gap-2"><Download className="h-4 w-4" /> Export CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl backdrop-blur p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total users</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl backdrop-blur p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Active</p>
          <p className="mt-2 text-3xl font-bold text-emerald-400">{stats.active}</p>
        </div>
        <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl backdrop-blur p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Banned</p>
          <p className="mt-2 text-3xl font-bold text-red-400">{stats.banned}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search by username or email"
            className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 py-3 pl-11 pr-4 text-slate-900 dark:text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
          />
        </div>
        <select
          value={sort}
          onChange={(event) => {
            setSort(event.target.value)
            setPage(1)
          }}
          className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-cyan-400"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="mostEmails">Most Emails</option>
          <option value="username">Username A-Z</option>
        </select>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 backdrop-blur">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center text-slate-500 dark:text-slate-400">No users found.</div>
        ) : (
          <div className="w-full">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-left text-slate-500 dark:text-slate-400">
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Joined</th>
                  <th className="px-6 py-4 font-medium">Emails</th>
                  <th className="px-6 py-4 font-medium">Last Active</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-200 dark:border-white/5 hover:bg-white/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 font-semibold text-slate-900 dark:text-white">
                          {user.username[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{user.email}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{formatRelativeDate(user.createdAt)}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-xs text-cyan-300">{user._count.emails}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{formatRelativeDate(user.lastActive)}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${user.isBanned ? 'bg-red-500/10 text-red-300' : 'bg-emerald-500/10 text-emerald-300'}`}>
                        {user.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-flex justify-end">
                        <button
                          onClick={() => setMenuOpenFor(menuOpenFor === user.id ? null : user.id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-3 py-2 text-slate-900 dark:text-white hover:bg-white/10"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        {menuOpenFor === user.id ? (
                          <div className="absolute right-0 top-12 z-20 w-52 rounded-2xl border border-slate-200 dark:border-white/10 bg-[#0f172a] p-2 shadow-2xl">
                            <button onClick={() => { router.push(`/admin/emails?userId=${user.id}`); setMenuOpenFor(null) }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-white/5">
                              <Eye className="h-4 w-4" /> View Emails
                            </button>
                            <button onClick={() => { signIn('impersonation', { userId: String(user.id), callbackUrl: '/dashboard' }); setMenuOpenFor(null) }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-cyan-300 hover:bg-cyan-500/10">
                              <LogIn className="h-4 w-4" /> Login as User
                            </button>
                            <button onClick={() => { setBanModal(user); setMenuOpenFor(null) }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-white/5">
                              <Ban className="h-4 w-4" /> {user.isBanned ? 'Unban User' : 'Ban User'}
                            </button>
                            <button onClick={() => handleResetPassword(user)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-white/5">
                              <KeyRound className="h-4 w-4" /> Reset Password
                            </button>
                            <button onClick={() => { setDeleteModal(user); setMenuOpenFor(null) }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-300 hover:bg-red-500/10">
                              <Trash2 className="h-4 w-4" /> Delete User
                            </button>
                          </div>
                        ) : null}
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
          <button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1} className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-4 py-2 text-slate-900 dark:text-white disabled:opacity-50">
            Previous
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400">Page {page} / {totalPages}</span>
          <button onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page >= totalPages} className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-4 py-2 text-slate-900 dark:text-white disabled:opacity-50">
            Next
          </button>
        </div>
      </div>

      {banModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-white/10 bg-[#0a0f1e] p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{banModal.isBanned ? 'Unban user' : 'Ban user'}</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Update moderation status for {banModal.username}.</p>
            {!banModal.isBanned ? (
              <input
                value={banReason}
                onChange={(event) => setBanReason(event.target.value)}
                placeholder="Ban reason"
                className="mt-4 w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-cyan-400"
              />
            ) : null}
            <div className="mt-6 flex gap-3">
              <button onClick={() => { setBanModal(null); setBanReason('') }} className="flex-1 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-4 py-3 text-slate-900 dark:text-white">Cancel</button>
              <button onClick={handleBanToggle} disabled={actionLoading} className="flex-1 rounded-2xl bg-red-500 px-4 py-3 font-medium text-slate-900 dark:text-white disabled:opacity-60">
                {actionLoading ? 'Saving...' : banModal.isBanned ? 'Unban User' : 'Ban User'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-white/10 bg-[#0a0f1e] p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Delete {deleteModal.username}?</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">This will delete user and ALL their emails. Type the username to confirm.</p>
            <input
              value={confirmUsername}
              onChange={(event) => setConfirmUsername(event.target.value)}
              placeholder={`Type "${deleteModal.username}"`}
              className="mt-4 w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-red-400"
            />
            <div className="mt-6 flex gap-3">
              <button onClick={() => { setDeleteModal(null); setConfirmUsername('') }} className="flex-1 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-4 py-3 text-slate-900 dark:text-white">Cancel</button>
              <button onClick={handleDelete} disabled={confirmUsername !== deleteModal.username || actionLoading} className="flex-1 rounded-2xl bg-red-500 px-4 py-3 font-medium text-slate-900 dark:text-white disabled:opacity-60">
                {actionLoading ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {passwordModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-white/10 bg-[#0a0f1e] p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Password Reset</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Copy this password now. It will only be shown once for {passwordModal.user.username}.</p>
            <div className="mt-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 font-mono text-cyan-300">
              {passwordModal.password}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setPasswordModal(null)} className="rounded-2xl bg-slate-200 dark:bg-white/10 px-4 py-3 text-slate-900 dark:text-white hover:bg-white/20">Close</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
