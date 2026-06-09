import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { DEFAULT_BLACKLISTED_USERNAMES } from '@/lib/admin'
import { logActivity } from '@/lib/activity'
import { getClientIp } from '@/lib/clientIp'
import { db } from '@/lib/db'
import { checkRateLimit } from '@/lib/rateLimit'

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)

    const regSetting = await db.adminSetting.findUnique({
      where: { key: 'registration_enabled' },
    })
    if (regSetting?.value === 'false') {
      return NextResponse.json(
        { error: 'Registration is currently closed. Please try again later.' },
        { status: 403 }
      )
    }

    const blockedIp = await db.ipBlacklist.findUnique({ where: { ip } })
    if (blockedIp) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

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

    const minLenSetting = await db.adminSetting.findUnique({ where: { key: 'min_username_length' } })
    const minLen = Math.min(20, Math.max(3, parseInt(minLenSetting?.value || '3', 10) || 3))

    const normalizedUsername = String(username).toLowerCase()

    if (!/^[a-z0-9]+$/.test(normalizedUsername) || normalizedUsername.length < minLen) {
      return NextResponse.json(
        { error: `Username must be lowercase letters/numbers only, min ${minLen} chars` },
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
        OR: [{ username: normalizedUsername }, { email }],
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

    await logActivity({
      type: 'user_registered',
      message: `New user registered: ${normalizedUsername}`,
      userId: user.id,
      ip,
      metadata: JSON.stringify({ email: user.email }),
    })

    const recentSignups = await db.activityLog.count({
      where: {
        type: 'user_registered',
        ip,
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    })

    if (recentSignups > 5) {
      await db.suspiciousActivity.create({
        data: {
          type: 'mass_signup',
          description: `${recentSignups} signups from same IP in 1 hour`,
          ip,
          severity: 'high',
        },
      })
    }

    return NextResponse.json({ success: true, email: user.email }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
