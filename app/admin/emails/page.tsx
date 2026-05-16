'use client';

import { useState, useEffect } from 'react';
import { Search, Trash2, Eye } from 'lucide-react';

type Email = {
  id: number;
  fromAddress: string;
  toAddress: string;
  subject: string;
  receivedAt: string;
  user: {
    username: string;
  };
};

export default function AdminEmailsPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/emails?search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setEmails(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchEmails();
    }, 500);
    return () => clearTimeout(delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this email?')) return;
    try {
      const res = await fetch(`/api/admin/emails/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEmails(emails.filter(e => e.id !== id));
      } else {
        alert('Failed to delete email');
      }
    } catch (e) {
      console.error(e);
      alert('Error deleting email');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Emails Explorer</h1>
          <p className="text-slate-400">View and manage all system emails</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search subject, from, or to..." 
            className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/20">
              <tr className="text-slate-400">
                <th className="px-6 py-4 font-medium">From</th>
                <th className="px-6 py-4 font-medium">To (User)</th>
                <th className="px-6 py-4 font-medium">Subject</th>
                <th className="px-6 py-4 font-medium">Received At</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading...</td></tr>
              ) : emails.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No emails found</td></tr>
              ) : (
                emails.map((email) => (
                  <tr key={email.id} className="text-slate-300 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 truncate max-w-[200px]">{email.fromAddress}</td>
                    <td className="px-6 py-4">
                      <div className="text-cyan-400">{email.toAddress}</div>
                      <div className="text-xs text-slate-500">@{email.user?.username}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-white truncate max-w-[300px]">{email.subject}</td>
                    <td className="px-6 py-4 text-slate-400">{new Date(email.receivedAt).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => alert('View email is not fully implemented in this demo admin view')}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="View email"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(email.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Delete email"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
