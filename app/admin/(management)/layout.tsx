import AdminSidebar from '@/components/admin/AdminSidebar';
import { Toaster } from 'react-hot-toast';

export default function AdminManagementLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0a0f1e] overflow-hidden text-slate-900 dark:text-white font-sans">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto">
        <Toaster position="top-right" toastOptions={{ style: { background: '#0f172a', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.08)' } }} />
        <div className="p-4 pt-16 lg:p-8 lg:pt-8">
          {children}
        </div>
      </div>
    </div>
  );
}
