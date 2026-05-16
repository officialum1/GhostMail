'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Mail, Settings, LogOut } from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const [bannedCount, setBannedCount] = useState(0);
  const [todayEmails, setTodayEmails] = useState(0);
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    const loadSidebarData = async () => {
      try {
        const [usersRes, emailsRes, meRes] = await Promise.all([
          fetch('/api/admin/users?limit=1'),
          fetch('/api/admin/emails?limit=1'),
          fetch('/api/admin/me'),
        ]);

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setBannedCount(usersData.stats?.banned || 0);
        }

        if (emailsRes.ok) {
          const emailsData = await emailsRes.json();
          setTodayEmails(emailsData.stats?.today || 0);
        }

        if (meRes.ok) {
          const meData = await meRes.json();
          setAdminEmail(meData.email || '');
        }
      } catch (error) {
        console.error('Failed to load admin sidebar data:', error);
      }
    };

    loadSidebarData();
  }, []);

  const links = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users, badge: bannedCount > 0 ? String(bannedCount) : null, badgeClass: 'bg-red-500/20 text-red-300 border-red-500/30' },
    { name: 'Emails', href: '/admin/emails', icon: Mail, badge: todayEmails > 0 ? String(todayEmails) : null, badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="w-64 bg-slate-900 border-r border-white/10 flex flex-col h-screen text-white">
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <Mail className="w-6 h-6 text-cyan-400" />
        <span className="text-xl font-bold">GhostMail</span>
        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30 uppercase tracking-wider font-bold ml-auto">Admin</span>
      </div>

      <div className="flex-1 py-6 px-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                isActive 
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1">{link.name}</span>
              {link.badge ? (
                <span className={`rounded-full px-2 py-0.5 text-xs border ${link.badgeClass}`}>
                  {link.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/10 space-y-4">
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Admin</p>
          <p className="mt-1 truncate text-sm font-medium text-white">{adminEmail || 'Unknown admin'}</p>
          <p className="mt-2 text-xs text-slate-500">GhostMail v1.0</p>
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
  );
}
