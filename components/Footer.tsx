'use client';

import Link from 'next/link';
import { Code2, Mail, Send } from 'lucide-react';

const footerGroups = [
  {
    title: 'Product',
    links: [
      { href: '/#features', label: 'Features' },
      { href: '/#how-it-works', label: 'How It Works' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/#changelog', label: 'Changelog' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/blog', label: 'Blog' },
      { href: '/press', label: 'Press' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/terms', label: 'Terms of Service' },
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/cookie-policy', label: 'Cookie Policy' },
      { href: '/gdpr', label: 'GDPR' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#060d1a]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[1.35fr_repeat(3,1fr)]">
          <div className="space-y-5">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500">
                <Mail className="h-5 w-5 text-white" />
              </span>
              <span className="text-xl font-semibold text-white">GhostMail</span>
            </Link>
            <p className="max-w-sm text-sm leading-7 text-slate-400">
              Privacy-first email for the modern web. Claim your personal
              GhostMail address and keep your real inbox clean.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="https://x.com"
                className="rounded-full border border-white/10 p-2.5 text-slate-400 transition hover:border-cyan-400/40 hover:text-cyan-300"
                aria-label="GhostMail on X"
              >
                <Send className="h-4 w-4" />
              </Link>
              <Link
                href="https://github.com"
                className="rounded-full border border-white/10 p-2.5 text-slate-400 transition hover:border-cyan-400/40 hover:text-cyan-300"
                aria-label="GhostMail on GitHub"
              >
                <Code2 className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                {group.title}
              </h3>
              <div className="space-y-3">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-sm text-slate-400 transition hover:text-cyan-300"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/6 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© 2025 GhostMail. All rights reserved.</p>
          <p>Made with love for privacy lovers worldwide</p>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
