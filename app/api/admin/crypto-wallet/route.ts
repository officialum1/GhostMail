// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { getCryptoWalletConfig, updateCryptoWalletConfig } from '@/lib/cryptoPayments'

export async function GET() {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const config = await getCryptoWalletConfig()
    return NextResponse.json(config)
  } catch (error) {
    console.error('Failed to get crypto wallet settings:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const body = await req.json()
    await updateCryptoWalletConfig(body)

    return NextResponse.json({ success: true, message: 'Crypto wallet configuration saved' })
  } catch (error) {
    console.error('Failed to update crypto wallet settings:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
