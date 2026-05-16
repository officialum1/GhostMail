import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deleted = await db.email.deleteMany({
      where: {
        receivedAt: {
          lt: thirtyDaysAgo
        }
      }
    });

    return NextResponse.json({ success: true, count: deleted.count });
  } catch {
    return NextResponse.json({ error: 'Failed to cleanup' }, { status: 500 });
  }
}
