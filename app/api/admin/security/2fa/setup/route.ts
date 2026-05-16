import { NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { requireAdmin } from '@/lib/admin-auth'
import { getAdminFromToken } from '@/lib/adminSession'
import { createTotpSecret, createTotpUri } from '@/lib/totp'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const session = await getAdminFromToken()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = await db.admin.findUnique({ where: { id: session.adminId } })
    if (!admin) return NextResponse.json({ error: 'Admin not found' }, { status: 404 })

    const secret = createTotpSecret()
    const otpauth = createTotpUri(admin.email, secret)
    const qrCode = await QRCode.toDataURL(otpauth)

    await db.admin.update({
      where: { id: admin.id },
      data: { twoFactorSecret: secret, twoFactorEnabled: false },
    })

    return NextResponse.json({ qrCode, secret })
  } catch (error) {
    console.error('2FA setup error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
