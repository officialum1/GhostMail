import type { Metadata } from 'next';
import { Lock, Shield, Sparkles, Workflow } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import { SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'About GhostMail — Our Mission to Protect Email Privacy',
  description:
    'Learn about GhostMail and our mission to give everyone a free, private email address. Built on Cloudflare infrastructure for instant, reliable email delivery.',
  alternates: { canonical: `${SITE_URL}/about` },
};

const stats = [
  { value: '50K+', label: 'Users' },
  { value: '2M+', label: 'Emails Received' },
  { value: '99.9%', label: 'Uptime' },
  { value: '< 3s', label: 'Delivery Time' },
];

export default function AboutPage() {
  return (
    <PageLayout>
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-32">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-300">About GhostMail</p>
          <h1 className="mt-4 text-4xl font-bold md:text-6xl">
            We believe everyone deserves email privacy without compromise.
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
            GhostMail was created for people who are tired of turning their real
            inbox into a permanent marketing database every time they sign up for
            something online.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-20 md:grid-cols-2 md:pb-32">
        <div className="rounded-[28px] border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-8 backdrop-blur">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Our Mission</h2>
          <p className="mt-4 leading-8 text-slate-600 dark:text-slate-300">
            In a world where your email address is your digital identity,
            protecting it should not be a luxury. GhostMail gives everyone a free,
            private address they can use anywhere without exposing their real inbox
            to spam, tracking, or data brokers.
          </p>
        </div>
        <div className="rounded-[28px] border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-8 backdrop-blur">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Why We Built This</h2>
          <p className="mt-4 leading-8 text-slate-600 dark:text-slate-300">
            Every sign-up asks for a piece of your identity. Too often that address
            is sold, spammed forever, or shared far beyond what you agreed to. We
            got tired of that tradeoff, so we built GhostMail.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 md:pb-32">
        <div className="rounded-[32px] border border-slate-200 dark:border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-8 backdrop-blur md:p-12">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-300">How it works</p>
          <h2 className="mt-4 text-3xl font-bold md:text-5xl">A simple pipeline built for trust.</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {[
              'Cloudflare Email Routing receives every message.',
              'Our servers parse and store emails securely.',
              'You access them through a private dashboard.',
              'Messages are encrypted at rest and isolated per account.',
            ].map((item, index) => (
              <div key={item} className="rounded-3xl border border-slate-200 dark:border-white/10 bg-[#0f1728] p-6">
                <div className="text-sm font-semibold tracking-[0.25em] text-cyan-600 dark:text-cyan-300">
                  0{index + 1}
                </div>
                <p className="mt-4 text-slate-600 dark:text-slate-300">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-20 md:grid-cols-4 md:pb-32">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[28px] border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-6 backdrop-blur">
            <p className="text-4xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            <p className="mt-2 text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{stat.label}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 md:pb-32">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-8 backdrop-blur md:p-10">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-300">Team</p>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl">
              Built by privacy enthusiasts who think the internet should work for users, not advertisers.
            </h2>
            <p className="mt-6 leading-8 text-slate-600 dark:text-slate-300">
              We care about design, security, and making privacy tools feel premium.
              GhostMail exists because privacy products should not look or feel like
              a compromise.
            </p>
          </div>
          <div className="grid gap-4">
            {[
              { icon: Shield, title: 'Privacy First' },
              { icon: Sparkles, title: 'Always Free' },
              { icon: Workflow, title: 'Transparency' },
              { icon: Lock, title: 'Security' },
            ].map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="flex items-center gap-4 rounded-[28px] border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-6 backdrop-blur"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10">
                    <Icon className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{value.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Embedded into product decisions, not added as a slogan later.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
