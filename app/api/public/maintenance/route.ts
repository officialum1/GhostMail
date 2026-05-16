import { NextResponse } from 'next/server'
import { getAdminSettingsMap } from '@/lib/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const settings = await getAdminSettingsMap()
    return NextResponse.json({
      enabled: settings.maintenance_mode === 'true',
      message: settings.maintenance_message || "We're performing scheduled maintenance. We'll be back shortly.",
    })
  } catch {
    return NextResponse.json({ enabled: false, message: '' })
  }
}
