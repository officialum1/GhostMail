// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Mail, Menu, X, ArrowRight, LayoutDashboard } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/api-docs', label: 'API' },
  { href: '/status', label: 'Status' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const pathname = usePathname() || '/'
  const { data: session, status } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileOpen])

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-200 ${
          scrolled
            ? 'border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#07090e]/80 backdrop-blur-xl shadow-sm'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-sm shadow-cyan-500/20 transition-transform group-hover:scale-105">
              <Mail className="h-4.5 w-4.5 text-slate-950 font-bold" />
            </span>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              Ghost<span className="text-cyan-500">Mail</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden items-center gap-1 rounded-full border border-slate-200/60 dark:border-white/5 bg-slate-100/50 dark:bg-white/[0.03] px-3 py-1.5 backdrop-blur md:flex">
            {navLinks.map((link) => {
              const active =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href)

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                    active
                      ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Desktop CTA & Theme Toggle */}
          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            {status === 'loading' ? (
              <div className="h-8 w-24 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />
            ) : session ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 transition-all hover:scale-[1.02]"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Inbox
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 transition-all hover:scale-[1.02]"
                >
                  Get Free Mail
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white transition"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 dark:bg-[#07090e]/95 backdrop-blur-2xl px-6 pt-20 pb-8 md:hidden flex flex-col justify-between overflow-y-auto">
          <nav className="flex flex-col gap-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 mb-1">Navigation</div>
            {navLinks.map((link) => {
              const active =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href)

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <span>{link.label}</span>
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />}
                </Link>
              )
            })}
          </nav>

          {/* Mobile Drawer Bottom CTAs */}
          <div className="pt-6 border-t border-slate-200 dark:border-white/10 space-y-3">
            {session ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-cyan-500 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20"
              >
                <LayoutDashboard className="h-4 w-4" />
                Go to Inbox Dashboard
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 py-3 text-xs font-bold text-slate-900 dark:text-white"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center rounded-xl bg-cyan-500 py-3 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20"
                >
                  Claim Free Mail
                </Link>
              </div>
            )}
            <p className="text-center text-[11px] text-slate-500">
              GhostMail v2.0 • Ultra-fast disposable mail
            </p>
          </div>
        </div>
      )}
    </>
  )
}
