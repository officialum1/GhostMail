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

    const [enabled, message] = await Promise.all([
      db.adminSetting.findUnique({ where: { key: 'maintenance_mode' } }),
      db.adminSetting.findUnique({ where: { key: 'maintenance_message' } }),
    ])

    return NextResponse.json({
      enabled: enabled?.value === 'true',
      message: message?.value || "We're performing scheduled maintenance. We'll be back shortly.",
    })
  } catch (error) {
    console.error('Maintenance GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const { enabled, message } = await req.json()

    await db.$transaction([
      db.adminSetting.upsert({
        where: { key: 'maintenance_mode' },
        create: { key: 'maintenance_mode', value: enabled ? 'true' : 'false' },
        update: { value: enabled ? 'true' : 'false' },
      }),
      ...(message !== undefined
        ? [
            db.adminSetting.upsert({
              where: { key: 'maintenance_message' },
              create: { key: 'maintenance_message', value: String(message) },
              update: { value: String(message) },
            }),
          ]
        : []),
    ])

    const admin = await getAdminFromToken()
    if (admin) {
      await logAudit(
        admin.adminId,
        'maintenance_toggle',
        undefined,
        enabled ? 'enabled' : 'disabled',
        getClientIp(req)
      )
    }

    return NextResponse.json({ success: true, enabled: Boolean(enabled), message })
  } catch (error) {
    console.error('Maintenance POST error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
