'use client';

import { motion } from 'framer-motion';
import { Mail, Shield, FastForward } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white font-sans pt-32 pb-20 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10 text-center mb-16">
        <motion.h1 initial="initial" animate="animate" variants={fadeIn} className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
          About GhostMail
        </motion.h1>
        <motion.p initial="initial" animate="animate" variants={fadeIn} className="text-xl text-slate-400">
          We built GhostMail to give you a clean, private, and instant way to receive emails without exposing your personal inbox.
        </motion.p>
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 relative z-10">
        <motion.div initial="initial" animate="animate" variants={fadeIn} className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/20 flex items-center justify-center mb-6">
            <Mail className="w-8 h-8 text-cyan-400" />
          </div>
          <h3 className="text-xl font-bold mb-3">Custom Identity</h3>
          <p className="text-slate-400">Claim your unique address on our domain. It looks professional and works instantly across the web.</p>
        </motion.div>

        <motion.div initial="initial" animate="animate" variants={fadeIn} className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
            <Shield className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold mb-3">Privacy First</h3>
          <p className="text-slate-400">Stop giving out your real email to every service. Keep your main inbox entirely free from promotional spam.</p>
        </motion.div>

        <motion.div initial="initial" animate="animate" variants={fadeIn} className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center mb-6">
            <FastForward className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold mb-3">Cloudflare Powered</h3>
          <p className="text-slate-400">Utilizing Cloudflare's global edge network for enterprise-grade email routing, ensuring instant delivery.</p>
        </motion.div>
      </div>

      <motion.div initial="initial" animate="animate" variants={fadeIn} className="max-w-2xl mx-auto mt-20 text-center relative z-10 bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border border-cyan-500/20 rounded-3xl p-10 backdrop-blur-md">
        <h2 className="text-3xl font-bold mb-6">Ready to claim your address?</h2>
        <Link href="/register" className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-full font-bold text-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]">
          Create Account Now
        </Link>
      </motion.div>
    </div>
  );
}
