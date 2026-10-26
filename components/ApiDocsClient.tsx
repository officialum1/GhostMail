// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

'use client'

import { useState } from 'react'
import {
  Check,
  Copy,
  Flame,
  Play,
  Send,
  Shield,
  Terminal,
} from 'lucide-react'
import toast from 'react-hot-toast'
import CryptoUpgradeModal from '@/components/CryptoUpgradeModal'
import PublicHero from '@/components/public/PublicHero'

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
    <div className="w-full">
      {/* Unified Public Hero */}
      <PublicHero
        badgeText="API Reference v1 • Pro Active"
        badgeIcon={<Terminal className="h-3.5 w-3.5 text-cyan-500" />}
        title="Developer REST API &"
        highlightText="Automated OTP Engine."
        description="Programmatically generate private mailboxes, poll incoming messages, and extract pure verification codes via REST API. Engineered for QA test suites, automation bots, and scrapers."
        primaryCtaText="Get Developer Key ($19)"
        primaryCtaLink="/pricing"
        secondaryCtaText="View My Dashboard"
        secondaryCtaLink="/dashboard"
      />

      <div className="mx-auto max-w-6xl px-6 py-12 space-y-10">
        {/* Language Tabs Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-white/10 pb-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Terminal className="h-4 w-4 text-cyan-500" />
            <span>Select Code Language:</span>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/70 p-1 backdrop-blur">
            {(['curl', 'python', 'node'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider transition ${
                  activeLang === lang
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {lang === 'node' ? 'Node.js' : lang}
              </button>
            ))}
          </div>
        </div>

        {/* 1. Authentication Guide */}
        <section className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/70 p-6 md:p-8 backdrop-blur shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Shield className="h-4.5 w-4.5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">API Authentication</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Required on all endpoints under /api/v1/*</p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Include your active API key in the <code className="rounded bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 font-mono text-cyan-600 dark:text-cyan-400 text-xs">X-API-Key</code> request header, or via standard <code className="rounded bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 font-mono text-cyan-600 dark:text-cyan-400 text-xs">Authorization: Bearer &lt;KEY&gt;</code>.
          </p>

          <div className="rounded-xl bg-slate-950 p-3.5 font-mono text-xs text-slate-300 border border-white/5 flex items-center justify-between">
            <code>X-API-Key: gm_live_••••••••••••••••••••••••••••••••</code>
            <button
              onClick={() => copyToClipboard('X-API-Key: gm_live_your_pro_key_here', 'auth-header')}
              className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
            >
              {copiedSection === 'auth-header' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              Copy
            </button>
          </div>
        </section>

        {/* 2. Endpoint: Instant OTP Extraction */}
        <section className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/70 p-6 md:p-8 backdrop-blur shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-mono font-bold">
                GET
              </span>
              <h3 className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white">
                /api/v1/inbox/otp
              </h3>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-500">
              <Flame className="h-3.5 w-3.5" /> High Demand
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Extracts pure 4–8 digit verification codes and action links using regex heuristics without needing to parse raw HTML. Supports long-polling via <code className="font-mono text-cyan-600 dark:text-cyan-400">waitSeconds</code>.
          </p>

          {/* Code Sample */}
          <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-300 border border-white/5 space-y-2">
            <div className="flex justify-between items-center text-slate-400 border-b border-white/10 pb-2">
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
                className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
              >
                {copiedSection === 'otp-code' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                Copy Code
              </button>
            </div>
            <pre className="overflow-x-auto text-cyan-300 py-1">
              {activeLang === 'curl' && `curl -H "X-API-Key: gm_live_..." "https://ghostmail.store/api/v1/inbox/otp?email=test@ghostmail.store&waitSeconds=10"`}
              {activeLang === 'python' && `import requests\nres = requests.get("https://ghostmail.store/api/v1/inbox/otp", headers={"X-API-Key": "gm_live_..."}, params={"email": "test@ghostmail.store"})\nprint(res.json())`}
              {activeLang === 'node' && `const res = await fetch("https://ghostmail.store/api/v1/inbox/otp?email=test@ghostmail.store", { headers: { "X-API-Key": "gm_live_..." } });\nconsole.log(await res.json());`}
            </pre>
          </div>
        </section>

        {/* 3. Endpoint: Programmatic Account Creation */}
        <section className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/70 p-6 md:p-8 backdrop-blur shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 px-2.5 py-0.5 text-xs font-mono font-bold">
              POST
            </span>
            <h3 className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white">
              /api/v1/account/create
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Spins up a permanent or temporary inbox address instantly. Returns address and credentials in JSON.
          </p>
          <div className="rounded-xl bg-slate-950 p-3.5 font-mono text-xs text-cyan-300 border border-white/5 overflow-x-auto">
            <code>{`curl -X POST -H "Content-Type: application/json" -H "X-API-Key: YOUR_KEY" -d '{"username":"bot_12","password":"Pass123!"}' https://ghostmail.store/api/v1/account/create`}</code>
          </div>
        </section>

        {/* 4. Interactive In-Browser Sandbox Playground */}
        <section className="rounded-2xl border-2 border-cyan-500/30 bg-[#07090e] p-6 md:p-8 shadow-2xl backdrop-blur space-y-5">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
              <Play className="h-4.5 w-4.5 fill-cyan-400" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white">Interactive In-Browser API Playground</h2>
              <p className="text-xs text-slate-400">Send live requests directly from your browser to test endpoints</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Your API Key (or test with random string)
              </label>
              <input
                type="text"
                value={testKey}
                onChange={(e) => setTestKey(e.target.value)}
                placeholder="gm_live_..."
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 font-mono text-xs text-cyan-300 outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Select API Endpoint
              </label>
              <select
                value={testEndpoint}
                onChange={(e) => setTestEndpoint(e.target.value as 'otp' | 'create' | 'inbox')}
                className="w-full rounded-xl border border-white/10 bg-[#0d121b] px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400"
              >
                <option value="otp">GET /api/v1/inbox/otp (Extract Verification Code)</option>
                <option value="create">POST /api/v1/account/create (Create Mailbox)</option>
                <option value="inbox">GET /api/v1/inbox (List Inbox Messages)</option>
              </select>
            </div>
          </div>

          {testEndpoint !== 'create' ? (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Target Email Address
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 font-mono text-xs text-white outline-none focus:border-cyan-400"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Username</label>
                <input
                  type="text"
                  value={testUsername}
                  onChange={(e) => setTestUsername(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 font-mono text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Password</label>
                <input
                  type="text"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 font-mono text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={runPlayground}
              disabled={running}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-5 py-2.5 text-xs font-bold text-slate-950 transition"
            >
              <Send className="h-3.5 w-3.5" />
              {running ? 'Executing...' : 'Send Live Request'}
            </button>
          </div>

          {/* Response Box */}
          {testResponse !== null && (
            <div className="rounded-xl bg-black/80 p-4 font-mono text-xs border border-white/10 space-y-2">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">Response Body</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
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
        </section>
      </div>

      <CryptoUpgradeModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
