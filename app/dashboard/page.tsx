'use client';

import { useState, useEffect, useCallback } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { 
  Mail, 
  Send, 
  Trash2, 
  RotateCcw, 
  LogOut, 
  Plus, 
  Copy, 
  Check,
  ChevronLeft,
  Reply,
  Inbox,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type EmailItem = {
  id: number;
  toAddress: string;
  fromAddress: string;
  subject: string;
  bodyText: string;
  receivedAt: string;
  isRead: boolean;
  sent: boolean;
};

type FullEmail = EmailItem & {
  bodyHtml: string | null;
  rawHeaders: string | null;
};

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return date.toLocaleDateString();
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<FullEmail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [refreshCountdown, setRefreshCountdown] = useState(20);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Compose State
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  const fetchInbox = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/email/inbox');
      if (res.ok) {
        const data = await res.json();
        setEmails(data);
      }
    } catch (error) {
      console.error('Failed to fetch inbox', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setRefreshCountdown(20);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/login';
      return;
    }

    if (status !== 'authenticated') {
      return;
    }

    fetchInbox(true);

    const eventSource = new EventSource('/api/email/stream');
    eventSource.onmessage = () => {
      fetchInbox();
      setRefreshCountdown(20);
    };
    eventSource.onerror = () => {
      eventSource.close();
    };

    const interval = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          fetchInbox();
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      eventSource.close();
      clearInterval(interval);
    };
  }, [fetchInbox, status]);

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') return null;

  const copyEmail = () => {
    if (session?.user?.email) {
      navigator.clipboard.writeText(session.user.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openEmail = async (id: number) => {
    setLoadingEmail(true);
    try {
      const res = await fetch(`/api/email/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedEmail(data);
        setEmails(emails.map(e => e.id === id ? { ...e, isRead: true } : e));
      }
    } catch (error) {
      console.error('Failed to fetch email details', error);
    } finally {
      setLoadingEmail(false);
    }
  };

  const deleteEmail = async (id: number) => {
    if (!confirm('Are you sure you want to delete this email?')) return;
    try {
      const res = await fetch(`/api/email/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEmails(emails.filter(e => e.id !== id));
        setSelectedEmail(null);
      }
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: composeTo, subject: composeSubject, body: composeBody }),
      });
      if (res.ok) {
        alert('Email sent successfully!');
        setIsComposeOpen(false);
        setComposeTo('');
        setComposeSubject('');
        setComposeBody('');
        fetchInbox();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to send email');
      }
    } catch {
      alert('Error sending email');
    } finally {
      setIsSending(false);
    }
  };

  const handleReply = () => {
    if (selectedEmail) {
      setComposeTo(selectedEmail.fromAddress);
      setComposeSubject(`Re: ${selectedEmail.subject}`);
      setComposeBody(`\n\n--- On ${new Date(selectedEmail.receivedAt).toLocaleString()}, ${selectedEmail.fromAddress} wrote: ---\n\n${selectedEmail.bodyText}`);
      setIsComposeOpen(true);
    }
  };

  const unreadCount = emails.filter(e => !e.isRead && !e.sent).length;

  return (
    <div className="flex h-screen bg-[#0a0f1e] text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 bg-[#0d1425] border-r border-white/5 flex flex-col relative z-20">
        <div className="p-6">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-8 flex items-center gap-2">
            <Mail className="w-6 h-6 text-cyan-400" />
            GhostMail
          </h2>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-lg text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                {session?.user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm text-white truncate">{session?.user?.name || 'User'}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Active Account</div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 bg-black/40 p-2 rounded-lg border border-white/5 group relative">
              <span className="text-xs text-cyan-400 truncate flex-1 font-mono">{session?.user?.email}</span>
              <button onClick={copyEmail} className="p-1 hover:bg-white/10 rounded transition-colors text-slate-400 hover:text-white">
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
              
              {copied && (
                <div className="absolute -top-10 right-0 bg-emerald-500 text-white text-[10px] px-2 py-1 rounded shadow-lg animate-bounce">
                  Copied!
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={() => setIsComposeOpen(true)}
            className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 mb-8"
          >
            <Plus className="w-5 h-5" />
            Compose
          </button>

          <nav className="space-y-1">
            <button className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium bg-white/5 text-cyan-400 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Inbox className="w-5 h-5" />
                Inbox
              </div>
              {unreadCount > 0 && (
                <span className="bg-cyan-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => fetchInbox(true)}
              disabled={isRefreshing}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <RotateCcw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
              Refresh
              <span className="ml-auto text-[10px] text-slate-600">{refreshCountdown}s</span>
            </button>
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/5">
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Inbox List */}
      <div className={`${selectedEmail ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-[450px] border-r border-white/5 bg-[#080d19]/50 relative z-10`}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-bold">Messages</h2>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Auto-refresh active
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-12 text-center">
              <RotateCcw className="w-8 h-8 text-cyan-500 animate-spin mx-auto mb-4" />
              <p className="text-slate-500 text-sm">Loading your messages...</p>
            </div>
          ) : emails.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <Inbox className="w-8 h-8 text-slate-700" />
              </div>
              <p className="text-slate-500 text-sm max-w-[200px]">Your inbox is empty. Give your address to someone!</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {emails.map((email) => (
                <button
                  key={email.id}
                  onClick={() => openEmail(email.id)}
                  className={`w-full text-left p-6 transition-all border-l-4 ${
                    selectedEmail?.id === email.id 
                      ? 'bg-cyan-500/10 border-cyan-500' 
                      : 'hover:bg-white/5 border-transparent'
                  } relative`}
                >
                  {!email.isRead && !email.sent && (
                    <div className="absolute top-7 left-2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                  )}
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-bold truncate ${!email.isRead && !email.sent ? 'text-white' : 'text-slate-400'}`}>
                      {email.fromAddress}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">{formatRelativeTime(email.receivedAt)}</span>
                  </div>
                  <div className={`text-sm mb-1 truncate ${!email.isRead && !email.sent ? 'text-cyan-400 font-bold' : 'text-slate-300'}`}>
                    {email.subject}
                  </div>
                  <div className="text-xs text-slate-500 truncate line-clamp-1">
                    {email.bodyText.substring(0, 80)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Email Detail Panel */}
      <div className={`${!selectedEmail ? 'hidden lg:flex' : 'flex'} flex-col flex-1 bg-[#0a0f1e] relative z-0`}>
        {selectedEmail ? (
          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedEmail.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 bg-[#0d1425] flex items-center justify-between">
                <button 
                  onClick={() => setSelectedEmail(null)}
                  className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white bg-white/5 rounded-lg mr-4"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <button onClick={handleReply} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-slate-300 transition-all">
                    <Reply className="w-4 h-4 text-cyan-400" />
                    Reply
                  </button>
                  <button onClick={() => deleteEmail(selectedEmail.id)} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500/20 rounded-lg text-sm text-slate-300 hover:text-red-400 transition-all">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-8 bg-gradient-to-b from-[#0d1425] to-transparent">
                <h1 className="text-3xl font-bold text-white mb-6 leading-tight">{selectedEmail.subject}</h1>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-xl font-bold text-cyan-400 border border-white/10">
                    {selectedEmail.fromAddress[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-white truncate">{selectedEmail.fromAddress}</p>
                      <p className="text-xs text-slate-500">{new Date(selectedEmail.receivedAt).toLocaleString()}</p>
                    </div>
                    <p className="text-sm text-slate-400">to <span className="text-cyan-400">{selectedEmail.toAddress}</span></p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-8 bg-white/2 rounded-t-[32px] border-t border-white/5 mx-4">
                {loadingEmail ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                    <RotateCcw className="w-8 h-8 animate-spin mb-4 text-cyan-500" />
                    Loading content...
                  </div>
                ) : selectedEmail.bodyHtml ? (
                  <div className="bg-white rounded-2xl overflow-hidden shadow-2xl h-full min-h-[500px]">
                    <iframe
                      title="email-content"
                      sandbox="allow-popups allow-popups-to-escape-sandbox"
                      srcDoc={`
                        <html>
                          <head>
                            <style>
                              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 30px; }
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
                  <pre className="p-8 bg-[#0d1425] rounded-2xl border border-white/10 text-slate-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {selectedEmail.bodyText}
                  </pre>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-700">
            <div className="w-32 h-32 rounded-full bg-white/2 flex items-center justify-center mb-8 border border-white/5">
              <Mail className="w-16 h-16 opacity-20" />
            </div>
            <h2 className="text-2xl font-bold text-slate-600">Select a message to read</h2>
            <p className="text-sm text-slate-700 mt-2">Your private communications are safe here</p>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      <AnimatePresence>
        {isComposeOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsComposeOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-[#0d1425] border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative z-10"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/2">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Send className="w-5 h-5 text-cyan-400" />
                  New Message
                </h3>
                <button 
                  onClick={() => setIsComposeOpen(false)}
                  className="p-2 text-slate-500 hover:text-white transition-colors"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <form onSubmit={handleSend} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1 ml-1">Recipient</label>
                  <input 
                    required
                    type="email"
                    placeholder="example@gmail.com"
                    value={composeTo}
                    onChange={(e) => setComposeTo(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1 ml-1">Subject</label>
                  <input 
                    required
                    type="text"
                    placeholder="Enter subject..."
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1 ml-1">Message</label>
                  <textarea 
                    required
                    rows={8}
                    placeholder="Write your message here..."
                    value={composeBody}
                    onChange={(e) => setComposeBody(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all resize-none custom-scrollbar"
                  />
                </div>
                <div className="flex items-center justify-between pt-4">
                  <p className="text-xs text-slate-500">Sending as: <span className="text-cyan-400 font-mono">{session?.user?.email}</span></p>
                  <button 
                    disabled={isSending}
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSending ? (
                      <RotateCcw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    Send Email
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
