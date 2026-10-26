// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import { NextResponse } from 'next/server'
import { getDeveloperApiKeys } from '@/lib/cryptoPayments'

export type AuthResult =
  | { isAuthorized: true; keyLabel: string; userEmail?: string }
  | { isAuthorized: false; error: string }

export async function verifyDeveloperApiKey(req: Request): Promise<AuthResult> {
  const xApiKey = req.headers.get('x-api-key')?.trim()
  const authHeader = req.headers.get('authorization')?.trim()
  const bearerKey = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null

  const providedKey = xApiKey || bearerKey

  if (!providedKey) {
    return {
      isAuthorized: false,
      error: 'Missing API key. Please provide your Developer API key in the X-API-Key header or as a Bearer token.',
    }
  }

  // 1. Check Master Key from environment override (if defined)
  const masterKey = process.env.DEVELOPER_MASTER_KEY
  if (masterKey && masterKey.length >= 16 && providedKey === masterKey) {
    return { isAuthorized: true, keyLabel: 'Master Environment Key' }
  }

  // 2. Check Database Keys
  const activeKeys = await getDeveloperApiKeys()
  const matched = activeKeys.find((k) => k.isActive && k.key === providedKey)

  if (matched) {
    return {
      isAuthorized: true,
      keyLabel: matched.label,
      userEmail: matched.userEmail,
    }
  }

  return {
    isAuthorized: false,
    error: 'Invalid or revoked API key. Please verify your Developer API key or upgrade your plan.',
  }
}

export function paymentRequiredResponse(customMessage?: string) {
  return NextResponse.json(
    {
      error: 'Payment Required',
      message:
        customMessage ||
        'Programmatic API access (account creation, mailbox automation & OTP extraction) is a Paid Pro feature. Please provide a valid X-API-Key or upgrade your account.',
      upgradeUrl: '/pricing',
      docsUrl: '/api-docs',
    },
    { status: 402 }
  )
}
