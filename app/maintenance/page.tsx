'use client'

import { useEffect, useState } from 'react'
import { Wrench } from 'lucide-react'

export default function MaintenancePage() {
  const [message, setMessage] = useState("We're performing scheduled maintenance. We'll be back shortly.")
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    fetch('/api/public/maintenance')
      .then((r) => r.json())
      .then((d) => {
        if (d.message) setMessage(d.message)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 2))
    }, 120)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1e] flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-8 flex items-center gap-3">
        <span className="text-3xl">✉️</span>
        <span className="text-2xl font-bold text-slate-900 dark:text-white">GhostMail</span>
      </div>

      <Wrench className="h-20 w-20 text-cyan-600 dark:text-cyan-400 animate-spin mb-8" style={{ animationDuration: '3s' }} />

      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Under Maintenance</h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">{message}</p>
      <p className="text-sm text-slate-500 mb-8">We&apos;ll be back shortly. Follow @GhostMail for updates.</p>

      <div className="w-full max-w-md h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
