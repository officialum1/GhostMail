// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Check,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Key,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react'
import toast from 'react-hot-toast'

type ApiKeyData = {
  isPro: boolean
  apiKey: string | null
  status: string
  pendingOrder?: {
    txId: string
    network: string
    createdAt: string
  } | null
}

type DashboardApiKeysProps = {
  apiKeyData: ApiKeyData | null
  onOpenUpgrade: () => void
  onRefresh: () => void
  userEmail?: string
}

export default function DashboardApiKeys({
  apiKeyData,
  onOpenUpgrade,
  onRefresh,
  userEmail = 'user@ghostmail.store',
}: DashboardApiKeysProps) {
  const [showKey, setShowKey] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedSnippet, setCopiedSnippet] = useState(false)
  const [activeTab, setActiveTab] = useState<'curl' | 'python' | 'node'>('curl')

  const isPro = Boolean(apiKeyData?.isPro && apiKeyData?.apiKey)
  const isPending = Boolean(apiKeyData?.pendingOrder)
  const activeKey = apiKeyData?.apiKey || 'gm_live_sample_key_upgrade_to_view'

  const copyKeyToClipboard = () => {
    if (!isPro || !apiKeyData?.apiKey) {
      toast.error('Upgrade to Pro to obtain your live API key')
      return
    }
    navigator.clipboard.writeText(apiKeyData.apiKey)
    setCopiedKey(true)
    toast.success('API key copied to clipboard')
    setTimeout(() => setCopiedKey(false), 2000)
  }

  const getSnippets = () => {
    const keyToDisplay = isPro && apiKeyData?.apiKey ? apiKeyData.apiKey : 'YOUR_API_KEY'
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ghostmail.store'

    return {
      curl: `# 1. Extract OTP automatically from incoming mail
curl -X GET "${origin}/api/v1/inbox/otp?email=${userEmail}&waitSeconds=10" \\
  -H "X-API-Key: ${keyToDisplay}"

# 2. Create programmatic mailbox & password
curl -X POST "${origin}/api/v1/account/create" \\
  -H "X-API-Key: ${keyToDisplay}" \\
  -H "Content-Type: application/json" \\
  -d '{"username": "bot_agent_99", "password": "SecurePassword123"}'`,

      python: `import requests

API_KEY = "${keyToDisplay}"
BASE_URL = "${origin}"
headers = {"X-API-Key": API_KEY}

# 1. Wait up to 15s and extract OTP code automatically
res = requests.get(
    f"{BASE_URL}/api/v1/inbox/otp",
    headers=headers,
    params={"email": "${userEmail}", "waitSeconds": 15}
)
data = res.json()
print("OTP Code:", data.get("otp"))
print("Extracted from:", data.get("subject"))

# 2. Create new mailbox
new_acc = requests.post(
    f"{BASE_URL}/api/v1/account/create",
    headers=headers,
    json={"username": "auto_qa_runner", "password": "Pass_${Date.now()}"}
)
print("New Mailbox:", new_acc.json())`,

      node: `// Modern Node.js / TypeScript fetch
const API_KEY = "${keyToDisplay}";
const BASE_URL = "${origin}";

// 1. Fetch OTP code directly
async function getOtp() {
  const res = await fetch(\`\${BASE_URL}/api/v1/inbox/otp?email=${userEmail}&waitSeconds=10\`, {
    headers: { "X-API-Key": API_KEY }
  });
  const data = await res.json();
  console.log("OTP Code:", data.otp);
  return data.otp;
}

getOtp();`,
    }
  }

  const copySnippet = () => {
    const snippets = getSnippets()
    navigator.clipboard.writeText(snippets[activeTab])
    setCopiedSnippet(true)
    toast.success('Snippet copied to clipboard')
    setTimeout(() => setCopiedSnippet(false), 2000)
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-900/60 p-6 md:p-10">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-md">
                <Key className="h-5 w-5 text-slate-950 font-bold" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Developer REST API</h1>
                <p className="text-xs text-slate-400">Automate accounts, retrieve inboxes, and extract OTP codes programmatically</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
            <Link
              href="/api-docs"
              target="_blank"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md hover:opacity-90 transition"
            >
              <Terminal className="h-3.5 w-3.5" />
              API Docs & Playground
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Status Card */}
        {isPro ? (
          <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-slate-900 to-slate-900 p-6 md:p-8 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">Developer Pro Active</h2>
                    <span className="rounded-full bg-emerald-400/20 border border-emerald-400/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                      Live
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">High-concurrency access unlocked (120 req/min limit)</p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Your Live API Secret Key</label>
              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <div className="flex-1 flex items-center justify-between rounded-xl border border-white/15 bg-black/40 px-4 py-3 font-mono text-sm text-cyan-300">
                  <span>
                    {showKey
                      ? activeKey
                      : activeKey.slice(0, 10) + '••••••••••••••••••••••••••••••••'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="p-1 text-slate-400 hover:text-white transition"
                    title={showKey ? 'Hide key' : 'Show key'}
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={copyKeyToClipboard}
                  className="flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-300 transition shrink-0"
                >
                  {copiedKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copy Key
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Pass this key in your HTTP requests as <code className="text-cyan-300 font-mono">X-API-Key: {activeKey.slice(0, 10)}...</code> or <code className="text-cyan-300 font-mono">Authorization: Bearer ...</code>. Keep this key confidential.
              </p>
            </div>
          </div>
        ) : isPending ? (
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-900 p-6 md:p-8 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Clock className="h-6 w-6 animate-pulse" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">Payment Submitted — Pending Blockchain Verification</h2>
                  <span className="rounded-full bg-amber-400/20 border border-amber-400/30 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
                    PENDING
                  </span>
                </div>
                <p className="text-sm text-slate-300">
                  We received your transaction submission for network <strong className="text-white">{apiKeyData?.pendingOrder?.network}</strong>.
                </p>
                <div className="rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-xs text-slate-300 break-all">
                  <span className="text-slate-500 select-none">TxID: </span>
                  {apiKeyData?.pendingOrder?.txId}
                </div>
                <p className="text-xs text-slate-400">
                  Our verification team validates the transaction receipt. Your API key will activate automatically within 10–30 minutes. You may click &quot;Refresh&quot; to check the status.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-3xl border-2 border-cyan-400/40 bg-gradient-to-br from-cyan-950/30 via-slate-900 to-indigo-950/40 p-6 md:p-8 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-cyan-400" />
                  <span className="text-xs uppercase tracking-widest text-cyan-400 font-bold">Pro Feature</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Upgrade to Developer Pro for REST API Access</h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Extract OTP verification codes with 1 HTTP call, generate dynamic test accounts on demand, and automate end-to-end user flows in Playwright, Selenium, Puppeteer, or custom scrapers.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>Instant regex OTP parser endpoint</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>Programmatic mailbox generation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>Long-polling waitSeconds support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>Crypto USDT / Binance Pay checkout</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center rounded-2xl border border-cyan-400/30 bg-black/40 p-6 text-center shrink-0 min-w-[220px]">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Subscription</span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$19</span>
                  <span className="text-xs text-slate-400">/ mo</span>
                </div>
                <button
                  type="button"
                  onClick={onOpenUpgrade}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-500 px-4 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:opacity-95 transition"
                >
                  <Zap className="h-4 w-4 fill-slate-950" />
                  Upgrade with Crypto
                </button>
                <span className="mt-2 text-[10px] text-slate-400">TRC-20 • BEP-20 • Binance Pay</span>
              </div>
            </div>
          </div>
        )}

        {/* Code Snippets Playground */}
        <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <Terminal className="h-5 w-5 text-cyan-400" />
              <h3 className="font-bold text-white text-base">Quick Start Code Examples</h3>
            </div>

            <div className="flex items-center gap-2">
              {(['curl', 'python', 'node'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                    activeTab === tab
                      ? 'bg-cyan-400 text-slate-950 shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {tab === 'node' ? 'Node.js' : tab}
                </button>
              ))}

              <button
                type="button"
                onClick={copySnippet}
                className="ml-2 flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10 transition"
              >
                {copiedSnippet ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                Copy
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-2xl bg-black/60 p-4 font-mono text-xs leading-relaxed text-slate-200 border border-white/5">
            <pre>{getSnippets()[activeTab]}</pre>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <span>
              💡 Tip: Use <code className="text-cyan-300 font-mono">waitSeconds=15</code> on OTP queries to avoid manual sleep loops in your automation.
            </span>
            <Link href="/api-docs" target="_blank" className="text-cyan-400 hover:underline flex items-center gap-1">
              Full API Specification & Endpoints →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
