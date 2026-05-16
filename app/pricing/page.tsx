import type { Metadata } from 'next';
import Link from 'next/link';
import { Check } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import { SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Pricing — GhostMail',
  description:
    'GhostMail pricing. Start free and keep your sign-ups, OTPs, and verification emails private.',
  alternates: { canonical: `${SITE_URL}/pricing` },
};

export default function PricingPage() {
  return (
    <PageLayout>
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-32">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Pricing</p>
          <h1 className="mt-4 text-4xl font-bold md:text-6xl">
            Free at the core, built to feel premium from day one.
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            GhostMail keeps account creation simple. The current experience is free
            for individuals who need a private inbox for verifications, OTPs, and sign-ups.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[32px] border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(34,211,238,0.12),rgba(255,255,255,0.04))] p-8 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">Current plan</p>
            <h2 className="mt-4 text-3xl font-bold text-white">Free Forever</h2>
            <p className="mt-3 text-5xl font-bold text-white">$0</p>
            <div className="mt-8 space-y-4">
              {[
                'Real @ghostmail.store address',
                'Fast inbound email delivery',
                'Private web inbox',
                'OTP and verification support',
                'No credit card required',
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-slate-200">
                  <Check className="h-5 w-5 text-cyan-300" />
                  {feature}
                </div>
              ))}
            </div>
            <Link
              href="/register"
              className="mt-10 inline-flex rounded-xl bg-white px-6 py-3 font-semibold text-slate-950"
            >
              Create free account
            </Link>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Coming later</p>
            <h2 className="mt-4 text-3xl font-bold text-white">Power features</h2>
            <p className="mt-4 leading-8 text-slate-300">
              We are exploring team tooling, APIs, and advanced inbox controls for
              developers and privacy-focused operators. The free product remains the
              foundation, and any future paid layer would expand on that without
              removing the core experience.
            </p>
            <Link href="/contact" className="mt-10 inline-flex text-cyan-300 hover:text-cyan-200">
              Ask about business plans →
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
