'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart2,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Settings,
  Shield,
  Users,
  X,
} from 'lucide-react'

const SIDEBAR_COLLAPSED_KEY = 'ghostmail_sidebar_collapsed'
const SIDEBAR_EXPANDED = 'w-64'
const SIDEBAR_COLLAPSED = 'w-[72px]'

function SidebarTooltip({
  children,
  label,
  collapsed,
}: {
  children: React.ReactNode
  label: string
  collapsed: boolean
}) {
  if (!collapsed) return <>{children}</>
  return (
    <div className="group/tooltip relative">
      {children}
      <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs text-white opacity-0 shadow-xl transition-opacity group-hover/tooltip:opacity-100 border border-white/10 max-w-[200px] truncate">
        {label}
      </div>
    </div>
  )
}

export default function AdminSidebar() {
  const pathname = usePathname() ?? ''
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [bannedCount, setBannedCount] = useState(0)
  const [todayEmails, setTodayEmails] = useState(0)
  const [securityAlerts, setSecurityAlerts] = useState(0)
  const [adminEmail, setAdminEmail] = useState('')
  const mobilePanelRef = useRef<HTMLDivElement>(null)

  // Initialize collapsed state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY)
    if (stored === 'true') setCollapsed(true)
  }, [])

  // Persist collapsed state
  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed))
  }, [collapsed])

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Close mobile sidebar on outside click
  useEffect(() => {
    if (!mobileOpen) return
    const handleClick = (e: MouseEvent) => {
      if (mobilePanelRef.current && !mobilePanelRef.current.contains(e.target as Node)) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [mobileOpen])

  const loadSidebarData = useCallback(async () => {
    try {
      const [usersRes, emailsRes, meRes, suspiciousRes] = await Promise.all([
        fetch('/api/admin/users?limit=1'),
        fetch('/api/admin/emails?limit=1'),
        fetch('/api/admin/me'),
        fetch('/api/admin/suspicious?resolved=false&severity=high'),
      ])

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setBannedCount(usersData.stats?.banned || 0)
      }

      if (emailsRes.ok) {
        const emailsData = await emailsRes.json()
        setTodayEmails(emailsData.stats?.today || 0)
      }

      if (meRes.ok) {
        const meData = await meRes.json()
        setAdminEmail(meData.email || '')
      }

      if (suspiciousRes.ok) {
        const items = await suspiciousRes.json()
        setSecurityAlerts(Array.isArray(items) ? items.length : 0)
      }
    } catch (error) {
      console.error('Failed to load admin sidebar data:', error)
    }
  }, [])

  useEffect(() => {
    loadSidebarData()
    const interval = setInterval(loadSidebarData, 60000)
    return () => clearInterval(interval)
  }, [loadSidebarData])

  const links = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      badge: bannedCount > 0 ? String(bannedCount) : null,
      badgeClass: 'bg-red-500/20 text-red-300 border-red-500/30',
    },
    {
      name: 'Emails',
      href: '/admin/emails',
      icon: Mail,
      badge: todayEmails > 0 ? String(todayEmails) : null,
      badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
    {
      name: 'Security',
      href: '/admin/security',
      icon: Shield,
      badge: securityAlerts > 0 ? String(securityAlerts) : null,
      badgeClass: 'bg-red-500/20 text-red-300 border-red-500/30',
    },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  const toggleCollapsed = () => setCollapsed((prev) => !prev)
  const closeMobile = () => setMobileOpen(false)

  // Desktop sidebar content — respects collapsed state
  const desktopSidebar = (
    <div
      className={`flex flex-col h-full text-white transition-all duration-300 ease-in-out ${
        collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED
      } bg-slate-900 border-r border-white/10`}
    >
      {/* Header */}
      <div className="relative flex items-center border-b border-white/10">
        <div className={`flex items-center gap-3 flex-1 min-w-0 ${collapsed ? 'p-4 justify-center' : 'p-6'}`}>
          <Mail className="w-6 h-6 text-cyan-400 shrink-0" />
          {!collapsed && (
            <>
              <span className="text-xl font-bold truncate">GhostMail</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30 uppercase tracking-wider font-bold ml-auto shrink-0">
                Admin
              </span>
            </>
          )}
        </div>
        {/* Collapse toggle — hidden on mobile, visible on desktop */}
        <button
          onClick={toggleCollapsed}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 hidden lg:flex items-center justify-center w-6 h-6 rounded-full border border-white/10 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors shadow-lg"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname.startsWith(link.href)
          return (
            <SidebarTooltip key={link.name} label={link.name} collapsed={collapsed}>
              <Link
                href={link.href}
                className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{link.name}</span>
                    {link.badge ? (
                      <span className={`rounded-full px-2 py-0.5 text-xs border shrink-0 ${link.badgeClass}`}>
                        {link.badge}
                      </span>
                    ) : null}
                  </>
                )}
                {collapsed && link.badge && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 border-2 border-slate-900 flex items-center justify-center text-[8px] font-bold text-white">
                    {link.badge}
                  </span>
                )}
              </Link>
            </SidebarTooltip>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10">
        {collapsed ? (
          <div className="p-3 flex flex-col items-center gap-3">
            <SidebarTooltip label={adminEmail || 'Admin'} collapsed={collapsed}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-sm font-bold shrink-0">
                {(adminEmail || 'A')[0]?.toUpperCase()}
              </div>
            </SidebarTooltip>
            <SidebarTooltip label="Logout" collapsed={collapsed}>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-9 h-9 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </SidebarTooltip>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Admin</p>
              <p className="mt-1 truncate text-sm font-medium text-white">{adminEmail || 'Unknown admin'}</p>
              <p className="mt-2 text-xs text-slate-500">GhostMail v2.0</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all font-medium border border-transparent hover:border-red-500/20"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  )

  // Mobile sidebar — always rendered expanded on mobile for better usability
  const mobileSidebar = (
    <div
      className={`flex flex-col h-full text-white bg-slate-900 border-r border-white/10 w-64`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-6 border-b border-white/10">
        <Mail className="w-6 h-6 text-cyan-400 shrink-0" />
        <span className="text-xl font-bold truncate">GhostMail</span>
        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30 uppercase tracking-wider font-bold ml-auto shrink-0">
          Admin
        </span>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 py-6 px-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname.startsWith(link.href)
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={closeMobile}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1 truncate">{link.name}</span>
              {link.badge ? (
                <span className={`rounded-full px-2 py-0.5 text-xs border shrink-0 ${link.badgeClass}`}>
                  {link.badge}
                </span>
              ) : null}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 space-y-4">
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Admin</p>
          <p className="mt-1 truncate text-sm font-medium text-white">{adminEmail || 'Unknown admin'}</p>
          <p className="mt-2 text-xs text-slate-500">GhostMail v2.0</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all font-medium border border-transparent hover:border-red-500/20"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile hamburger — visible on small screens */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 border border-white/10 text-white shadow-lg hover:bg-slate-800 transition-colors"
        aria-label="Open sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex shrink-0">{desktopSidebar}</aside>

      {/* Mobile sidebar overlay with backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
            onClick={closeMobile}
          />
          <div
            ref={mobilePanelRef}
            className="absolute left-0 top-0 h-full shadow-2xl animate-[slideIn_0.25s_ease-out]"
          >
            <div className="relative h-full">
              {mobileSidebar}
              <button
                onClick={closeMobile}
                className="absolute top-4 -right-12 flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 border border-white/10 text-white hover:bg-slate-800 transition-colors"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  )
}

