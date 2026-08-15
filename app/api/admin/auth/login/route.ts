import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { logAudit } from '@/lib/audit'
import { verifyTotpToken } from '@/lib/totp'
import { getClientIp } from '@/lib/clientIp'
import { getJwtSecret } from '@/lib/jwtSecret'
import { checkRateLimit } from '@/lib/rateLimit'

/** A bcrypt hash of an unguessable value, used to equalise timing on unknown emails. */
const DUMMY_HASH = '$2a$12$C6UzMDM.H6dfI/f/IKcEe.ImVpjJ7iVXTMlNjNRxLxJyGxT5xNQnO'

async function issueAdminToken(admin: { id: number; email: string }) {
  const token = await new SignJWT({ adminId: admin.id, email: admin.email, scope: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getJwtSecret())

  const response = NextResponse.json({ success: true })
  response.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24,
    path: '/',
  })
  return response
}

/**
 * Short-lived proof that the password step already succeeded. The second
 * request must present this instead of a bare adminId — otherwise anyone
 * holding a TOTP code could log in without knowing the password, turning
 * two-factor auth into single-factor.
 */
async function issuePendingToken(adminId: number) {
  return new SignJWT({ adminId, scope: '2fa_pending' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(getJwtSecret())
}

async function readPendingToken(token: string): Promise<number | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    if (payload.scope !== '2fa_pending') return null
    const adminId = Number(payload.adminId)
    return Number.isSafeInteger(adminId) ? adminId : null
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)

    // Admin login is the highest-value target in the app; throttle hard.
    const limit = checkRateLimit(`admin-login:${ip}`, 8, 15 * 60 * 1000)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((limit.retryAfterMs ?? 0) / 1000)) } }
      )
    }

    const { email, password, token: totpToken, pendingToken } = await req.json()

    // ---- Step 2: complete a pending 2FA challenge ----
    if (pendingToken && totpToken) {
      const adminId = await readPendingToken(String(pendingToken))
      if (adminId === null) {
        return NextResponse.json({ error: 'Session expired. Please log in again.' }, { status: 401 })
      }

      const admin = await db.admin.findUnique({ where: { id: adminId } })
      if (!admin?.twoFactorEnabled || !admin.twoFactorSecret) {
        return NextResponse.json({ error: 'Invalid 2FA session' }, { status: 401 })
      }

      const valid = await verifyTotpToken(String(totpToken), admin.twoFactorSecret)
      if (!valid) {
        await db.failedLoginAttempt.create({ data: { email: admin.email, ip } })
        return NextResponse.json({ error: 'Invalid 2FA code' }, { status: 401 })
      }

      await logAudit(admin.id, 'admin_login', undefined, 'Admin logged in with 2FA', ip)
      return issueAdminToken(admin)
    }

    // ---- Step 1: password ----
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    // Cap before the value reaches bcrypt or the DB: bcrypt cost scales with
    // input length, so an oversized password is a cheap CPU-exhaustion lever.
    if (email.length > 320 || password.length > 200) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const admin = await db.admin.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (!admin) {
      await bcrypt.compare(password, DUMMY_HASH)
      await db.failedLoginAttempt.create({ data: { email: email.slice(0, 320), ip } })
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, admin.password)

    if (!isValid) {
      await db.failedLoginAttempt.create({ data: { email: admin.email, ip } })
      await db.suspiciousActivity.create({
        data: {
          type: 'admin_login_failed',
          description: `Failed admin login for ${admin.email}`,
          ip,
          severity: 'high',
        },
      })
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    if (admin.twoFactorEnabled && admin.twoFactorSecret) {
      return NextResponse.json({
        requires2FA: true,
        pendingToken: await issuePendingToken(admin.id),
      })
    }

    await logAudit(admin.id, 'admin_login', undefined, 'Admin logged in successfully', ip)
    return issueAdminToken(admin)
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
