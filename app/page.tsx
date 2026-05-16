import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Cloud,
  Lock,
  Mail,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import { SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'GhostMail — Free Custom Email Address | Receive OTPs Instantly',
  description:
    'Get a free @ghostmail.store email address in seconds. Receive OTPs from Google, Reddit, Twitter and any service instantly. No spam, no credit card. Free forever.',
  alternates: { canonical: SITE_URL },
};

const stats = [
  { value: '50K+', label: 'Users' },
  { value: '2M+', label: 'Emails Received' },
  { value: '99.9%', label: 'Uptime' },
  { value: '< 3s', label: 'Delivery Time' },
];

const features = [
  {
    icon: Zap,
    title: 'Instant Delivery',
    description: 'Emails arrive in under 3 seconds. Never miss an OTP again.',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description:
      'Your real email stays hidden forever. No tracking, no selling data.',
  },
  {
    icon: Mail,
    title: 'Real Email Address',
    description:
      'Not a temporary alias. A real @ghostmail.store email you control.',
  },
  {
    icon: Cloud,
    title: 'Powered by Cloudflare',
    description:
      'Enterprise-grade infrastructure with resilient global delivery.',
  },
  {
    icon: Lock,
    title: 'Secure Inbox',
    description: 'Encrypted storage and private access designed for peace of mind.',
  },
  {
    icon: Sparkles,
    title: 'Free Forever',
    description:
      'No hidden fees, no card required, and core features always included.',
  },
];

const useCases = [
  {
    title: 'Receive OTPs',
    subtitle: 'Sign up for any service with your GhostMail address.',
    body: 'Your verification code arrives in seconds inside a private dashboard built for speed.',
    accent: '847291',
  },
  {
    title: 'Sign Up To Sites',
    subtitle: 'Use GhostMail when Reddit, X, or marketplaces ask for an email.',
    body: 'Keep your real inbox clean and avoid newsletters, promotions, and account spam.',
    accent: 'Reddit verification',
  },
  {
    title: 'Test Applications',
    subtitle: 'Perfect for developers and product teams testing email flows.',
    body: 'Spin up accounts quickly, validate flows, and inspect every message in one place.',
    accent: 'QA sandbox',
  },
];

const testimonials = [
  {
    quote:
      'I use GhostMail for every site I sign up to. My real inbox is finally spam-free.',
    author: 'Sarah K., Developer',
  },
  {
    quote:
      'The OTP delivery is incredibly fast. I have never missed a verification code.',
    author: 'Ahmed R., Entrepreneur',
  },
  {
    quote:
      'Finally a free email solution that actually works. I use it for all my test accounts.',
    author: 'Marcus L., Software Engineer',
  },
];

const faqPreview = [
  {
    question: 'What is GhostMail?',
    answer:
      'GhostMail gives you a private @ghostmail.store inbox you can use anywhere without exposing your personal email address.',
  },
  {
    question: 'Is it really free forever?',
    answer:
      'Yes. You can create an address, receive email, and use your inbox without a subscription or credit card.',
  },
  {
    question: 'How fast do emails arrive?',
    answer:
      'Most messages show up in a few seconds thanks to Cloudflare-powered routing and a lightweight dashboard.',
  },
];

