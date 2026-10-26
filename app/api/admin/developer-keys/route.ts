// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import {
  getDeveloperApiKeys,
  issueDeveloperApiKey,
  revokeDeveloperApiKey,
} from '@/lib/cryptoPayments'

export async function GET() {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const keys = await getDeveloperApiKeys()
    return NextResponse.json(keys)
  } catch (error) {
    console.error('Failed to get developer keys:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const body = await req.json()
    const { label, userEmail } = body

    if (!label || typeof label !== 'string') {
      return NextResponse.json({ error: 'Key label is required (e.g. Client X - Pro Plan)' }, { status: 400 })
    }

    const key = await issueDeveloperApiKey({
      label,
      userEmail,
    })

    return NextResponse.json({
      success: true,
      apiKey: key,
      message: 'Developer API key issued successfully',
    })
  } catch (error) {
    console.error('Failed to issue developer key:', error)
    return NextResponse.json({ error: 'Failed to issue key' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const body = await req.json()
    const { keyId } = body

    if (!keyId || typeof keyId !== 'string') {
      return NextResponse.json({ error: 'Invalid keyId' }, { status: 400 })
    }

    await revokeDeveloperApiKey(keyId)
    return NextResponse.json({ success: true, message: 'API key revoked' })
  } catch (error) {
    console.error('Failed to revoke developer key:', error)
    return NextResponse.json({ error: 'Failed to revoke key' }, { status: 500 })
  }
}
