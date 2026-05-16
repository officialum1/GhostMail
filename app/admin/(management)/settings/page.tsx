'use client';

import { useState } from 'react';
import { Download, Trash2, HardDrive, Server } from 'lucide-react';

export default function AdminSettingsPage() {
  const [cleaning, setCleaning] = useState(false);

  const handleCleanup = async () => {
    if (!confirm('Are you sure you want to delete ALL emails older than 30 days? This action cannot be undone.')) return;
    setCleaning(true);
    try {
      const res = await fetch('/api/admin/settings/cleanup', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        alert(`Successfully deleted ${data.count} old emails.`);
      } else {
        alert('Cleanup failed.');
      }
    } catch (e) {
      console.error(e);
      alert('Error during cleanup.');
    } finally {
      setCleaning(false);
    }
  };

  const handleExport = () => {
    window.location.href = '/api/admin/settings/export';
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings & Tools</h1>
        <p className="text-slate-400">System maintenance and data export</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Info Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">System Info</h2>
              <p className="text-sm text-slate-400">Environment status</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Environment</span>
              <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs border border-emerald-500/20 uppercase tracking-wider font-bold">
                {process.env.NODE_ENV}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Database</span>
              <span className="text-white font-medium">Connected</span>
            </div>
          </div>
        </div>

        {/* Maintenance Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Data Management</h2>
              <p className="text-sm text-slate-400">Exports and cleanup</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-white group"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Export Users (CSV)</span>
              </div>
            </button>

            <button
              onClick={handleCleanup}
              disabled={cleaning}
              className="w-full flex items-center justify-between px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all text-red-400 group disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">{cleaning ? 'Cleaning...' : 'Clear 30+ Day Old Emails'}</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
