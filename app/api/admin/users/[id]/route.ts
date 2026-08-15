import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { getAdminFromToken } from '@/lib/adminSession';
import { getClientIp } from '@/lib/clientIp';
import { logAudit } from '@/lib/audit';

const MIN_PASSWORD_LENGTH = 10;
const MAX_PASSWORD_LENGTH = 200;

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

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        isBanned: true,
        lastActive: true,
        _count: { select: { emails: true } },
        bannedUser: true,
        emails: {
          where: { deletedAt: null },
          orderBy: { receivedAt: 'desc' },
          take: 100,
          select: {
            id: true,
            toAddress: true,
            fromAddress: true,
            subject: true,
            bodyText: true,
            bodyHtml: true,
            receivedAt: true,
            isRead: true,
            sent: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to fetch admin user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await getAdminFromToken();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const id = parseId(params.id);
    if (id === null) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const body = await req.json();
    const updates: { isBanned?: boolean; password?: string } = {};
    const changed: string[] = [];

    if (typeof body.isBanned === 'boolean') {
      updates.isBanned = body.isBanned;
      changed.push(body.isBanned ? 'banned' : 'unbanned');
    }

    if (body.password !== undefined) {
      if (
        typeof body.password !== 'string' ||
        body.password.length < MIN_PASSWORD_LENGTH ||
        body.password.length > MAX_PASSWORD_LENGTH
      ) {
        return NextResponse.json(
          { error: `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters` },
          { status: 400 }
        );
      }
      updates.password = await bcrypt.hash(body.password, 12);
      changed.push('password');
    }

    if (changed.length === 0) {
      return NextResponse.json({ error: 'No supported fields to update' }, { status: 400 });
    }

    const user = await db.user
      .update({
        where: { id },
        data: updates,
        select: {
          id: true,
          username: true,
          email: true,
          isBanned: true,
          createdAt: true,
          lastActive: true,
        },
      })
      .catch(() => null);

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    await logAudit(
      admin.adminId,
      'user_update',
      user.username,
      `Changed: ${changed.join(', ')}`,
      getClientIp(req)
    );

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Failed to update admin user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await getAdminFromToken();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const id = parseId(params.id);
    if (id === null) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    // Emails are deleted automatically because of onDelete: Cascade in schema
    const user = await db.user
      .delete({ where: { id }, select: { username: true, email: true } })
      .catch(() => null);

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    await logAudit(
      admin.adminId,
      'user_delete',
      user.username,
      `Deleted user ${user.username} (${user.email})`,
      getClientIp(req)
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete admin user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
