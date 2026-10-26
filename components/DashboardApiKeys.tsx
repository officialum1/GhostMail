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
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${keyToDisplay}" \\
  -d '{"username":"runner_01","password":"SecurePassword123!"}'`,

      python: `import requests

API_KEY = "${keyToDisplay}"
BASE_URL = "${origin}"

# 1. Extract OTP verification code
res = requests.get(
    f"{BASE_URL}/api/v1/inbox/otp",
    headers={"X-API-Key": API_KEY},
    params={"email": "${userEmail}", "waitSeconds": 10}
)
otp_code = res.json().get("otp")
print("Received OTP:", otp_code)`,

      node: `// Modern async/await fetch
const API_KEY = "${keyToDisplay}";
const BASE_URL = "${origin}";

async function getOtp() {
  const res = await fetch(\`\${BASE_URL}/api/v1/inbox/otp?email=${userEmail}&waitSeconds=10\`, {
    headers: { "X-API-Key": API_KEY }
  });
  const data = await res.json();
  console.log("OTP Code:", data.otp);
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
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#07090e] p-6 md:p-10">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 dark:border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Key className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Developer REST API</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automate accounts, poll inboxes, and extract OTP codes programmatically
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
            <Link
              href="/api-docs"
              target="_blank"
              className="flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 shadow-md transition"
            >
              <Terminal className="h-3.5 w-3.5" />
              API Docs & Playground
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Status Card */}
        {isPro ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-white/70 dark:bg-[#0c1017]/80 p-6 md:p-8 shadow-sm backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Developer Pro Active</h2>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                    Live
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">High-concurrency access active (120 req/min limit)</p>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Live Secret Key</label>
              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <div className="flex-1 flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/40 px-4 py-3 font-mono text-xs text-cyan-600 dark:text-cyan-300">
                  <span>
                    {showKey ? activeKey : activeKey.slice(0, 10) + '••••••••••••••••••••••••••••••••'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={copyKeyToClipboard}
                  className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-5 py-3 text-xs font-bold text-slate-950 transition shrink-0"
                >
                  {copiedKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copy Key
                </button>
              </div>
            </div>
          </div>
        ) : isPending ? (
          <div className="rounded-2xl border border-amber-500/30 bg-white/70 dark:bg-[#0c1017]/80 p-6 md:p-8 shadow-sm backdrop-blur">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/30">
                <Clock className="h-6 w-6 animate-pulse" />
              </span>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Payment Submitted — Pending Blockchain Verification</h2>
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-500">
                    PENDING
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  We received your transaction submission for network <strong className="text-slate-900 dark:text-white">{apiKeyData?.pendingOrder?.network}</strong>.
                </p>
                <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/40 p-3 font-mono text-xs text-slate-700 dark:text-slate-300 break-all">
                  <span className="text-slate-400 select-none">TxID: </span>
                  {apiKeyData?.pendingOrder?.txId}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 via-white/70 dark:via-[#0c1017]/80 to-transparent p-6 md:p-8 shadow-xl backdrop-blur">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Developer Pro</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upgrade for High-Speed REST API Access</h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Extract OTP verification codes with 1 HTTP call, generate dynamic test accounts on demand, and automate end-to-end user flows in Playwright, Puppeteer, or scrapers.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 p-5 text-center shrink-0 min-w-[200px]">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">$19</span>
                  <span className="text-xs text-slate-400">/ mo</span>
                </div>
                <button
                  type="button"
                  onClick={onOpenUpgrade}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 shadow-md transition"
                >
                  <Zap className="h-3.5 w-3.5 fill-slate-950" />
                  Upgrade with Crypto
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Code Snippets Playground */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/70 p-6 md:p-8 backdrop-blur shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/60 dark:border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-cyan-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Quick Start Examples</h3>
            </div>

            <div className="flex items-center gap-2">
              {(['curl', 'python', 'node'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wider transition ${
                    activeTab === tab
                      ? 'bg-cyan-500 text-slate-950'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab === 'node' ? 'Node.js' : tab}
                </button>
              ))}

              <button
                type="button"
                onClick={copySnippet}
                className="ml-2 flex items-center gap-1 rounded-lg border border-slate-200 dark:border-white/10 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
              >
                {copiedSnippet ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                Copy
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-200 border border-white/5">
            <pre>{getSnippets()[activeTab]}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
