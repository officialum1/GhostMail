import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSettingsMap, parseSettingNumber } from '@/lib/admin';
import { getAdminFromToken } from '@/lib/adminSession';
import { getClientIp } from '@/lib/clientIp';
import { logAudit } from '@/lib/audit';

/** Refuse to treat "yesterday" as a retention policy; below this it is a mistake. */
const MIN_RETENTION_DAYS = 1;

export async function POST(req: Request) {
  try {
    const admin = await getAdminFromToken();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await getAdminSettingsMap();
    const retentionDays = parseSettingNumber(settings.emailRetentionDays, 30);

    // 0 means "keep forever".
    if (retentionDays === 0) {
      return NextResponse.json({ success: true, deleted: 0 });
    }

    // A negative or sub-day value would put the cutoff at or after `now` and
    // delete every email in the database.
    if (retentionDays < MIN_RETENTION_DAYS) {
      return NextResponse.json(
        { error: 'Email retention is set to an invalid value; refusing to run cleanup.' },
        { status: 400 }
      );
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);

    const deleted = await db.email.deleteMany({
      where: { receivedAt: { lt: cutoff } },
    });

    await logAudit(
      admin.adminId,
      'email_cleanup',
      `retention_${retentionDays}d`,
      `Deleted ${deleted.count} emails received before ${cutoff.toISOString()}`,
      getClientIp(req)
    );

    return NextResponse.json({ success: true, deleted: deleted.count });
  } catch (error) {
    console.error('Failed to cleanup emails:', error);
    return NextResponse.json({ error: 'Failed to cleanup' }, { status: 500 });
  }
}
