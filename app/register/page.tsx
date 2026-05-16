'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // In a real app we'd fetch the domain from an API or env, 
  // but for the UI preview we'll assume the environment variable domain or a placeholder.
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'yourdomain.com';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccessMsg(`Success! Your email is ${data.email}. Redirecting to login...`);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-2xl border border-gray-800 shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400 mt-2">Get your instant email address</p>
        </div>

        {error && <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg text-sm">{error}</div>}
        {successMsg && <div className="p-3 bg-emerald-500/10 border border-emerald-500/50 text-emerald-500 rounded-lg text-sm">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
            <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-700 focus-within:ring-2 focus-within:ring-inset focus-within:ring-emerald-500">
              <input
                type="text"
                required
                className="block flex-1 border-0 bg-transparent py-2.5 pl-3 text-white placeholder:text-gray-500 focus:ring-0 sm:text-sm sm:leading-6 outline-none"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
              />
              <span className="flex select-none items-center pr-3 text-gray-500 sm:text-sm">
                @{domain}
              </span>
            </div>
            {username && (
              <p className="mt-1 text-xs text-emerald-400">
                Your email will be: {username}@{domain}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full rounded-md border-0 bg-gray-800 py-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:text-sm sm:leading-6 outline-none px-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
            <input
              type="password"
              required
              className="w-full rounded-md border-0 bg-gray-800 py-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:text-sm sm:leading-6 outline-none px-3"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400">
          Already have an account? <Link href="/login" className="text-emerald-400 hover:text-emerald-300">Log in</Link>
        </p>
      </div>
    </div>
  );
}
