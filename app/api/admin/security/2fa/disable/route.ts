import { NextResponse } from 'next/server'
import { logAudit } from '@/lib/audit'
import { getAdminFromToken } from '@/lib/adminSession'
import { getClientIp } from '@/lib/clientIp'
import { checkRateLimit } from '@/lib/rateLimit'
import { verifyTotpToken } from '@/lib/totp'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const session = await getAdminFromToken()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Guessing the code here removes the second factor entirely.
    const limit = checkRateLimit(`2fa-disable:${session.adminId}`, 10, 15 * 60 * 1000)
    if (!limit.allowed) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
    }

    const { token } = await req.json()
    if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 })

    const admin = await db.admin.findUnique({ where: { id: session.adminId } })
    if (!admin?.twoFactorSecret) {
      return NextResponse.json({ error: '2FA not enabled' }, { status: 400 })
    }

    const valid = await verifyTotpToken(String(token), admin.twoFactorSecret)
    if (!valid) return NextResponse.json({ error: 'Invalid code' }, { status: 400 })

    await db.admin.update({
      where: { id: admin.id },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    })

    await logAudit(admin.id, '2fa_disabled', undefined, 'Two-factor authentication disabled', getClientIp(req))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('2FA disable error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
