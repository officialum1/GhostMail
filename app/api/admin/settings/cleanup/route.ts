import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSettingsMap, parseSettingNumber } from '@/lib/admin';
import { requireAdmin } from '@/lib/admin-auth';

export async function POST() {
  try {
    const authError = await requireAdmin()
    if (authError) return authError
    const settings = await getAdminSettingsMap();
    const retentionDays = parseSettingNumber(settings.emailRetentionDays, 30);

    if (retentionDays === 0) {
      return NextResponse.json({ success: true, deleted: 0 });
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);

    const deleted = await db.email.deleteMany({
      where: {
        receivedAt: {
          lt: cutoff
        }
      }
    });

    return NextResponse.json({ success: true, deleted: deleted.count });
  } catch (error) {
    console.error('Failed to cleanup emails:', error);
    return NextResponse.json({ error: 'Failed to cleanup' }, { status: 500 });
  }
}
