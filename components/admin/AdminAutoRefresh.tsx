'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminAutoRefresh({
  interval = 30000,
  onRefresh,
}: {
  interval?: number
  onRefresh?: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (onRefresh) {
        onRefresh()
      } else {
        router.refresh()
      }
    }, interval)

    return () => window.clearInterval(timer)
  }, [interval, onRefresh, router])

  return null
}
