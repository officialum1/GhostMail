import { db } from '@/lib/db';
import { Users, Trash2, Mail, Calendar } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { emails: true }
      }
    }
  });

  async function deleteUser(formData: FormData) {
    'use server';
    const id = formData.get('id');
    if (!id) return;

    try {
      await db.user.delete({
        where: { id: parseInt(id.toString()) }
      });
      revalidatePath('/admin/users');
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  }

  return (
    <div className="p-8 lg:p-12 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight flex items-center gap-4">
            <Users className="w-10 h-10 text-blue-500" />
            User Management
          </h1>
          <p className="text-slate-400 text-lg">Manage registered accounts and monitor their activity</p>
        </div>
        <div className="px-6 py-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400 font-bold">
          {users.length} Total Users
        </div>
      </div>

      <div className="bg-[#0d1425] border border-white/5 rounded-[40px] shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/2 border-b border-white/5 text-slate-500">
                <th className="px-8 py-6 font-bold uppercase tracking-widest text-xs">#</th>
                <th className="px-8 py-6 font-bold uppercase tracking-widest text-xs">Identity</th>
                <th className="px-8 py-6 font-bold uppercase tracking-widest text-xs">Email Address</th>
                <th className="px-8 py-6 font-bold uppercase tracking-widest text-xs">Joined</th>
                <th className="px-8 py-6 font-bold uppercase tracking-widest text-xs">Traffic</th>
                <th className="px-8 py-6 font-bold uppercase tracking-widest text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user, index) => (
                <tr key={user.id} className="group hover:bg-white/2 transition-all">
                  <td className="px-8 py-6 text-slate-600 font-mono text-sm">{index + 1}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-lg">
                        {user.username[0].toUpperCase()}
                      </div>
                      <span className="font-bold text-white text-lg">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-4 py-2 bg-black/40 border border-white/5 rounded-xl text-cyan-400 font-mono text-sm">
                      {user.email}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="w-4 h-4" />
                      {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                        <Mail className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-white">{user._count.emails} emails</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <form action={deleteUser} onSubmit={(e) => {
                      if (!confirm('Are you sure? This deletes all their emails too.')) e.preventDefault();
                    }}>
                      <input type="hidden" name="id" value={user.id} />
                      <button 
                        type="submit"
                        className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all active:scale-90"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="p-20 text-center text-slate-500">
              <Users className="w-20 h-20 mx-auto mb-6 opacity-10" />
              <p className="text-xl">No users found in database</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
