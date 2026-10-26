// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { getDeveloperApiKeys, getCryptoUpgradeRequests } from '@/lib/cryptoPayments'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const email = session.user.email.toLowerCase().trim()
    const [keys, requests] = await Promise.all([
      getDeveloperApiKeys(),
      getCryptoUpgradeRequests(),
    ])

    const userKey = keys.find((k) => k.isActive && k.userEmail === email)
    const pendingRequest = requests.find((r) => r.userEmail === email && r.status === 'pending')

    return NextResponse.json({
      isPro: Boolean(userKey),
      apiKey: userKey ? userKey.key : null,
      label: userKey ? userKey.label : null,
      pendingRequest: pendingRequest || null,
    })
  } catch (error) {
    console.error('Failed to get user API key status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
