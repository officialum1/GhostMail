'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import PageLayout from '@/components/PageLayout';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'ghostmail.store';
  const previewEmail = username ? `${username}@${domain}` : `username@${domain}`;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      const message = `Success! Your email is ${data.email}. Redirecting to login...`;
      setSuccessMsg(message);
      toast.success('Account created successfully');
      setTimeout(() => router.push('/login'), 1800);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <div className="grid gap-8 lg:grid-cols-[1fr_460px]">
          <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-8 backdrop-blur md:p-12">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Create account</p>
            <h1 className="mt-4 text-4xl font-bold md:text-6xl">
              Claim your private inbox in under a minute.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Pick a username, create a password, and your GhostMail address is ready
              instantly for verifications, receipts, newsletters, and testing workflows.
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: Sparkles,
                  title: 'Instant setup',
                  body: 'No credit card and no long onboarding.',
                },
                {
                  icon: Shield,
                  title: 'Privacy by default',
                  body: 'Your real inbox stays out of circulation.',
                },
                {
                  icon: CheckCircle2,
                  title: 'Free forever',
                  body: 'The core inbox experience stays available to everyone.',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-3xl border border-white/10 bg-[#0f1728] p-5">
                    <Icon className="h-5 w-5 text-cyan-300" />
                    <p className="mt-4 font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-sm text-slate-400">{item.body}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[#0f1627] p-8 shadow-[0_32px_80px_rgba(0,0,0,0.35)] backdrop-blur">
            <h2 className="text-2xl font-semibold text-white">Start free</h2>
            <p className="mt-2 text-slate-400">
              Your address will look like
              {' '}
              <span className="text-cyan-300">username@{domain}</span>
            </p>

            {error ? (
              <div className="mt-6 rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </div>
            ) : null}
            {successMsg ? (
              <div className="mt-6 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                {successMsg}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Username</label>
                <div className="flex rounded-2xl border border-white/10 bg-white/5 focus-within:border-cyan-400/30">
                  <input
                    type="text"
                    required
                    minLength={3}
                    maxLength={20}
                    value={username}
                    onChange={(event) =>
                      setUsername(
                        event.target.value
                          .toLowerCase()
                          .replace(/@.*/, '')
                          .replace(/[^a-z0-9_-]/g, '')
                      )
                    }
                    placeholder="johndoe"
                    className="flex-1 bg-transparent px-4 py-3 text-white outline-none placeholder:text-slate-500"
                  />
                  <span className="border-l border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
                    @{domain}
                  </span>
                </div>
                <p className="mt-2 text-sm text-cyan-400">
                  Your email will be: {previewEmail}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Confirm password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/30"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3.5 font-semibold text-white transition hover:scale-[1.01] disabled:opacity-60"
              >
                {loading ? 'Creating account...' : 'Create Free Account'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-400">
              Already have an account?
              {' '}
              <Link href="/login" className="text-cyan-300 hover:text-cyan-200">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
