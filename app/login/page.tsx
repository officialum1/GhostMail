'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';
import PageLayout from '@/components/PageLayout';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        const message = result.error.includes('suspended')
          ? 'Your account has been suspended'
          : 'Invalid email or password';
        setError(message);
        toast.error(message);
      } else {
        toast.success('Welcome back');
        window.location.href = '/dashboard';
      }
    } catch {
      setError('An error occurred during login');
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <div className="grid gap-8 lg:grid-cols-[1fr_440px]">
          <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-8 backdrop-blur md:p-12">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Login</p>
            <h1 className="mt-4 text-4xl font-bold md:text-6xl">
              Step back into your private GhostMail inbox.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Read OTPs, confirmations, and account notices from a dashboard built
              for speed, focus, and privacy.
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-[#0f1728] p-6">
                <Mail className="h-6 w-6 text-cyan-300" />
                <p className="mt-4 text-lg font-semibold text-white">Fast inbox access</p>
                <p className="mt-2 text-sm text-slate-400">
                  Open your messages quickly with a dashboard tuned for readability.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-[#0f1728] p-6">
                <Lock className="h-6 w-6 text-cyan-300" />
                <p className="mt-4 text-lg font-semibold text-white">Private by default</p>
                <p className="mt-2 text-sm text-slate-400">
                  Credentials stay hashed and inbox access stays tied to your account.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[#0f1627] p-8 shadow-[0_32px_80px_rgba(0,0,0,0.35)] backdrop-blur">
            <h2 className="text-2xl font-semibold text-white">Welcome back</h2>
            <p className="mt-2 text-slate-400">Log in to check your messages.</p>

            {error ? (
              <div className="mt-6 rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Username or Email</label>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value.toLowerCase())}
                  placeholder="username or username@ghostmail.store"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/30"
                />
                <p className="mt-2 text-sm text-slate-400">
                  You can login with your username or full email address
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

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3.5 font-semibold text-white transition hover:scale-[1.01] disabled:opacity-60"
              >
                {loading ? 'Logging in...' : 'Login'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-400">
              Don&apos;t have an account?
              {' '}
              <Link href="/register" className="text-cyan-300 hover:text-cyan-200">
                Register
              </Link>
            </p>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
