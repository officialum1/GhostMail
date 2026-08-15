import { NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { getAdminFromToken } from '@/lib/adminSession'
import { createTotpSecret, createTotpUri } from '@/lib/totp'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getAdminFromToken()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = await db.admin.findUnique({
      where: { id: session.adminId },
      select: { id: true, email: true, twoFactorEnabled: true },
    })
    if (!admin) return NextResponse.json({ error: 'Admin not found' }, { status: 404 })

    // Re-running setup while 2FA is active would overwrite the live secret and
    // lock the admin out of their authenticator app.
    if (admin.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA is already enabled. Disable it before setting up a new secret.' },
        { status: 409 }
      )
    }

    const secret = createTotpSecret()
    const otpauth = createTotpUri(admin.email, secret)
    const qrCode = await QRCode.toDataURL(otpauth)

    await db.admin.update({
      where: { id: admin.id },
      data: { twoFactorSecret: secret, twoFactorEnabled: false },
    })

    return NextResponse.json({ qrCode, secret }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('2FA setup error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
