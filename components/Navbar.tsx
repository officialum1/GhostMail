'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Mail, Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
  { href: '/blog', label: 'Blog' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/status', label: 'Status' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const pathname = usePathname() || '/';
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);

    onScroll();
    window.addEventListener('scroll', onScroll);

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b transition-all ${
          scrolled
            ? 'border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#09101c]/90 backdrop-blur-xl'
            : 'border-transparent bg-white/60 dark:bg-[#09101c]/60 backdrop-blur-lg'
        }`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-[0_16px_40px_rgba(34,211,238,0.22)]">
              <Mail className="h-5 w-5 text-slate-900 dark:text-white" />
            </span>
            <span className="text-lg font-semibold text-slate-900 dark:text-white">
              GhostMail
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => {
              const active =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    active ? 'text-cyan-400' : 'text-slate-600 dark:text-slate-300 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {status === 'loading' ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
            ) : session ? (
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-sm font-semibold text-slate-900 dark:text-white transition hover:opacity-90"
                >
                  <Mail className="h-4 w-4" />
                  Go to Inbox
                </Link>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-sm font-bold text-slate-900 dark:text-white">
                  {session.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 transition hover:text-white"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-sm font-semibold text-slate-900 dark:text-white transition hover:opacity-90"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white md:hidden"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 bg-white/98 dark:bg-[#060c17]/98 px-6 pt-28 md:hidden">
          <nav className="mx-auto flex max-w-xl flex-col gap-4">
            {navLinks.map((link) => {
              const active =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-2xl border px-5 py-4 text-lg font-medium transition ${
                    active
                      ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300'
                      : 'border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {status === 'loading' ? (
              <div className="mt-6 h-12 animate-pulse rounded-2xl bg-slate-200 dark:bg-white/10" />
            ) : session ? (
              <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-4 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-sm font-bold text-slate-900 dark:text-white">
                    {session.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900 dark:text-white">
                      {session.user?.name || 'User'}
                    </p>
                    <p className="truncate text-sm text-cyan-300">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-4 text-center font-semibold text-slate-900 dark:text-white"
                >
                  Go to Inbox
                </Link>
              </div>
            ) : (
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href="/login"
                  className="rounded-2xl border border-slate-200 dark:border-white/10 px-5 py-4 text-center font-medium text-slate-900 dark:text-white"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-4 text-center font-semibold text-slate-900 dark:text-white"
                >
                  Get Started
                </Link>
              </div>
            )}
          </nav>
        </div>
      ) : null}
    </>
  );
}
