import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { getClientIp } from '@/lib/clientIp'
import { checkRateLimit } from '@/lib/rateLimit'

const MIN_PASSWORD_LENGTH = 10

/** Constant-time compare that tolerates differing lengths. */
function secretsMatch(provided: string, expected: string) {
  const a = crypto.createHash('sha256').update(provided).digest()
  const b = crypto.createHash('sha256').update(expected).digest()
  return crypto.timingSafeEqual(a, b)
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)
    const limit = checkRateLimit(`admin-setup:${ip}`, 5, 60 * 60 * 1000)
    if (!limit.allowed) {
      return NextResponse.json({ error: 'Too many attempts' }, { status: 429 })
    }

    // `admin.count() === 0` alone is not an authorisation check: anyone who
    // reaches the app before the first admin is provisioned can trigger this.
    // Require a deploy-time token, and fail closed when it is unset.
    const setupToken = process.env.SETUP_TOKEN
    if (!setupToken || setupToken.length < 16) {
      console.error('SETUP_TOKEN is missing or too short; refusing to run setup.')
      return NextResponse.json({ error: 'Setup is not available' }, { status: 503 })
    }

    const provided = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? ''
    if (!provided || !secretsMatch(provided, setupToken)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const count = await db.admin.count()
    if (count > 0) {
      return NextResponse.json({ error: 'Admin already exists' }, { status: 403 })
    }

    const email = process.env.ADMIN_EMAIL
    const password = process.env.ADMIN_PASSWORD

    if (!email || !password) {
      return NextResponse.json({ error: 'ADMIN_EMAIL or ADMIN_PASSWORD not configured' }, { status: 500 })
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters` },
        { status: 500 }
      )
    }

    const hashed = await bcrypt.hash(password, 12)

    // Unique constraint on email closes the race between the count() and here.
    await db.admin.create({ data: { email, password: hashed } })

    return NextResponse.json({ success: true, email })
  } catch (error) {
    console.error('Setup failed:', error)
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 })
  }
}
