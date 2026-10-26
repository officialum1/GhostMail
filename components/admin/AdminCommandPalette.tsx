// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart2,
  Coins,
  CornerDownLeft,
  Key,
  LayoutDashboard,
  Mail,
  Search,
  Settings,
  Shield,
  Users,
  X,
  Zap,
} from 'lucide-react'
import toast from 'react-hot-toast'

type PaletteItem = {
  id: string
  title: string
  subtitle?: string
  category: 'Navigation' | 'Actions' | 'Users' | 'Orders'
  icon: React.ComponentType<{ className?: string }>
  onSelect: () => void
}

export default function AdminCommandPalette() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [dynamicItems, setDynamicItems] = useState<PaletteItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const staticItems: PaletteItem[] = [
    {
      id: 'nav-dashboard',
      title: 'Dashboard Overview',
      subtitle: 'System metrics, daily graphs & activity',
      category: 'Navigation',
      icon: LayoutDashboard,
      onSelect: () => router.push('/admin/dashboard'),
    },
    {
      id: 'nav-monetization',
      title: 'Monetization & Crypto Orders',
      subtitle: 'Approve USDT/Binance Pay orders & issue API keys',
      category: 'Navigation',
      icon: Coins,
      onSelect: () => router.push('/admin/monetization'),
    },
    {
      id: 'nav-users',
      title: 'Users Management',
      subtitle: 'Manage user accounts, bans & reset passwords',
      category: 'Navigation',
      icon: Users,
      onSelect: () => router.push('/admin/users'),
    },
    {
      id: 'nav-emails',
      title: 'Inbound Emails Explorer',
      subtitle: 'Inspect received emails, headers & payload',
      category: 'Navigation',
      icon: Mail,
      onSelect: () => router.push('/admin/emails'),
    },
    {
      id: 'nav-analytics',
      title: 'Analytics & Traffic',
      subtitle: 'Top senders, peak hours & geographic distribution',
      category: 'Navigation',
      icon: BarChart2,
      onSelect: () => router.push('/admin/analytics'),
    },
    {
      id: 'nav-security',
      title: 'Security & 2FA',
      subtitle: 'Manage admin 2FA, IP blacklists & suspicious events',
      category: 'Navigation',
      icon: Shield,
      onSelect: () => router.push('/admin/security'),
    },
    {
      id: 'nav-settings',
      title: 'System Settings',
      subtitle: 'Configure site name, retention & webhook logs',
      category: 'Navigation',
      icon: Settings,
      onSelect: () => router.push('/admin/settings'),
    },
    {
      id: 'nav-api-docs',
      title: 'Developer REST API Docs',
      subtitle: 'Open public API reference & interactive playground',
      category: 'Navigation',
      icon: Key,
      onSelect: () => window.open('/api-docs', '_blank'),
    },
    {
      id: 'act-synthetic-probe',
      title: 'Trigger Synthetic Delivery Probe',
      subtitle: 'Fire a test email to measure ingestion pipeline latency',
      category: 'Actions',
      icon: Zap,
      onSelect: async () => {
        toast.loading('Sending synthetic delivery probe...', { id: 'probe-toast' })
        try {
          const res = await fetch('/api/admin/system/health', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetEmail: 'admin@ghostmail.store', testType: 'otp' }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Failed probe')
          toast.success(`Probe delivered in ${data.latencyMs}ms! OTP: ${data.otp}`, { id: 'probe-toast' })
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Probe failed', { id: 'probe-toast' })
        }
      },
    },
  ]

  // Global Keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      } else if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Live Search for Users & Crypto Orders when query is typed
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setDynamicItems([])
      return
    }

    let isMounted = true
    setIsSearching(true)

    const timer = setTimeout(async () => {
      try {
        const [usersRes, ordersRes] = await Promise.all([
          fetch(`/api/admin/users?search=${encodeURIComponent(query)}&limit=4`),
          fetch('/api/admin/crypto-orders'),
        ])

        const items: PaletteItem[] = []

        if (usersRes.ok) {
          const data = await usersRes.json()
          const users = data.users || []
          for (const u of users) {
            items.push({
              id: `user-${u.id}`,
              title: u.email || u.username,
              subtitle: `User Account (${u.emailsCount || 0} emails received)`,
              category: 'Users',
              icon: Users,
              onSelect: () => {
                router.push(`/admin/users?search=${encodeURIComponent(u.email || u.username)}`)
              },
            })
          }
        }

        if (ordersRes.ok) {
          const orders = await ordersRes.json()
          if (Array.isArray(orders)) {
            const matched = orders.filter(
              (o: { userEmail?: string; txId?: string }) =>
                o.userEmail?.toLowerCase().includes(query.toLowerCase()) ||
                o.txId?.toLowerCase().includes(query.toLowerCase())
            )
            for (const order of matched.slice(0, 3)) {
              items.push({
                id: `order-${order.id}`,
                title: `${order.userEmail} (${order.network})`,
                subtitle: `TxID: ${order.txId?.slice(0, 24)}... [Status: ${order.status}]`,
                category: 'Orders',
                icon: Coins,
                onSelect: () => {
                  router.push('/admin/monetization')
                },
              })
            }
          }
        }

        if (isMounted) {
          setDynamicItems(items)
          setSelectedIndex(0)
        }
      } catch (err) {
        console.error('Command palette search error:', err)
      } finally {
        if (isMounted) setIsSearching(false)
      }
    }, 250)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [query, router])

  const visibleItems = query.trim()
    ? [
        ...dynamicItems,
        ...staticItems.filter(
          (item) =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.subtitle?.toLowerCase().includes(query.toLowerCase())
        ),
      ]
    : staticItems

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (visibleItems.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % visibleItems.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + visibleItems.length) % visibleItems.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = visibleItems[selectedIndex]
      if (item) {
        setIsOpen(false)
        item.onSelect()
      }
    }
  }

  return (
    <>
      {/* Quick trigger button for Header */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:border-cyan-400/50 hover:text-slate-900 dark:hover:text-white transition shadow-sm"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Quick Command...</span>
        <kbd className="rounded border border-slate-300 dark:border-white/15 bg-slate-100 dark:bg-black/40 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
          Ctrl K
        </kbd>
      </button>

      {/* Modal Backdrop & Palette Container */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
          <div
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#0f172a] shadow-2xl transition-all"
            onKeyDown={handleKeyDown}
          >
            {/* Input Bar */}
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 px-4 py-3.5">
              <Search className="h-5 w-5 text-cyan-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command, user email, or TxID..."
                className="w-full bg-transparent text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
              />
              {isSearching && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-white/5">
              {visibleItems.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No matching admin actions, users, or crypto orders found.
                </div>
              ) : (
                visibleItems.map((item, idx) => {
                  const Icon = item.icon
                  const isSelected = selectedIndex === idx
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setIsOpen(false)
                        item.onSelect()
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-xs transition ${
                        isSelected
                          ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-500/20'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                            isSelected
                              ? 'bg-cyan-500 text-slate-950 font-bold'
                              : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900 dark:text-white">{item.title}</p>
                          {item.subtitle && (
                            <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="rounded bg-slate-200/50 dark:bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-500">
                          {item.category}
                        </span>
                        {isSelected && <CornerDownLeft className="h-3.5 w-3.5 text-cyan-400" />}
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            {/* Footer navigation hints */}
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 px-4 py-2.5 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 px-1 font-mono">
                    ↑↓
                  </kbd>{' '}
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 px-1 font-mono">
                    ↵
                  </kbd>{' '}
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 px-1 font-mono">
                    Esc
                  </kbd>{' '}
                  Close
                </span>
              </div>
              <span className="text-[10px] text-cyan-500 font-semibold">GhostMail Enterprise Command</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
