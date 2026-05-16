'use client';

import { motion } from 'framer-motion';
import { Mail, Shield, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'ghostmail.store';

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden font-sans">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none z-0 blur-3xl"></div>

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#0a0f1e]/60 backdrop-blur-md border-b border-white/10 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-8 h-8 text-cyan-400" />
            <Link href="/" className="text-xl font-bold tracking-tight text-white">GhostMail</Link>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Home</Link>
            <Link href="/about" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">About</Link>
            <Link href="/faq" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">FAQ</Link>
            <Link href="/contact" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Contact</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/register" className="text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/10 px-5 py-2.5 rounded-full transition-all backdrop-blur-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center mt-12 md:mt-24">
          <motion.div initial="initial" animate="animate" variants={stagger} className="max-w-4xl mx-auto">
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm text-cyan-300 font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              ✦ Free Forever · No Credit Card
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
              Your Own Email Address,<br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Ready in Seconds.</span>
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Receive OTPs, newsletters & verifications without exposing your real inbox. Powered by Cloudflare.
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-300 hover:to-emerald-400 text-gray-900 rounded-full font-bold text-lg transition-all shadow-[0_0_30px_rgba(45,212,191,0.3)] hover:shadow-[0_0_40px_rgba(45,212,191,0.5)] hover:-translate-y-1">
                Create Free Account
              </Link>
              <Link href="#how-it-works" className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-semibold text-lg transition-all backdrop-blur-md">
                See How It Works
              </Link>
            </motion.div>

            <motion.div variants={fadeIn} className="flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-400">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Instant setup</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> No spam</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Always free</div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Features */}
      <section className="relative z-10 py-24 bg-gradient-to-b from-transparent to-black/20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-6"
          >
            {/* Card 1 */}
            <motion.div variants={fadeIn} className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Private & Secure</h3>
              <p className="text-slate-400 leading-relaxed">
                Your real email stays hidden. Use your GhostMail address anywhere without worry.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div variants={fadeIn} className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Instant Delivery</h3>
              <p className="text-slate-400 leading-relaxed">
                Emails arrive in seconds. OTPs, confirmations, and verifications — all in one place.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div variants={fadeIn} className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-6">
                <Mail className="w-7 h-7 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Custom Address</h3>
              <p className="text-slate-400 leading-relaxed">
                Get username@{domain} — a real address you own and control.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 py-32">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-20 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">How It Works</h2>
          
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-4 max-w-5xl mx-auto"
          >
            {/* Step 1 */}
            <motion.div variants={fadeIn} className="flex-1 text-center group">
              <div className="w-20 h-20 mx-auto rounded-full bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-center text-2xl font-bold text-cyan-400 mb-6 group-hover:scale-110 group-hover:bg-cyan-500/10 transition-all">
                1
              </div>
              <h4 className="text-xl font-bold mb-2">Create Account</h4>
              <p className="text-slate-400">Sign up with just a username</p>
            </motion.div>

            {/* Arrow */}
            <motion.div variants={fadeIn} className="hidden md:block text-slate-600">
              <ArrowRight className="w-8 h-8" />
            </motion.div>

            {/* Step 2 */}
            <motion.div variants={fadeIn} className="flex-1 text-center group">
              <div className="w-20 h-20 mx-auto rounded-full bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-center text-2xl font-bold text-blue-400 mb-6 group-hover:scale-110 group-hover:bg-blue-500/10 transition-all">
                2
              </div>
              <h4 className="text-xl font-bold mb-2">Get Your Email</h4>
              <p className="text-slate-400">Instant access to your new inbox</p>
            </motion.div>

            {/* Arrow */}
            <motion.div variants={fadeIn} className="hidden md:block text-slate-600">
              <ArrowRight className="w-8 h-8" />
            </motion.div>

            {/* Step 3 */}
            <motion.div variants={fadeIn} className="flex-1 text-center group">
              <div className="w-20 h-20 mx-auto rounded-full bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-center text-2xl font-bold text-emerald-400 mb-6 group-hover:scale-110 group-hover:bg-emerald-500/10 transition-all">
                3
              </div>
              <h4 className="text-xl font-bold mb-2">Use It Anywhere</h4>
              <p className="text-slate-400">Receive OTPs and keep your real email private</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#0a0f1e]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Mail className="w-6 h-6 text-cyan-400" />
            <span className="font-bold">GhostMail</span>
          </div>
          <div className="flex gap-6 text-sm font-medium text-slate-400 flex-wrap justify-center">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
          <div className="text-slate-400 text-sm">
            GhostMail © 2025 · Built with ❤️
          </div>
        </div>
      </footer>
    </div>
  );
}
