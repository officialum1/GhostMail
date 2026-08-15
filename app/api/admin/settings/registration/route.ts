import { NextResponse } from 'next/server'
import { logAudit } from '@/lib/audit'
import { getAdminFromToken } from '@/lib/adminSession'
import { getClientIp } from '@/lib/clientIp'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const admin = await getAdminFromToken()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const setting = await db.adminSetting.findUnique({ where: { key: 'registration_enabled' } })
    return NextResponse.json({ enabled: setting?.value !== 'false' })
  } catch (error) {
    console.error('Registration setting GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getAdminFromToken()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const enabled = Boolean(body?.enabled)

    const writes = [
      db.adminSetting.upsert({
        where: { key: 'registration_enabled' },
        create: { key: 'registration_enabled', value: enabled ? 'true' : 'false' },
        update: { value: enabled ? 'true' : 'false' },
      }),
    ]

    if (body?.minUsernameLength !== undefined) {
      const parsed = Number.parseInt(String(body.minUsernameLength), 10)
      const len = Number.isFinite(parsed) ? Math.min(20, Math.max(3, parsed)) : 3
      writes.push(
        db.adminSetting.upsert({
          where: { key: 'min_username_length' },
          create: { key: 'min_username_length', value: String(len) },
          update: { value: String(len) },
        })
      )
    }

    // Both settings land together, or neither does.
    await db.$transaction(writes)

    await logAudit(
      admin.adminId,
      'registration_toggle',
      undefined,
      enabled ? 'enabled' : 'disabled',
      getClientIp(req)
    )

    return NextResponse.json({ success: true, enabled })
  } catch (error) {
    console.error('Registration setting POST error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