export default function HomePage() {
  return (
    <PageLayout>
      <div className="relative overflow-hidden bg-[#0a0f1e]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_32%)]" />
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:24px_24px]" />

        <section className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center px-6 py-20 md:py-28">
          <div className="grid w-full items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200 shadow-[0_0_0_1px_rgba(34,211,238,0.08)]">
                <span className="h-2 w-2 rounded-full bg-cyan-300 animate-pulse" />
                Trusted by 10,000+ users · Free Forever
              </div>
              <h1 className="mt-8 max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight text-white md:text-7xl">
                Your Own Email Address,
                <span className="mt-2 block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Ready in Seconds.
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
                Stop giving out your real email. Get a private
                {' '}
                @ghostmail.store
                {' '}
                address instantly for OTPs, sign-ups, and staying spam-free.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-7 py-4 text-base font-semibold text-white shadow-[0_24px_50px_rgba(59,130,246,0.26)] transition hover:scale-[1.01]"
                >
                  Create Free Account
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 px-7 py-4 text-base font-medium text-white transition hover:bg-white/5"
                >
                  See How It Works
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-4 text-sm text-slate-300">
                {['No credit card', 'Instant setup', 'Always free', 'Powered by Cloudflare'].map(
                  (item) => (
                    <div
                      key={item}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2"
                    >
                      <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                      {item}
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-4 top-10 hidden rounded-2xl border border-cyan-400/20 bg-[#111b2d] px-4 py-3 text-sm text-white shadow-2xl md:block animate-[float_5s_ease-in-out_infinite]">
                📧 OTP from Google: 847291
              </div>
              <div className="absolute -right-4 top-40 hidden rounded-2xl border border-blue-400/20 bg-[#12182a] px-4 py-3 text-sm text-white shadow-2xl md:block animate-[float_6s_ease-in-out_infinite]">
                📧 Verification from Reddit
              </div>
              <div className="absolute bottom-2 left-8 hidden rounded-2xl border border-white/10 bg-[#101827] px-4 py-3 text-sm text-white shadow-2xl md:block animate-[float_7s_ease-in-out_infinite]">
                📧 Welcome from Netflix
              </div>
              <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.98),rgba(10,15,30,0.94))] p-4 shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
                <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0d1117]">
                  <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500">
                        <Mail className="h-5 w-5 text-white" />
                      </span>
                      <div>
                        <p className="font-semibold text-white">Inbox preview</p>
                        <p className="text-sm text-slate-400">username@ghostmail.store</p>
                      </div>
                    </div>
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                      Live delivery
                    </span>
                  </div>
                  <div className="grid md:grid-cols-[220px_1fr]">
                    <div className="border-b border-r border-white/10 border-b-white/10 bg-[#101722] p-4 md:border-b-0">
                      {['Inbox', 'Starred', 'Security', 'OTP Codes'].map((label, index) => (
                        <div
                          key={label}
                          className={`mb-2 flex items-center justify-between rounded-2xl px-4 py-3 text-sm ${
                            index === 0
                              ? 'border border-cyan-400/20 bg-cyan-400/10 text-white'
                              : 'text-slate-400'
                          }`}
                        >
                          <span>{label}</span>
                          <span>{index === 0 ? 12 : index + 1}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3 p-4">
                      {[
                        {
                          sender: 'Google',
                          subject: 'Your verification code',
                          preview: 'Use 847291 to finish signing in to your account.',
                        },
                        {
                          sender: 'Reddit',
                          subject: 'Confirm your email',
                          preview: 'Click the secure link to verify your new Reddit profile.',
                        },
                        {
                          sender: 'Notion',
                          subject: 'Workspace invite',
                          preview: 'You have been invited to join the Brand Ops workspace.',
                        },
                      ].map((email, index) => (
                        <div
                          key={email.sender}
                          className={`rounded-3xl border p-4 ${
                            index === 0
                              ? 'border-cyan-400/20 bg-cyan-400/10'
                              : 'border-white/10 bg-white/5'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-white">{email.sender}</p>
                            <p className="text-xs text-slate-500">{index + 1}m ago</p>
                          </div>
                          <p className="mt-2 text-sm font-medium text-slate-200">
                            {email.subject}
                          </p>
                          <p className="mt-1 text-sm text-slate-400">{email.preview}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <p className="relative mx-auto max-w-2xl px-6 pb-8 text-center text-sm leading-7 text-slate-500">
          GhostMail provides free custom email addresses at @ghostmail.store. Our service is perfect
          for receiving OTP codes, email verifications, and sign-up confirmations without exposing
          your real email address to spam. Powered by Cloudflare&apos;s global network for instant,
          reliable delivery.
        </p>

        <section className="relative border-y border-white/5 bg-[#0b1220]/80">
          <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-white/8 bg-white/5 p-6 backdrop-blur">
                <div className="text-4xl font-bold text-white">{stat.value}</div>
                <div className="mt-2 text-sm uppercase tracking-[0.2em] text-slate-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="relative mx-auto max-w-7xl px-6 py-20 md:py-32">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">How it works</p>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl">How GhostMail Works</h2>
            <p className="mt-4 text-lg text-slate-400">
              Built for sign-ups, verification, and a cleaner digital life.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Create Account',
                body: 'Register with just a username and password. Your @ghostmail.store address is ready instantly.',
              },
              {
                step: '02',
                title: 'Use Your Address',
                body: 'Sign up anywhere with your GhostMail address. It works on websites, apps, and marketplaces.',
              },
              {
                step: '03',
                title: 'Receive Emails',
                body: 'OTPs, verifications, receipts, and newsletters arrive in your private dashboard in seconds.',
              },
            ].map((item, index) => (
              <div key={item.step} className="relative rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur">
                {index < 2 ? (
                  <div className="absolute right-[-12px] top-14 hidden h-px w-6 bg-cyan-400/40 md:block" />
                ) : null}
                <div className="text-sm font-semibold tracking-[0.25em] text-cyan-300">
                  {item.step}
                </div>
                <h3 className="mt-6 text-2xl font-semibold text-white">{item.title}</h3>
                <p className="mt-4 text-slate-400">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="relative mx-auto max-w-7xl px-6 py-20 md:py-32">
          <div className="mb-14 max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Features</p>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl">Why Choose GhostMail</h2>
            <p className="mt-4 text-lg text-slate-400">
              The inbox layer between you and the noisy internet.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur transition hover:border-white/20"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20">
                    <Icon className="h-6 w-6 text-cyan-300" aria-hidden="true" />
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-3 text-slate-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-6 py-20 md:py-32">
          <div className="mb-14 max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Use cases</p>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl">
              Designed for everyday privacy and serious testing workflows.
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {useCases.map((item) => (
              <div
                key={item.title}
                className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-8 backdrop-blur"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-300">
                  {item.title}
                </div>
                <h3 className="mt-6 text-2xl font-semibold text-white">{item.subtitle}</h3>
                <p className="mt-4 leading-7 text-slate-400">{item.body}</p>
                <div className="mt-8 rounded-3xl border border-white/10 bg-[#0e1627] p-5">
                  <p className="text-sm text-slate-500">Sample email</p>
                  <p className="mt-3 text-xl font-semibold text-white">{item.accent}</p>
                  <p className="mt-2 text-sm text-slate-400">
                    Delivered to your dashboard with clean previews and instant refresh.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-6 py-20 md:py-32">
          <div className="mb-14 max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Testimonials</p>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl">
              People use GhostMail because speed means nothing without trust.
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {testimonials.map((item) => (
              <div
                key={item.author}
                className="rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur"
              >
                <p className="text-lg leading-8 text-slate-200">“{item.quote}”</p>
                <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  {item.author}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-6 py-20 md:py-32">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">FAQ</p>
              <h2 className="mt-4 text-3xl font-bold md:text-5xl">Frequently Asked Questions</h2>
              <Link
                href="/faq"
                className="mt-8 inline-flex items-center gap-2 text-base font-medium text-cyan-300 transition hover:text-cyan-200"
              >
                See all FAQs
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {faqPreview.map((item) => (
                <div
                  key={item.question}
                  className="rounded-[24px] border border-white/10 bg-white/5 p-6 backdrop-blur"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold text-white">{item.question}</h3>
                    <ChevronDown className="h-5 w-5 text-cyan-300" />
                  </div>
                  <p className="mt-4 text-slate-400">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-6 pb-24 md:pb-32">
          <div className="rounded-[36px] border border-cyan-400/15 bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(59,130,246,0.12),rgba(10,15,30,0.96))] p-8 shadow-[0_40px_80px_rgba(0,0,0,0.28)] md:p-14">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">
                  Ready to protect your privacy?
                </p>
                <h2 className="mt-4 text-3xl font-bold md:text-5xl">
                  Join thousands of users who keep their real inbox clean.
                </h2>
                <p className="mt-4 max-w-2xl text-lg text-slate-200">
                  Start with a free GhostMail address today and move your sign-ups,
                  verification codes, and one-off accounts into a dedicated private inbox.
                </p>
              </div>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 text-base font-semibold text-slate-950 transition hover:scale-[1.01]"
              >
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
