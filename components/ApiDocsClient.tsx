// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Check,
  Copy,
  Flame,
  Key,
  Play,
  Send,
  Shield,
  Terminal,
  Zap,
} from 'lucide-react'
import toast from 'react-hot-toast'
import CryptoUpgradeModal from '@/components/CryptoUpgradeModal'

type Language = 'curl' | 'python' | 'node'

export default function ApiDocsClient() {
  const [activeLang, setActiveLang] = useState<Language>('curl')
  const [modalOpen, setModalOpen] = useState(false)
  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  // Interactive Playground state
  const [testKey, setTestKey] = useState('')
  const [testEndpoint, setTestEndpoint] = useState<'otp' | 'create' | 'inbox'>('otp')
  const [testEmail, setTestEmail] = useState('demo@ghostmail.store')
  const [testUsername, setTestUsername] = useState('test_runner_1')
  const [testPassword, setTestPassword] = useState('SecurePass123!')
  const [running, setRunning] = useState(false)
  const [testResponse, setTestResponse] = useState<string | null>(null)
  const [testStatus, setTestStatus] = useState<number | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedSection(id)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopiedSection(null), 2000)
  }

  const runPlayground = async () => {
    setRunning(true)
    setTestResponse(null)
    setTestStatus(null)
    try {
      let url = ''
      const options: RequestInit = {
        headers: {
          'X-API-Key': testKey || 'demo_key',
        },
      }

      if (testEndpoint === 'otp') {
        url = `/api/v1/inbox/otp?email=${encodeURIComponent(testEmail)}&waitSeconds=2`
        options.method = 'GET'
      } else if (testEndpoint === 'create') {
        url = '/api/v1/account/create'
        options.method = 'POST'
        options.headers = {
          ...options.headers,
          'Content-Type': 'application/json',
        }
        options.body = JSON.stringify({
          username: testUsername,
          password: testPassword,
        })
      } else {
        url = `/api/v1/inbox?email=${encodeURIComponent(testEmail)}`
        options.method = 'GET'
      }

      const res = await fetch(url, options)
      setTestStatus(res.status)
      const data = await res.json().catch(() => ({ error: 'Non-JSON response' }))
      setTestResponse(JSON.stringify(data, null, 2))
    } catch (err) {
      setTestResponse(JSON.stringify({ error: err instanceof Error ? err.message : 'Request failed' }, null, 2))
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-slate-200 dark:border-white/10 pb-10">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-500 uppercase tracking-widest border border-cyan-400/20">
              API Reference v1
            </span>
            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-500 uppercase tracking-widest border border-emerald-400/20">
              Pro Feature
            </span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold md:text-5xl text-slate-900 dark:text-white">
            GhostMail Developer REST API
          </h1>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Programmatically create real private mailboxes, poll incoming messages, and extract OTP / verification codes with high-speed endpoints. Designed for QA test suites, automation bots, and scrapers.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:opacity-95 transition"
          >
            <Zap className="h-4 w-4 fill-slate-950" />
            Get Developer API Key ($19/mo)
          </button>
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition"
          >
            <Key className="h-4 w-4" />
            My API Keys
          </Link>
        </div>
      </div>

      {/* Global Lang Selector */}
      <div className="my-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-cyan-400" />
          <span className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Preferred Language:</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-1">
          {(['curl', 'python', 'node'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold uppercase tracking-wider transition ${
                activeLang === lang
                  ? 'bg-cyan-400 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {lang === 'node' ? 'Node.js' : lang}
            </button>
          ))}
        </div>
      </div>

      {/* Authentication Section */}
      <section className="mb-14 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 p-6 md:p-8 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Authentication & Pro Access</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">API keys are required for all endpoints under /api/v1/*</p>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Authenticate requests by providing your developer key in the <code className="rounded bg-black/10 dark:bg-white/10 px-1.5 py-0.5 font-mono text-cyan-500">X-API-Key</code> request header, or as a standard <code className="rounded bg-black/10 dark:bg-white/10 px-1.5 py-0.5 font-mono text-cyan-500">Authorization: Bearer &lt;KEY&gt;</code> header.
        </p>

        <div className="mt-4 rounded-2xl bg-slate-950 p-4 font-mono text-xs text-slate-200 overflow-x-auto border border-white/5">
          <div className="flex justify-between items-center mb-2 text-slate-400">
            <span>Header Syntax</span>
            <button
              onClick={() => copyToClipboard('X-API-Key: gm_live_your_pro_key_here', 'auth-header')}
              className="hover:text-white flex items-center gap-1 text-[11px]"
            >
              {copiedSection === 'auth-header' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              Copy
            </button>
          </div>
          <code>X-API-Key: gm_live_••••••••••••••••••••••••••••••••</code>
        </div>
      </section>

      {/* Endpoint 1: Automated OTP Extraction */}
      <section className="mb-14 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 p-6 md:p-8 backdrop-blur space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 text-xs font-mono font-bold">
              GET
            </span>
            <h3 className="text-xl font-bold font-mono text-slate-900 dark:text-white">/api/v1/inbox/otp</h3>
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-amber-500 dark:text-amber-400">
            <Flame className="h-4 w-4" /> Most Popular
          </span>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Heuristically inspects incoming messages for the requested mailbox, extracts pure 4–8 digit verification codes and action links using regex heuristics, and returns them immediately. Supports long-polling with <code className="font-mono text-cyan-500">waitSeconds</code>.
        </p>

        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Query Parameters</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10 text-left text-slate-400">
                  <th className="pb-2 font-semibold">Parameter</th>
                  <th className="pb-2 font-semibold">Type</th>
                  <th className="pb-2 font-semibold">Required</th>
                  <th className="pb-2 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                <tr>
                  <td className="py-2.5 font-mono text-cyan-400">email</td>
                  <td className="py-2.5">string</td>
                  <td className="py-2.5 font-bold text-amber-400">Yes</td>
                  <td className="py-2.5">Mailbox address (e.g. <code className="font-mono">test@ghostmail.store</code>)</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-mono text-cyan-400">waitSeconds</td>
                  <td className="py-2.5">number (1-30)</td>
                  <td className="py-2.5 text-slate-500">Optional</td>
                  <td className="py-2.5">Seconds to long-poll for an incoming email if none has arrived yet (default: 0)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Code Example */}
        <div className="rounded-2xl bg-slate-950 p-4 font-mono text-xs border border-white/5 text-slate-200">
          <div className="flex justify-between items-center mb-2 text-slate-400">
            <span>Example Request ({activeLang.toUpperCase()})</span>
            <button
              onClick={() => {
                const code =
                  activeLang === 'curl'
                    ? `curl -H "X-API-Key: YOUR_API_KEY" "https://ghostmail.store/api/v1/inbox/otp?email=user@ghostmail.store&waitSeconds=10"`
                    : activeLang === 'python'
                      ? `import requests\n\nres = requests.get(\n    "https://ghostmail.store/api/v1/inbox/otp",\n    headers={"X-API-Key": "YOUR_API_KEY"},\n    params={"email": "user@ghostmail.store", "waitSeconds": 10}\n)\nprint(res.json().get("otp"))`
                      : `const res = await fetch("https://ghostmail.store/api/v1/inbox/otp?email=user@ghostmail.store&waitSeconds=10", {\n  headers: { "X-API-Key": "YOUR_API_KEY" }\n});\nconst data = await res.json();\nconsole.log(data.otp);`
                copyToClipboard(code, 'otp-code')
              }}
              className="hover:text-white flex items-center gap-1 text-[11px]"
            >
              {copiedSection === 'otp-code' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              Copy
            </button>
          </div>
          <pre className="overflow-x-auto text-cyan-300">
            {activeLang === 'curl' &&
              `curl -H "X-API-Key: YOUR_API_KEY" \\
  "https://ghostmail.store/api/v1/inbox/otp?email=user@ghostmail.store&waitSeconds=10"`}
            {activeLang === 'python' &&
              `import requests

res = requests.get(
    "https://ghostmail.store/api/v1/inbox/otp",
    headers={"X-API-Key": "YOUR_API_KEY"},
    params={"email": "user@ghostmail.store", "waitSeconds": 10}
)
data = res.json()
print("OTP Code:", data.get("otp"))
print("Link:", data.get("verificationLink"))`}
            {activeLang === 'node' &&
              `const res = await fetch("https://ghostmail.store/api/v1/inbox/otp?email=user@ghostmail.store&waitSeconds=10", {
  headers: { "X-API-Key": "YOUR_API_KEY" }
});
const data = await res.json();
console.log("OTP Code:", data.otp);`}
          </pre>
        </div>

        {/* Response Example */}
        <div className="rounded-2xl bg-black/60 p-4 font-mono text-xs border border-white/5 text-emerald-400">
          <p className="text-slate-400 mb-2">200 OK Response</p>
          <pre className="overflow-x-auto">
{`{
  "success": true,
  "email": "user@ghostmail.store",
  "otp": "489201",
  "subject": "Your GhostMail verification code is 489201",
  "receivedAt": "2026-10-26T21:30:00.000Z",
  "verificationLink": null,
  "fromAddress": "no-reply@auth0.com"
}`}
          </pre>
        </div>
      </section>

      {/* Endpoint 2: Programmatic Account Creation */}
      <section className="mb-14 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 p-6 md:p-8 backdrop-blur space-y-6">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2.5 py-1 text-xs font-mono font-bold">
            POST
          </span>
          <h3 className="text-xl font-bold font-mono text-slate-900 dark:text-white">/api/v1/account/create</h3>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Create a fresh mailbox with a custom password programmatically. Returns full mailbox credentials ready for immediate email delivery.
        </p>

        {/* Code Example */}
        <div className="rounded-2xl bg-slate-950 p-4 font-mono text-xs border border-white/5 text-slate-200">
          <div className="flex justify-between items-center mb-2 text-slate-400">
            <span>Example Request ({activeLang.toUpperCase()})</span>
            <button
              onClick={() => {
                const code =
                  activeLang === 'curl'
                    ? `curl -X POST https://ghostmail.store/api/v1/account/create \\\n  -H "X-API-Key: YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"username": "runner_bot", "password": "SecurePassword123!"}'`
                    : activeLang === 'python'
                      ? `import requests\n\nres = requests.post(\n    "https://ghostmail.store/api/v1/account/create",\n    headers={"X-API-Key": "YOUR_API_KEY"},\n    json={"username": "runner_bot", "password": "SecurePassword123!"}\n)\nprint(res.json())`
                      : `const res = await fetch("https://ghostmail.store/api/v1/account/create", {\n  method: "POST",\n  headers: { "X-API-Key": "YOUR_API_KEY", "Content-Type": "application/json" },\n  body: JSON.stringify({ username: "runner_bot", password: "SecurePassword123!" })\n});\nconsole.log(await res.json());`
                copyToClipboard(code, 'create-code')
              }}
              className="hover:text-white flex items-center gap-1 text-[11px]"
            >
              {copiedSection === 'create-code' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              Copy
            </button>
          </div>
          <pre className="overflow-x-auto text-cyan-300">
            {activeLang === 'curl' &&
              `curl -X POST https://ghostmail.store/api/v1/account/create \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"username": "runner_bot", "password": "SecurePassword123!"}'`}
            {activeLang === 'python' &&
              `import requests

res = requests.post(
    "https://ghostmail.store/api/v1/account/create",
    headers={"X-API-Key": "YOUR_API_KEY"},
    json={"username": "runner_bot", "password": "SecurePassword123!"}
)
print("Created:", res.json())`}
            {activeLang === 'node' &&
              `const res = await fetch("https://ghostmail.store/api/v1/account/create", {
  method: "POST",
  headers: {
    "X-API-Key": "YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    username: "runner_bot",
    password: "SecurePassword123!"
  })
});
const data = await res.json();
console.log(data);`}
          </pre>
        </div>

        {/* Response Example */}
        <div className="rounded-2xl bg-black/60 p-4 font-mono text-xs border border-white/5 text-emerald-400">
          <p className="text-slate-400 mb-2">201 Created Response</p>
          <pre className="overflow-x-auto">
{`{
  "success": true,
  "email": "runner_bot@ghostmail.store",
  "username": "runner_bot",
  "createdAt": "2026-10-26T21:35:00.000Z"
}`}
          </pre>
        </div>
      </section>

      {/* Endpoint 3: List Inbox Messages */}
      <section className="mb-14 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 p-6 md:p-8 backdrop-blur space-y-6">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 text-xs font-mono font-bold">
            GET
          </span>
          <h3 className="text-xl font-bold font-mono text-slate-900 dark:text-white">/api/v1/inbox</h3>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Fetches paginated list of all emails received by a given address.
        </p>

        <div className="rounded-2xl bg-slate-950 p-4 font-mono text-xs border border-white/5 text-cyan-300 overflow-x-auto">
          <code>curl -H &quot;X-API-Key: YOUR_API_KEY&quot; &quot;https://ghostmail.store/api/v1/inbox?email=user@ghostmail.store&amp;limit=20&quot;</code>
        </div>
      </section>

      {/* Interactive API Sandbox Playground */}
      <section className="rounded-3xl border-2 border-cyan-400/30 bg-slate-900/90 p-6 md:p-8 backdrop-blur shadow-2xl">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/20 text-cyan-400">
            <Play className="h-5 w-5 fill-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Interactive API Sandbox Playground</h2>
            <p className="text-xs text-slate-400">Test live requests directly in your browser</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Your API Key (or test with random string)
              </label>
              <input
                type="text"
                value={testKey}
                onChange={(e) => setTestKey(e.target.value)}
                placeholder="gm_live_..."
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 font-mono text-sm text-cyan-300 outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Target Endpoint
              </label>
              <select
                value={testEndpoint}
                onChange={(e) => setTestEndpoint(e.target.value as 'otp' | 'create' | 'inbox')}
                className="w-full rounded-xl border border-white/10 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
              >
                <option value="otp">GET /api/v1/inbox/otp (Extract Verification Code)</option>
                <option value="create">POST /api/v1/account/create (Create Mailbox)</option>
                <option value="inbox">GET /api/v1/inbox (List Emails)</option>
              </select>
            </div>
          </div>

          {testEndpoint !== 'create' ? (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Mailbox Address
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 font-mono text-sm text-white outline-none focus:border-cyan-400"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={testUsername}
                  onChange={(e) => setTestUsername(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 font-mono text-sm text-white outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Password
                </label>
                <input
                  type="text"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 font-mono text-sm text-white outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={runPlayground}
              disabled={running}
              className="flex items-center gap-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 px-6 py-2.5 text-sm font-bold text-slate-950 transition"
            >
              <Send className="h-4 w-4" />
              {running ? 'Executing Request...' : 'Send Live Request'}
            </button>
          </div>

          {/* Playground Response Display */}
          {testResponse !== null && (
            <div className="mt-4 rounded-2xl bg-black p-4 font-mono text-xs border border-white/10">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                <span className="text-slate-400">Server Response</span>
                <span
                  className={`rounded-full px-2 py-0.5 font-bold ${
                    testStatus && testStatus < 300
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  HTTP {testStatus}
                </span>
              </div>
              <pre className="overflow-x-auto text-slate-200">{testResponse}</pre>
            </div>
          )}
        </div>
      </section>

      <CryptoUpgradeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}
