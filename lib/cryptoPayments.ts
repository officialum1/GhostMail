// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import crypto from 'node:crypto'
import { db } from '@/lib/db'

export type CryptoWalletConfig = {
  usdtTrc20Address: string
  usdtBep20Address: string
  binancePayId: string
  proPriceUsd: number
}

export type CryptoUpgradeRequest = {
  id: string
  userEmail: string
  network: 'USDT_TRC20' | 'USDT_BEP20' | 'BINANCE_PAY'
  txId: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  approvedAt?: string
  generatedApiKey?: string
}

export type DeveloperApiKeyRecord = {
  id: string
  key: string
  maskedKey: string
  label: string
  userEmail?: string
  createdAt: string
  isActive: boolean
}

const DEFAULT_WALLETS: CryptoWalletConfig = {
  usdtTrc20Address: 'TLvYs6hG7Qd8vA5Ea9K1wZ7NxU2mP4rT9e',
  usdtBep20Address: '0x71C836384D3F6F4ce69528dC7C0b1965eBcE91aA',
  binancePayId: '849201948',
  proPriceUsd: 19,
}

export async function getCryptoWalletConfig(): Promise<CryptoWalletConfig> {
  try {
    const rows = await db.adminSetting.findMany({
      where: {
        key: {
          in: [
            'crypto_usdt_trc20_address',
            'crypto_usdt_bep20_address',
            'crypto_binance_pay_id',
            'crypto_pro_price',
          ],
        },
      },
    })

    const map = new Map(rows.map((r) => [r.key, r.value]))
    return {
      usdtTrc20Address: map.get('crypto_usdt_trc20_address') || DEFAULT_WALLETS.usdtTrc20Address,
      usdtBep20Address: map.get('crypto_usdt_bep20_address') || DEFAULT_WALLETS.usdtBep20Address,
      binancePayId: map.get('crypto_binance_pay_id') || DEFAULT_WALLETS.binancePayId,
      proPriceUsd: Number(map.get('crypto_pro_price')) || DEFAULT_WALLETS.proPriceUsd,
    }
  } catch (err) {
    console.error('Error fetching crypto wallet config:', err)
    return DEFAULT_WALLETS
  }
}

export async function updateCryptoWalletConfig(config: Partial<CryptoWalletConfig>): Promise<void> {
  const writes = []

  if (config.usdtTrc20Address !== undefined) {
    writes.push(
      db.adminSetting.upsert({
        where: { key: 'crypto_usdt_trc20_address' },
        create: { key: 'crypto_usdt_trc20_address', value: config.usdtTrc20Address.trim() },
        update: { value: config.usdtTrc20Address.trim() },
      })
    )
  }
  if (config.usdtBep20Address !== undefined) {
    writes.push(
      db.adminSetting.upsert({
        where: { key: 'crypto_usdt_bep20_address' },
        create: { key: 'crypto_usdt_bep20_address', value: config.usdtBep20Address.trim() },
        update: { value: config.usdtBep20Address.trim() },
      })
    )
  }
  if (config.binancePayId !== undefined) {
    writes.push(
      db.adminSetting.upsert({
        where: { key: 'crypto_binance_pay_id' },
        create: { key: 'crypto_binance_pay_id', value: config.binancePayId.trim() },
        update: { value: config.binancePayId.trim() },
      })
    )
  }
  if (config.proPriceUsd !== undefined) {
    writes.push(
      db.adminSetting.upsert({
        where: { key: 'crypto_pro_price' },
        create: { key: 'crypto_pro_price', value: String(config.proPriceUsd) },
        update: { value: String(config.proPriceUsd) },
      })
    )
  }

  if (writes.length > 0) {
    await db.$transaction(writes)
  }
}

// ----------------- Upgrade Orders -----------------

export async function getCryptoUpgradeRequests(): Promise<CryptoUpgradeRequest[]> {
  try {
    const row = await db.adminSetting.findUnique({
      where: { key: 'crypto_upgrade_requests' },
    })
    if (!row?.value) return []
    return JSON.parse(row.value)
  } catch (err) {
    console.error('Error getting upgrade requests:', err)
    return []
  }
}

