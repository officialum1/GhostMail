import { db } from '@/lib/db';
import { Users, Mail, Activity, Clock } from 'lucide-react';

export default async function AdminDashboard() {
  const totalUsers = await db.user.count();
  const totalEmails = await db.email.count();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const emailsToday = await db.email.count({
    where: { receivedAt: { gte: today } }
  });

  const recentEmails = await db.email.findMany({
    take: 20,
    orderBy: { receivedAt: 'desc' },
    include: { user: true }
  });

  const recentUsers = await db.user.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' }
  });

  // Prisma doesn't easily support group by with count for relations in a way that returns the user object directly,
  // so we approximate active users by grouping.
  const topUsersData = await db.email.groupBy({
    by: ['userId'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5
  });

  const topUserIds = topUsersData.map(d => d.userId);
  const topUsersObjects = await db.user.findMany({
    where: { id: { in: topUserIds } }
  });

  const topUsers = topUsersData.map(data => {
    const user = topUsersObjects.find(u => u.id === data.userId);
    return {
      username: user?.username || 'Unknown',
      emailCount: data._count.id
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-slate-400">System statistics and recent activity</p>
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
              <p className="text-sm text-slate-400 font-medium">Most Active User</p>
              <h3 className="text-lg font-bold text-white truncate max-w-[120px]" title={topUsers[0]?.username || 'N/A'}>
                {topUsers[0]?.username || 'N/A'}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <h2 className="text-xl font-bold mb-6 text-white">Recent Emails</h2>
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
                {recentEmails.map((email) => (
                  <tr key={email.id} className="text-slate-300">
                    <td className="py-3 truncate max-w-[150px]">{email.fromAddress}</td>
                    <td className="py-3 text-cyan-400 truncate max-w-[150px]">{email.toAddress}</td>
                    <td className="py-3 truncate max-w-[200px]">{email.subject}</td>
                    <td className="py-3 text-right text-slate-500 whitespace-nowrap">
                      {new Date(email.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
          <h2 className="text-xl font-bold mb-6 text-white">Recent Users</h2>
          <div className="space-y-4">
            {recentUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{user.username}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
                <div className="text-xs text-slate-500">
                  {new Date(user.createdAt).toLocaleDateString()}
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
