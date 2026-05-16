'use client';

import { useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';

type EmailItem = {
  id: number;
  toAddress: string;
  fromAddress: string;
  subject: string;
  bodyText: string;
  receivedAt: string;
  isRead: boolean;
};

type FullEmail = EmailItem & {
  bodyHtml: string | null;
  rawHeaders: string | null;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<FullEmail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingEmail, setLoadingEmail] = useState(false);

  const fetchInbox = async () => {
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
    }
  };

  useEffect(() => {
    fetchInbox();
    const interval = setInterval(fetchInbox, 30000); // 30s polling
    return () => clearInterval(interval);
  }, []);

  const openEmail = async (id: number) => {
    setLoadingEmail(true);
    try {
      const res = await fetch(`/api/email/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedEmail(data);
        // Mark as read in local state
        setEmails(emails.map(e => e.id === id ? { ...e, isRead: true } : e));
      }
    } catch (error) {
      console.error('Failed to fetch email details', error);
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            GhostMail
          </h2>
        </div>
        <div className="p-4 flex-1">
          <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Account</div>
          <div className="text-sm font-medium text-gray-300 break-all bg-gray-800/50 p-3 rounded-lg border border-gray-700">
            {session?.user?.email}
          </div>
          
          <div className="mt-8 space-y-2">
            <button
              onClick={() => { setLoading(true); fetchInbox(); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Refresh Inbox
            </button>
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Inbox List */}
      <div className={`${selectedEmail ? 'hidden md:flex' : 'flex'} flex-col flex-1 max-w-md border-r border-gray-800 bg-gray-900/50`}>
        <div className="p-4 border-b border-gray-800 bg-gray-900 sticky top-0">
          <h2 className="text-lg font-semibold">Inbox</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : emails.length === 0 ? (
            <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-3">
              <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              No emails yet. Waiting for incoming messages...
            </div>
          ) : (
            <ul className="divide-y divide-gray-800">
              {emails.map((email) => (
                <li key={email.id}>
                  <button
                    onClick={() => openEmail(email.id)}
                    className={`w-full text-left p-4 hover:bg-gray-800 transition-colors ${selectedEmail?.id === email.id ? 'bg-gray-800' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="font-medium text-sm truncate flex-1 text-gray-200">
                        {!email.isRead && <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>}
                        {email.fromAddress}
                      </div>
                      <div className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(email.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-300 truncate mb-1">
                      {email.subject}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {email.bodyText || 'No text content'}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Email Detail */}
      <div className={`${!selectedEmail ? 'hidden md:flex' : 'flex'} flex-col flex-1 bg-gray-950 overflow-hidden`}>
        {selectedEmail ? (
          <>
            <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900 sticky top-0 z-10">
              <button 
                onClick={() => setSelectedEmail(null)}
                className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div className="flex gap-2 ml-auto">
                {/* Could add next/prev buttons here */}
              </div>
            </div>
            <div className="p-6 border-b border-gray-800 bg-gray-900/50">
              <h2 className="text-2xl font-bold mb-4">{selectedEmail.subject}</h2>
              <div className="space-y-2 text-sm">
                <div className="flex">
                  <span className="w-16 text-gray-500">From:</span>
                  <span className="font-medium text-gray-300">{selectedEmail.fromAddress}</span>
                </div>
                <div className="flex">
                  <span className="w-16 text-gray-500">To:</span>
                  <span className="font-medium text-gray-300">{selectedEmail.toAddress}</span>
                </div>
                <div className="flex">
                  <span className="w-16 text-gray-500">Date:</span>
                  <span className="text-gray-400">{new Date(selectedEmail.receivedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-white text-black">
              {loadingEmail ? (
                <div className="p-8 text-center text-gray-500">Loading content...</div>
              ) : selectedEmail.bodyHtml ? (
                <iframe
                  title="email-content"
                  sandbox=""
                  srcDoc={selectedEmail.bodyHtml}
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="p-6 whitespace-pre-wrap font-mono text-sm text-gray-800">
                  {selectedEmail.bodyText}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-600 bg-gray-950">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Select an email to read
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
