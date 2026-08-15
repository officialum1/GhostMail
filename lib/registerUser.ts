import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { DEFAULT_BLACKLISTED_USERNAMES } from '@/lib/admin'
import { logActivity } from '@/lib/activity'
import { db } from '@/lib/db'
import { checkRateLimit } from '@/lib/rateLimit'

/**
 * Shared registration logic.
 *
 * There used to be two independent registration endpoints — `/api/auth/register`
 * and `/api/user/register` — with different rules. The one the UI actually called
 * had no rate limit, no IP blacklist check and ignored the
 * `registration_enabled` setting, so "registration closed" was trivially
 * bypassable. Both routes now share this implementation.
 */

const MIN_PASSWORD_LENGTH = 10
const MAX_PASSWORD_LENGTH = 200

export async function registerUser(opts: { username: unknown; password: unknown; ip: string }) {
  const { ip } = opts

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
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rate.retryAfterMs ?? 0) / 1000)) } }
    )
  }

  if (typeof opts.username !== 'string' || typeof opts.password !== 'string') {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
  }

  const password = opts.password
  const minLenSetting = await db.adminSetting.findUnique({ where: { key: 'min_username_length' } })
  const minLen = Math.min(20, Math.max(3, parseInt(minLenSetting?.value || '3', 10) || 3))

  const username = opts.username.toLowerCase().trim()

  if (!/^[a-z0-9]+$/.test(username) || username.length < minLen || username.length > 20) {
    return NextResponse.json(
      { error: `Username must be lowercase letters/numbers only, ${minLen}-20 characters` },
      { status: 400 }
    )
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
      { status: 400 }
    )
  }

  // bcrypt silently truncates at 72 bytes; reject absurd inputs rather than
  // spending CPU hashing them (cheap DoS vector).
  if (password.length > MAX_PASSWORD_LENGTH) {
    return NextResponse.json({ error: 'Password is too long' }, { status: 400 })
  }

  const blacklisted = await db.blacklistedUsername.findUnique({
    where: { username },
  })

  if (blacklisted || DEFAULT_BLACKLISTED_USERNAMES.includes(username)) {
    return NextResponse.json({ error: 'This username is not available' }, { status: 400 })
  }

  const domain = process.env.DOMAIN || 'ghostmail.store'
  const email = `${username}@${domain}`

  const hashedPassword = await bcrypt.hash(password, 12)

  let user
  try {
    user = await db.user.create({
      data: { username, email, password: hashedPassword },
      select: { id: true, username: true, email: true, createdAt: true },
    })
  } catch (error) {
    // Rely on the unique constraint rather than a check-then-insert, which two
    // concurrent requests can both pass.
    if (typeof error === 'object' && error !== null && (error as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
    }
    throw error
  }

  await logActivity({
    type: 'user_registered',
    message: `New user registered: ${username}`,
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
}
