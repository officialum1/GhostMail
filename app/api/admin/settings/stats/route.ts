import { NextResponse } from 'next/server'
import { getAdminSettingsMap, parseSettingNumber } from '@/lib/admin'
import { requireAdmin } from '@/lib/admin-auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const authError = await requireAdmin()
    if (authError) return authError
    const settings = await getAdminSettingsMap()
    const retentionDays = parseSettingNumber(settings.emailRetentionDays, 30)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - retentionDays)

    const [users, emails, webhookLogs, oldEmails] = await Promise.all([
      db.user.count(),
      db.email.count({ where: { deletedAt: null } }),
      db.webhookLog.count(),
      retentionDays === 0
        ? Promise.resolve(0)
        : db.email.count({
            where: {
              deletedAt: null,
              receivedAt: { lt: cutoff },
            },
          }),
    ])

    return NextResponse.json({
      users,
      emails,
      webhookLogs,
      oldEmails,
      estimatedStorageBytes: emails * 25000,
    })
  } catch (error) {
    console.error('Failed to fetch settings stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
