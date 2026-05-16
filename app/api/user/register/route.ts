import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { DEFAULT_BLACKLISTED_USERNAMES } from '@/lib/admin'
import { db } from '@/lib/db'
import { checkRateLimit } from '@/lib/rateLimit'

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'

    const rate = checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000)
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Try again later.' },
        { status: 429 }
      )
    }

    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    const normalizedUsername = String(username).toLowerCase()

    if (!/^[a-z0-9]+$/.test(normalizedUsername) || normalizedUsername.length < 3) {
      return NextResponse.json(
        { error: 'Username must be lowercase letters/numbers only, min 3 chars' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const blacklisted = await db.blacklistedUsername.findUnique({
      where: { username: normalizedUsername },
    })

    if (blacklisted || DEFAULT_BLACKLISTED_USERNAMES.includes(normalizedUsername)) {
      return NextResponse.json({ error: 'This username is not available' }, { status: 400 })
    }

    const domain = process.env.DOMAIN || 'ghostmail.store'
    const email = `${normalizedUsername}@${domain}`

    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ username: normalizedUsername }, { email: { equals: email, mode: 'insensitive' } }],
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await db.user.create({
      data: {
        username: normalizedUsername,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ success: true, email: user.email }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
