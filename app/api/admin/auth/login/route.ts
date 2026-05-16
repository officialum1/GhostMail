import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { logAudit } from '@/lib/audit'
import { verifyTotpToken } from '@/lib/totp'
import { getClientIp } from '@/lib/clientIp'

async function issueAdminToken(admin: { id: number; email: string }) {
  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'secret')
  const token = await new SignJWT({ adminId: admin.id, email: admin.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(secret)

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

export async function POST(req: NextRequest) {
  try {
    const { email, password, token: totpToken, adminId } = await req.json()
    const ip = getClientIp(req)

    if (adminId && totpToken) {
      const admin = await db.admin.findUnique({ where: { id: Number(adminId) } })
      if (!admin?.twoFactorEnabled || !admin.twoFactorSecret) {
        return NextResponse.json({ error: 'Invalid 2FA session' }, { status: 401 })
      }

      const valid = await verifyTotpToken(String(totpToken), admin.twoFactorSecret)
      if (!valid) {
        return NextResponse.json({ error: 'Invalid 2FA code' }, { status: 401 })
      }

      await logAudit(admin.id, 'admin_login', undefined, 'Admin logged in with 2FA', ip)
      return issueAdminToken(admin)
    }

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const admin = await db.admin.findUnique({ where: { email } })

    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, admin.password)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    if (admin.twoFactorEnabled && admin.twoFactorSecret) {
      return NextResponse.json({ requires2FA: true, adminId: admin.id })
    }

    await logAudit(admin.id, 'admin_login', undefined, 'Admin logged in successfully', ip)
    return issueAdminToken(admin)
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