export async function submitCryptoUpgradeRequest(opts: {
  userEmail: string
  network: 'USDT_TRC20' | 'USDT_BEP20' | 'BINANCE_PAY'
  txId: string
}): Promise<CryptoUpgradeRequest> {
  const current = await getCryptoUpgradeRequests()
  const config = await getCryptoWalletConfig()

  const newRequest: CryptoUpgradeRequest = {
    id: `req_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    userEmail: opts.userEmail.toLowerCase().trim(),
    network: opts.network,
    txId: opts.txId.trim(),
    amount: config.proPriceUsd,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  const updated = [newRequest, ...current]
  await db.adminSetting.upsert({
    where: { key: 'crypto_upgrade_requests' },
    create: { key: 'crypto_upgrade_requests', value: JSON.stringify(updated) },
    update: { value: JSON.stringify(updated) },
  })

  return newRequest
}

export async function approveCryptoUpgradeRequest(
  requestId: string
): Promise<{ request: CryptoUpgradeRequest; apiKey: string }> {
  const requests = await getCryptoUpgradeRequests()
  const req = requests.find((r) => r.id === requestId)
  if (!req) throw new Error('Order not found')

  const apiKey = await issueDeveloperApiKey({
    label: `Pro User: ${req.userEmail}`,
    userEmail: req.userEmail,
  })

  req.status = 'approved'
  req.approvedAt = new Date().toISOString()
  req.generatedApiKey = apiKey

  await db.adminSetting.upsert({
    where: { key: 'crypto_upgrade_requests' },
    create: { key: 'crypto_upgrade_requests', value: JSON.stringify(requests) },
    update: { value: JSON.stringify(requests) },
  })

  return { request: req, apiKey }
}

export async function rejectCryptoUpgradeRequest(requestId: string): Promise<void> {
  const requests = await getCryptoUpgradeRequests()
  const req = requests.find((r) => r.id === requestId)
  if (!req) throw new Error('Order not found')

  req.status = 'rejected'

  await db.adminSetting.upsert({
    where: { key: 'crypto_upgrade_requests' },
    create: { key: 'crypto_upgrade_requests', value: JSON.stringify(requests) },
    update: { value: JSON.stringify(requests) },
  })
}

// ----------------- Developer API Keys -----------------

export async function getDeveloperApiKeys(): Promise<DeveloperApiKeyRecord[]> {
  try {
    const row = await db.adminSetting.findUnique({
      where: { key: 'developer_api_keys' },
    })
    if (!row?.value) return []
    return JSON.parse(row.value)
  } catch (err) {
    console.error('Error getting developer api keys:', err)
    return []
  }
}

export async function issueDeveloperApiKey(opts: {
  label: string
  userEmail?: string
}): Promise<string> {
  const current = await getDeveloperApiKeys()
  const rawKey = `gm_live_${crypto.randomBytes(24).toString('hex')}`
  const maskedKey = `${rawKey.slice(0, 12)}...${rawKey.slice(-4)}`

  const newKey: DeveloperApiKeyRecord = {
    id: `key_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    key: rawKey,
    maskedKey,
    label: opts.label.trim(),
    userEmail: opts.userEmail?.toLowerCase().trim(),
    createdAt: new Date().toISOString(),
    isActive: true,
  }

  const updated = [newKey, ...current]
  await db.adminSetting.upsert({
    where: { key: 'developer_api_keys' },
    create: { key: 'developer_api_keys', value: JSON.stringify(updated) },
    update: { value: JSON.stringify(updated) },
  })

  return rawKey
}

export async function revokeDeveloperApiKey(keyId: string): Promise<void> {
  const keys = await getDeveloperApiKeys()
  const keyRecord = keys.find((k) => k.id === keyId)
  if (!keyRecord) throw new Error('Key not found')

  keyRecord.isActive = false

  await db.adminSetting.upsert({
    where: { key: 'developer_api_keys' },
    create: { key: 'developer_api_keys', value: JSON.stringify(keys) },
    update: { value: JSON.stringify(keys) },
  })
}
