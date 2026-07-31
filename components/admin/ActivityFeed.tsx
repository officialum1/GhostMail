'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type ActivityItem = {
  id: number
  type: string
  message: string
  createdAt: string
  user?: { username: string; email: string } | null
}

const typeStyles: Record<string, { dot: string; label: string }> = {
  user_registered: { dot: 'bg-emerald-400', label: 'text-emerald-300' },
  email_received: { dot: 'bg-cyan-400', label: 'text-cyan-300' },
  user_banned: { dot: 'bg-red-400', label: 'text-red-300' },
  admin_action: { dot: 'bg-purple-400', label: 'text-purple-300' },
  email_deleted: { dot: 'bg-amber-400', label: 'text-amber-300' },
  user_login: { dot: 'bg-blue-400', label: 'text-blue-300' },
}

function relativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return `${sec} sec ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} min ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  return new Date(value).toLocaleDateString()
}

function formatMessage(item: ActivityItem) {
  if (item.type === 'user_registered' && item.user) {
    return `New user: ${item.user.username}`
  }
  if (item.type === 'email_received') {
    return item.message.replace('Email received: ', '')
  }
  if (item.type === 'user_banned' && item.user) {
    return `User banned: ${item.user.username}`
  }
  if (item.type === 'admin_action') {
    return `Admin: ${item.message}`
  }
  return item.message
}

export default function ActivityFeed() {
  const [items, setItems] = useState<ActivityItem[]>([])
  const prevIds = useRef<Set<number>>(new Set())

  const fetchActivity = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/activity?limit=20')
      if (!res.ok) return
      const data: ActivityItem[] = await res.json()
      setItems(data)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    fetchActivity()
    const interval = setInterval(fetchActivity, 5000)
    return () => clearInterval(interval)
  }, [fetchActivity])

  return (
    <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl backdrop-blur p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Live Activity</h2>
        <div className="flex items-center gap-2 text-xs text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Live
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 max-h-[520px] custom-scrollbar pr-1">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">No activity yet</p>
        ) : (
          items.map((item) => {
            const style = typeStyles[item.type] || { dot: 'bg-slate-400', label: 'text-slate-600 dark:text-slate-300' }
            const isNew = !prevIds.current.has(item.id)
            if (items[0]?.id === item.id) {
              prevIds.current = new Set(items.map((i) => i.id))
            }
            return (
              <div
                key={item.id}
                className={`flex gap-3 rounded-xl border border-slate-200 dark:border-white/5 bg-black/20 px-3 py-2.5 transition-all ${
                  isNew ? 'animate-[fadeIn_0.4s_ease-out]' : ''
                }`}
              >
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm truncate ${style.label}`}>{formatMessage(item)}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{relativeTime(item.createdAt)}</p>
                </div>
              </div>
            )
          })
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
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


