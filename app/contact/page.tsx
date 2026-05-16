export const metadata = {
  title: 'Contact Us',
};

import { Mail, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white font-sans pt-32 pb-20 px-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Get in Touch
          </h1>
          <p className="text-xl text-slate-400">We&apos;re here to help with any questions or issues.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
            <div className="w-14 h-14 rounded-full bg-cyan-500/20 flex items-center justify-center mb-6">
              <Mail className="w-7 h-7 text-cyan-400" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Email Support</h2>
            <p className="text-slate-400 mb-6">Send us an email directly. We typically respond within 24 hours.</p>
            <a href="mailto:support@yourdomain.com" className="text-cyan-400 hover:text-cyan-300 font-medium text-lg">
              support@yourdomain.com
            </a>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
              <MessageSquare className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold mb-3">FAQ</h2>
            <p className="text-slate-400 mb-6">Find instant answers to the most common questions in our FAQ section.</p>
            <Link href="/faq" className="text-emerald-400 hover:text-emerald-300 font-medium text-lg">
              Visit FAQ &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
