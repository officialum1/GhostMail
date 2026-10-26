// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { verifyDeveloperApiKey, paymentRequiredResponse } from '@/lib/apiAuth'
import { registerUser } from '@/lib/registerUser'
import { getClientIp } from '@/lib/clientIp'

export async function POST(req: Request) {
  try {
    // 1. Verify Developer API Key (Paid Feature)
    const auth = await verifyDeveloperApiKey(req)
    if (!auth.isAuthorized) {
      return paymentRequiredResponse(auth.error)
    }

    // 2. Read optional custom credentials
    const body = await req.json().catch(() => ({}))
    let username = typeof body?.username === 'string' ? body.username.toLowerCase().trim() : ''
    let password = typeof body?.password === 'string' ? body.password : ''

    // Auto-generate random credentials if not provided
    if (!username) {
      const randSuffix = crypto.randomBytes(3).toString('hex')
      username = `ghost_${randSuffix}`
    }

    if (!password) {
      password = `Gh0st!${crypto.randomBytes(6).toString('hex')}`
    }

    const domain = process.env.DOMAIN || process.env.NEXT_PUBLIC_DOMAIN || 'ghostmail.store'

    // 3. Register user in database
    const regRes = await registerUser({
      username,
      password,
      ip: getClientIp(req),
    })

    const regData = await regRes.json()

    if (!regRes.ok) {
      return NextResponse.json(
        { error: regData.error || 'Failed to create account' },
        { status: regRes.status }
      )
    }

    return NextResponse.json(
      {
        success: true,
        email: `${username}@${domain}`,
        username,
        password,
        createdAt: new Date().toISOString(),
        plan: 'Developer Pro',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('API account create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
