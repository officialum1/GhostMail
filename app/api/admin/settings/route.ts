import { NextResponse } from 'next/server'
import { DEFAULT_ADMIN_SETTINGS, getAdminSettingsMap } from '@/lib/admin'
import { requireAdmin } from '@/lib/admin-auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const authError = await requireAdmin()
    if (authError) return authError
    const settings = await getAdminSettingsMap()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to fetch settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError
    const body = await req.json()
    const entries = Object.entries({ ...DEFAULT_ADMIN_SETTINGS, ...body }).filter(([, value]) => value !== undefined)

    await db.$transaction(
      entries.map(([key, value]) =>
        db.adminSetting.upsert({
          where: { key },
          create: { key, value: String(value) },
          update: { value: String(value) },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save settings:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
