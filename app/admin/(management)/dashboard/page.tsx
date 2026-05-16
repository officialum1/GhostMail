import { db } from '@/lib/db';
import { Users, Mail, Activity, Clock, RefreshCcw } from 'lucide-react';
import { refreshDashboard } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const totalUsers = await db.user.count();
  const totalEmails = await db.email.count();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const emailsToday = await db.email.count({
    where: { receivedAt: { gte: today } }
  });

  const recentUsers = await db.user.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { emails: true } } }
  });

  const recentEmails = await db.email.findMany({
    take: 10,
    orderBy: { receivedAt: 'desc' },
    include: { user: { select: { username: true, email: true } } }
  });

  return (
    <div className="space-y-8 p-6 lg:p-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">System Overview</h1>
          <p className="text-slate-400">Live monitoring and system metrics</p>
        </div>
        <form action={refreshDashboard}>
          <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-200 transition-all active:scale-95 font-medium">
            <RefreshCcw className="w-4 h-4" />
            Refresh Data
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#0d1425] border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-10 -mt-10 rounded-full"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-4 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Total Users</p>
              <h3 className="text-3xl font-bold text-white tracking-tight" suppressHydrationWarning>{totalUsers.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-[#0d1425] border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl -mr-10 -mt-10 rounded-full"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-4 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/20">
              <Mail className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Total Emails</p>
              <h3 className="text-3xl font-bold text-white tracking-tight" suppressHydrationWarning>{totalEmails.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-[#0d1425] border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -mr-10 -mt-10 rounded-full"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Today&apos;s Traffic</p>
              <h3 className="text-3xl font-bold text-white tracking-tight" suppressHydrationWarning>{emailsToday.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-[#0d1425] border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl -mr-10 -mt-10 rounded-full"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Status</p>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                <h3 className="text-xl font-bold text-emerald-400 tracking-tight">System Online</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-[#0d1425] border border-white/5 rounded-[32px] p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-400" />
              Recent Registrations
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 text-slate-500">
                  <th className="pb-4 font-bold uppercase tracking-widest text-[10px]">User</th>
                  <th className="pb-4 font-bold uppercase tracking-widest text-[10px]">Email Address</th>
                  <th className="pb-4 font-bold uppercase tracking-widest text-[10px]">Joined</th>
                  <th className="pb-4 font-bold uppercase tracking-widest text-[10px] text-right">Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentUsers.map((user: { id: number; username: string; email: string; createdAt: Date; _count: { emails: number } }) => (
                  <tr key={user.id} className="group hover:bg-white/2 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-xs">
                          {user.username[0].toUpperCase()}
                        </div>
                        <span className="font-bold text-white">{user.username}</span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-400 font-mono">{user.email}</td>
                    <td className="py-4 text-slate-500" suppressHydrationWarning>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 text-right">
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-bold border border-blue-500/20">
                        {user._count.emails} emails
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[#0d1425] border border-white/5 rounded-[32px] p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Mail className="w-5 h-5 text-cyan-400" />
              Latest Email Traffic
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 text-slate-500">
                  <th className="pb-4 font-bold uppercase tracking-widest text-[10px]">From</th>
                  <th className="pb-4 font-bold uppercase tracking-widest text-[10px]">To (User)</th>
                  <th className="pb-4 font-bold uppercase tracking-widest text-[10px]">Subject</th>
                  <th className="pb-4 font-bold uppercase tracking-widest text-[10px] text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentEmails.map((email: { id: number; fromAddress: string; subject: string; receivedAt: Date; user: { username: string } }) => (
                  <tr key={email.id} className="group hover:bg-white/2 transition-colors">
                    <td className="py-4">
                      <p className="text-white font-medium truncate max-w-[140px]">{email.fromAddress}</p>
                    </td>
                    <td className="py-4">
                      <p className="text-cyan-400 text-xs font-bold truncate max-w-[120px]">{email.user.username}</p>
                    </td>
                    <td className="py-4 text-slate-400 truncate max-w-[150px]">{email.subject}</td>
                    <td className="py-4 text-right text-slate-500 text-[10px] font-mono" suppressHydrationWarning>
                      {new Date(email.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
