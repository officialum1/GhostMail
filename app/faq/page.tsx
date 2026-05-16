'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

const faqs = [
  {
    q: "What is GhostMail?",
    a: "GhostMail is a free service that provides you with a custom, private email address on our domain. You can use it to receive OTPs, verification links, and newsletters without exposing your primary inbox."
  },
  {
    q: "Is it really free?",
    a: "Yes, GhostMail is completely free to use. There are no hidden fees or premium tiers required to receive your emails."
  },
  {
    q: "Can I send emails too?",
    a: "Yes. GhostMail users can receive emails from anyone and can also send emails to external addresses from their GhostMail inbox."
  },
  {
    q: "How fast do emails arrive?",
    a: "Instantly. We use Cloudflare's global edge network to route incoming emails directly to our database in milliseconds."
  },
  {
    q: "Is my data private?",
    a: "Yes. Your emails are only accessible by you after logging in. Passwords are cryptographically hashed. We do not sell your data."
  },
  {
    q: "Can I use it for OTPs?",
    a: "Absolutely! GhostMail is perfect for receiving One Time Passwords (OTPs), sign-up confirmations, and verification codes."
  },
  {
    q: "What happens to old emails?",
    a: "To conserve storage, emails may be automatically purged after 30 days. You should not use GhostMail for long-term critical storage."
  },
  {
    q: "How do I delete my account?",
    a: "If you wish to delete your account and all associated emails permanently, please contact our support team."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white font-sans pt-32 pb-20 px-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-slate-400">Everything you need to know about GhostMail.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-white/5 transition-colors focus:outline-none"
              >
                <span className="font-semibold text-lg">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-cyan-400 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-5 text-slate-400 leading-relaxed border-t border-white/5 pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-400 mb-4">Still have questions?</p>
          <Link href="/contact" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-medium">
            Contact Support &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
