import { db } from '@/lib/db';
import { Users, Mail, Activity, Clock, RefreshCcw } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const totalUsers = await db.user.count();
  const totalEmails = await db.email.count();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const emailsToday = await db.email.count({
    where: { receivedAt: { gte: today } }
  });

  const recentEmails = await db.email.findMany({
    take: 10,
    orderBy: { receivedAt: 'desc' },
    include: { user: { select: { username: true } } }
  });

  const recentUsers = await db.user.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { emails: true } } }
  });

  async function refresh() {
    'use server';
    revalidatePath('/admin/dashboard');
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
          <p className="text-slate-400">System statistics and recent activity</p>
        </div>
        <form action={refresh}>
          <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 transition-all">
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Total Users</p>
              <h3 className="text-2xl font-bold text-white">{totalUsers.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-xl">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Total Emails</p>
              <h3 className="text-2xl font-bold text-white">{totalEmails.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Emails Today</p>
              <h3 className="text-2xl font-bold text-white">{emailsToday.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Server Status</p>
              <h3 className="text-2xl font-bold text-emerald-400">Online</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <h2 className="text-xl font-bold mb-6 text-white">Latest Emails</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="pb-3 font-medium">From</th>
                  <th className="pb-3 font-medium">To</th>
                  <th className="pb-3 font-medium">Subject</th>
                  <th className="pb-3 font-medium text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentEmails.map((email: { id: number; fromAddress: string; toAddress: string; subject: string; receivedAt: Date }) => (
                  <tr key={email.id} className="text-slate-300">
                    <td className="py-3 truncate max-w-[120px]">{email.fromAddress}</td>
                    <td className="py-3 text-cyan-400 truncate max-w-[120px]">{email.toAddress}</td>
                    <td className="py-3 truncate max-w-[150px]">{email.subject}</td>
                    <td className="py-3 text-right text-slate-500 whitespace-nowrap text-xs">
                      {new Date(email.receivedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
                {recentEmails.length === 0 && (
                  <tr><td colSpan={4} className="py-4 text-center text-slate-500">No emails yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <h2 className="text-xl font-bold mb-6 text-white">Latest Users</h2>
          <div className="space-y-4">
            {recentUsers.map((user: { id: number; username: string; email: string; _count: { emails: number }; createdAt: Date }) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <p className="font-bold text-white">{user.username}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-cyan-400">{user._count.emails} emails</p>
                  <p className="text-[10px] text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {recentUsers.length === 0 && (
              <div className="text-center text-slate-500 py-4">No users yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
