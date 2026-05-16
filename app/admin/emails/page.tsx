'use client';

import { useState, useEffect } from 'react';
import { Mail, Trash2, Eye, X, Clock, User, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import ClientDate from '@/components/ClientDate';

type Email = {
  id: number;
  fromAddress: string;
  toAddress: string;
  subject: string;
  bodyText: string;
  bodyHtml: string | null;
  receivedAt: string;
  user: {
    username: string;
  };
};

export default function AdminEmailsPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  const fetchEmails = async () => {
    try {
      const res = await fetch('/api/admin/emails');
      if (res.ok) {
        const data = await res.json();
        setEmails(data);
      }
    } catch (error) {
      console.error('Failed to fetch emails:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const deleteEmail = async (id: number) => {
    if (!confirm('Are you sure you want to delete this email?')) return;
    try {
      const res = await fetch(`/api/admin/emails/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEmails(emails.filter(e => e.id !== id));
        if (selectedEmail?.id === id) setSelectedEmail(null);
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <div className="p-8 lg:p-12 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight flex items-center gap-4">
            <Mail className="w-10 h-10 text-cyan-500" />
            Email Traffic
          </h1>
          <p className="text-slate-400 text-lg">Monitor all incoming and outgoing messages</p>
        </div>
        <div className="px-6 py-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-cyan-400 font-bold">
          {emails.length} Total Messages
        </div>
      </div>

      <div className="bg-[#0d1425] border border-white/5 rounded-[40px] shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/2 border-b border-white/5 text-slate-500">
                <th className="px-8 py-6 font-bold uppercase tracking-widest text-xs">From</th>
                <th className="px-8 py-6 font-bold uppercase tracking-widest text-xs">To (User)</th>
                <th className="px-8 py-6 font-bold uppercase tracking-widest text-xs">Subject</th>
                <th className="px-8 py-6 font-bold uppercase tracking-widest text-xs">Received At</th>
                <th className="px-8 py-6 font-bold uppercase tracking-widest text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {emails.map((email) => (
                <tr 
                  key={email.id} 
                  className="group hover:bg-white/2 transition-all cursor-pointer"
                  onClick={() => setSelectedEmail(email)}
                >
                  <td className="px-8 py-6">
                    <div className="max-w-[200px] truncate font-medium text-white">{email.fromAddress}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-3 h-3 text-cyan-500" />
                      <span className="font-bold text-cyan-400">{email.user.username}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="max-w-[300px] truncate text-slate-400">{email.subject}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Clock className="w-4 h-4" />
                      <ClientDate date={email.receivedAt} />
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setSelectedEmail(email)}
                        className="p-3 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => deleteEmail(email.id)}
                        className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && (
            <div className="p-20 text-center text-slate-500">
              <Mail className="w-20 h-20 mx-auto mb-6 opacity-10 animate-pulse" />
              <p className="text-xl">Loading traffic data...</p>
            </div>
          )}
          {!loading && emails.length === 0 && (
            <div className="p-20 text-center text-slate-500">
              <Mail className="w-20 h-20 mx-auto mb-6 opacity-10" />
              <p className="text-xl">No email traffic recorded</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedEmail && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEmail(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-4xl bg-[#0d1425] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/2">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-cyan-500/10 text-cyan-400 rounded-2xl">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white leading-tight">{selectedEmail.subject || '(No Subject)'}</h3>
                    <p className="text-slate-500 text-sm">Message ID: #{selectedEmail.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedEmail(null)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 bg-black/20 flex flex-wrap gap-8 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg text-slate-500"><User className="w-4 h-4" /></div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1">From</p>
                    <p className="text-white font-mono text-sm">{selectedEmail.fromAddress}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg text-slate-500"><ArrowRight className="w-4 h-4" /></div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1">Target User</p>
                    <p className="text-cyan-400 font-bold">{selectedEmail.user.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-auto">
                  <div className="p-2 bg-white/5 rounded-lg text-slate-500"><Clock className="w-4 h-4" /></div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1">Received</p>
                    <p className="text-slate-400 text-sm">
                      <ClientDate date={selectedEmail.receivedAt} />
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {selectedEmail.bodyHtml ? (
                  <div className="bg-white rounded-3xl overflow-hidden shadow-inner h-full min-h-[400px]">
                    <iframe
                      title="admin-email-view"
                      sandbox="allow-popups"
                      srcDoc={`
                        <html>
                          <head>
                            <style>
                              body { font-family: sans-serif; line-height: 1.6; color: #333; margin: 30px; }
                              img { max-width: 100%; height: auto; }
                            </style>
                          </head>
                          <body>${selectedEmail.bodyHtml}</body>
                        </html>
                      `}
                      className="w-full h-full border-0"
                    />
                  </div>
                ) : (
                  <div className="p-8 bg-black/40 rounded-3xl border border-white/5 text-slate-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {selectedEmail.bodyText}
                  </div>
                )}
              </div>

              <div className="p-8 bg-white/2 border-t border-white/10 flex justify-end gap-4">
                <button 
                  onClick={() => setSelectedEmail(null)}
                  className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all"
                >
                  Close Window
                </button>
                <button 
                  onClick={() => deleteEmail(selectedEmail.id)}
                  className="px-8 py-3 bg-red-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-red-500/20"
                >
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
