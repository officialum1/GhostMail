import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminFromToken } from '@/lib/adminSession';
import { getClientIp } from '@/lib/clientIp';
import { logAudit } from '@/lib/audit';

function parseId(raw: string) {
  const id = Number.parseInt(raw, 10);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await getAdminFromToken();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const id = parseId(params.id);
    if (id === null) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const email = await db.email.findUnique({
      where: { id },
      select: {
        id: true,
        toAddress: true,
        fromAddress: true,
        subject: true,
        bodyText: true,
        bodyHtml: true,
        rawHeaders: true,
        receivedAt: true,
        isRead: true,
        sent: true,
        user: { select: { username: true } },
      },
    });

    if (!email) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(email, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Failed to fetch admin email:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await getAdminFromToken();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const id = parseId(params.id);
    if (id === null) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const email = await db.email
      .update({
        where: { id },
        data: { deletedAt: new Date() },
        select: { toAddress: true, fromAddress: true },
      })
      .catch(() => null);

    if (!email) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await logAudit(
      admin.adminId,
      'email_delete',
      String(id),
      `Soft-deleted email to ${email.toAddress}`,
      getClientIp(req)
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete admin email:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
