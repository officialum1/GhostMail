import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { logAudit } from '@/lib/audit'
import { getAdminFromToken } from '@/lib/adminSession'
import { getClientIp } from '@/lib/clientIp'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const setting = await db.adminSetting.findUnique({ where: { key: 'registration_enabled' } })
    return NextResponse.json({ enabled: setting?.value !== 'false' })
  } catch (error) {
    console.error('Registration setting GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const { enabled, minUsernameLength } = await req.json()

    await db.adminSetting.upsert({
      where: { key: 'registration_enabled' },
      create: { key: 'registration_enabled', value: enabled ? 'true' : 'false' },
      update: { value: enabled ? 'true' : 'false' },
    })

    if (minUsernameLength !== undefined) {
      const len = Math.min(20, Math.max(3, parseInt(String(minUsernameLength), 10) || 3))
      await db.adminSetting.upsert({
        where: { key: 'min_username_length' },
        create: { key: 'min_username_length', value: String(len) },
        update: { value: String(len) },
      })
    }

    const admin = await getAdminFromToken()
    if (admin) {
      await logAudit(
        admin.adminId,
        'registration_toggle',
        undefined,
        enabled ? 'enabled' : 'disabled',
        getClientIp(req)
      )
    }

    return NextResponse.json({ success: true, enabled: Boolean(enabled) })
  } catch (error) {
    console.error('Registration setting POST error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
