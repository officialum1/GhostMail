// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

'use client'

import Link from 'next/link'
import { Mail, Terminal } from 'lucide-react'

const footerGroups = [
  {
    title: 'Product',
    links: [
      { href: '/#features', label: 'Features' },
      { href: '/#how-it-works', label: 'How It Works' },
      { href: '/pricing', label: 'Pricing & Pro' },
      { href: '/api-docs', label: 'Developer API' },
      { href: '/status', label: 'System Status' },
    ],
  },
  {
    title: 'Use Cases',
    links: [
      { href: '/receive-otp-online', label: 'Receive OTP Online' },
      { href: '/free-email-address', label: 'Free Email Address' },
      { href: '/burner-email', label: 'Burner Inbox' },
      { href: '/temporary-email-alternative', label: 'Temporary Email' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: '/about', label: 'About GhostMail' },
      { href: '/faq', label: 'Help & FAQ' },
      { href: '/contact', label: 'Contact Support' },
      { href: '/blog', label: 'Privacy Blog' },
    ],
  },
  {
    title: 'Legal & Integrations',
    links: [
      { href: '/terms', label: 'Terms of Service' },
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/email-for-reddit', label: 'Reddit Verification' },
      { href: '/email-for-discord', label: 'Discord Verification' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-[#07090e] transition-colors">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.3fr_repeat(4,1fr)]">
          {/* Brand info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-sm shadow-cyan-500/20">
                <Mail className="h-4.5 w-4.5 text-slate-950 font-bold" />
              </span>
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Ghost<span className="text-cyan-500">Mail</span>
              </span>
            </Link>
            <p className="max-w-sm text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              High-speed, disposable & custom email architecture built for developers, security testers, and privacy enthusiasts worldwide.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-600 dark:text-cyan-400">
              <Terminal className="h-3.5 w-3.5" />
              <span>REST API v1 Active (120 req/m)</span>
            </div>
          </div>

          {/* Nav Categories */}
          {footerGroups.map((group) => (
            <div key={group.title} className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-300">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-xs text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-slate-200 dark:border-white/5 pt-6 text-xs text-slate-500 dark:text-slate-400">
          <div>
            © {new Date().getFullYear()} GhostMail. All rights reserved.
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-700 dark:text-slate-300">Cloudflare Edge & SMTP Operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
