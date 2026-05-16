import AdminSidebar from '@/components/admin/AdminSidebar';
import { Toaster } from 'react-hot-toast';

export default function AdminManagementLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#0a0f1e] overflow-hidden text-white font-sans">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto">
        <Toaster position="top-right" toastOptions={{ style: { background: '#0f172a', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.08)' } }} />
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
