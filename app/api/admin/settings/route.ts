import { NextResponse } from 'next/server'
import { DEFAULT_ADMIN_SETTINGS, getAdminSettingsMap } from '@/lib/admin'
import { getAdminFromToken } from '@/lib/adminSession'
import { getClientIp } from '@/lib/clientIp'
import { logAudit } from '@/lib/audit'
import { db } from '@/lib/db'

const ALLOWED_KEYS = Object.keys(DEFAULT_ADMIN_SETTINGS) as Array<keyof typeof DEFAULT_ADMIN_SETTINGS>
const MAX_VALUE_LENGTH = 2000

export async function GET() {
  try {
    const admin = await getAdminFromToken()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const settings = await getAdminSettingsMap()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to fetch settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getAdminFromToken()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Allow-list the keys. The previous spread wrote whatever the caller sent,
    // so an attacker with admin access — or a buggy client — could create
    // arbitrary settings rows, and unrelated saved settings were silently reset
    // to their defaults because the merge started from DEFAULT_ADMIN_SETTINGS.
    const current = await getAdminSettingsMap()
    const updates: Array<{ key: string; value: string }> = []

    for (const key of ALLOWED_KEYS) {
      const incoming = (body as Record<string, unknown>)[key]
      if (incoming === undefined) continue

      if (typeof incoming !== 'string' && typeof incoming !== 'number' && typeof incoming !== 'boolean') {
        return NextResponse.json({ error: `Invalid value for ${key}` }, { status: 400 })
      }

      const value = String(incoming)
      if (value.length > MAX_VALUE_LENGTH) {
        return NextResponse.json({ error: `Value for ${key} is too long` }, { status: 400 })
      }

      if (value !== current[key]) updates.push({ key, value })
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: true, updated: 0 })
    }

    await db.$transaction(
      updates.map(({ key, value }) =>
        db.adminSetting.upsert({
          where: { key },
          create: { key, value },
          update: { value },
        })
      )
    )

    await logAudit(
      admin.adminId,
      'settings_update',
      updates.map(({ key }) => key).join(', '),
      `Updated ${updates.length} setting(s)`,
      getClientIp(req)
    )

    return NextResponse.json({ success: true, updated: updates.length })
  } catch (error) {
    console.error('Failed to save settings:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
