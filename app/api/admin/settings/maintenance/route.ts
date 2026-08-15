import { NextResponse } from 'next/server'
import { logAudit } from '@/lib/audit'
import { getAdminFromToken } from '@/lib/adminSession'
import { getClientIp } from '@/lib/clientIp'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const admin = await getAdminFromToken()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
    const admin = await getAdminFromToken()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const enabled = Boolean(body?.enabled)
    const hasMessage = typeof body?.message === 'string'

    if (hasMessage && body.message.length > 1000) {
      return NextResponse.json({ error: 'Message is too long' }, { status: 400 })
    }

    await db.$transaction([
      db.adminSetting.upsert({
        where: { key: 'maintenance_mode' },
        create: { key: 'maintenance_mode', value: enabled ? 'true' : 'false' },
        update: { value: enabled ? 'true' : 'false' },
      }),
      ...(hasMessage
        ? [
            db.adminSetting.upsert({
              where: { key: 'maintenance_message' },
              create: { key: 'maintenance_message', value: body.message },
              update: { value: body.message },
            }),
          ]
        : []),
    ])

    await logAudit(
      admin.adminId,
      'maintenance_toggle',
      undefined,
      enabled ? 'enabled' : 'disabled',
      getClientIp(req)
    )

    // The middleware caches this flag for up to 30s per instance.
    return NextResponse.json({
      success: true,
      enabled,
      message: hasMessage ? body.message : undefined,
    })
  } catch (error) {
    console.error('Maintenance POST error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
