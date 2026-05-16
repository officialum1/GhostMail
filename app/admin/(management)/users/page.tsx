'use client'

import { useState, useEffect, useCallback } from 'react'
import { Users, Search, Trash2, Ban, Download } from 'lucide-react'

interface User {
  id: number
  username: string
  email: string
  createdAt: string
  isBanned: boolean
  lastActive: string | null
  _count: { emails: number }
  bannedUser: { reason: string } | null
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [deleteModal, setDeleteModal] = useState<User | null>(null)
  const [banModal, setBanModal] = useState<User | null>(null)
  const [banReason, setBanReason] = useState('')
  const [confirmUsername, setConfirmUsername] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users?search=${search}&page=${page}&limit=20`)
      const data = await res.json()
      setUsers(data.users || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleDelete = async () => {
    if (!deleteModal || confirmUsername !== deleteModal.username) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${deleteModal.id}`, { method: 'DELETE' })
      if (res.ok) {
        setMessage('User deleted successfully')
        setDeleteModal(null)
        setConfirmUsername('')
        fetchUsers()
      }
    } catch {
      setMessage('Failed to delete user')
    } finally {
      setActionLoading(false)
    }
  }

  const handleBan = async (user: User) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: banReason })
      })
      if (res.ok) {
        setMessage(user.isBanned ? 'User unbanned' : 'User banned')
        setBanModal(null)
        setBanReason('')
        fetchUsers()
      }
    } catch {
      setMessage('Failed to update ban status')
    } finally {
      setActionLoading(false)
    }
  }

  const handleExport = () => {
    window.open('/api/admin/users/export', '_blank')
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-cyan-400" />
            Users
          </h1>
          <p className="text-slate-400 mt-1">Manage all registered users</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {message && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-400">
          {message}
          <button onClick={() => setMessage('')} className="ml-2 text-green-300">×</button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Total Users</p>
          <p className="text-2xl font-bold text-white">{total}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Active</p>
          <p className="text-2xl font-bold text-green-400">
            {users.filter(u => !u.isBanned).length}
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Banned</p>
          <p className="text-2xl font-bold text-red-400">
            {users.filter(u => u.isBanned).length}
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by username or email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
        />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 text-slate-400">No users found</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-slate-400 text-sm font-medium">User</th>
                <th className="text-left px-6 py-4 text-slate-400 text-sm font-medium">Email</th>
                <th className="text-left px-6 py-4 text-slate-400 text-sm font-medium">Joined</th>
                <th className="text-left px-6 py-4 text-slate-400 text-sm font-medium">Emails</th>
                <th className="text-left px-6 py-4 text-slate-400 text-sm font-medium">Status</th>
                <th className="text-left px-6 py-4 text-slate-400 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                        {user.username[0].toUpperCase()}
                      </div>
                      <span className="text-white font-medium">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300 text-sm">{user.email}</td>
                  <td className="px-6 py-4 text-slate-400 text-sm">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-4">
                    <span className="bg-cyan-400/10 text-cyan-400 px-2 py-1 rounded-full text-xs font-medium">
                      {user._count.emails}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.isBanned
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-green-500/10 text-green-400'
                    }`}>
                      {user.isBanned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setBanModal(user)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.isBanned
                            ? 'bg-green-500/10 hover:bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400'
                        }`}
                        title={user.isBanned ? 'Unban' : 'Ban'}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteModal(user)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {total > 20 && (
        <div className="flex items-center justify-between">
          <p className="text-slate-400 text-sm">
            Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page * 20 >= total}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {banModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1629] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-2">
              {banModal.isBanned ? 'Unban' : 'Ban'} {banModal.username}
            </h3>
            {!banModal.isBanned && (
              <input
                type="text"
                placeholder="Ban reason (optional)"
                value={banReason}
                onChange={e => setBanReason(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 mt-4"
              />
            )}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setBanModal(null); setBanReason('') }}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBan(banModal)}
                disabled={actionLoading}
                className={`flex-1 py-3 rounded-xl font-semibold disabled:opacity-50 ${
                  banModal.isBanned
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {actionLoading ? 'Processing...' : banModal.isBanned ? 'Unban User' : 'Ban User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1629] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-2">Delete {deleteModal.username}?</h3>
            <p className="text-slate-400 text-sm mb-4">
              This will permanently delete the user and ALL their emails. Type their username to confirm.
            </p>
            <input
              type="text"
              placeholder={`Type "${deleteModal.username}" to confirm`}
              value={confirmUsername}
              onChange={e => setConfirmUsername(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-400"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setDeleteModal(null); setConfirmUsername('') }}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={confirmUsername !== deleteModal.username || actionLoading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
