// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminCommandPalette from '@/components/admin/AdminCommandPalette'
import { Toaster } from 'react-hot-toast'

export default function AdminManagementLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#07090e] overflow-hidden text-slate-900 dark:text-slate-100 font-sans">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto flex flex-col">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0c1017',
              color: '#f8fafc',
              border: '1px solid rgba(255,255,255,0.08)',
            },
          }}
        />
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#07090e]/80 px-4 py-2.5 backdrop-blur-md lg:px-8">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 hidden sm:inline">
              GhostMail Enterprise Operations
            </span>
          </div>
          <AdminCommandPalette />
        </div>
        <div className="flex-1 p-4 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
