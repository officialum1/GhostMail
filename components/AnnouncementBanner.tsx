'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

type Announcement = {
  id: number
  message: string
  color: string
}

const colorClasses: Record<string, string> = {
  blue: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
  green: 'bg-green-500/20 border-green-500/30 text-green-300',
  yellow: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300',
  red: 'bg-red-500/20 border-red-500/30 text-red-300',
}

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/public/announcement')
        if (res.ok) {
          const data = await res.json()
          if (data?.message) setAnnouncement(data)
        }
      } catch {
        /* ignore */
      }
    }
    load()
  }, [])

  if (!announcement || dismissed) return null

  const colorClass = colorClasses[announcement.color] || colorClasses.blue

  return (
    <div className={`relative border-b px-4 py-3 text-center text-sm ${colorClass}`}>
      <p className="pr-8">{announcement.message}</p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-slate-200 dark:hover:bg-white/10"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
