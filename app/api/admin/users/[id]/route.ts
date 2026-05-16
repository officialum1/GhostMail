import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

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
    const authError = await requireAdmin()
    if (authError) return authError
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const body = await req.json();
    const updates: { isBanned?: boolean; password?: string } = {};

    if (typeof body.isBanned === 'boolean') {
      updates.isBanned = body.isBanned;
    }

    if (typeof body.password === 'string' && body.password) {
      updates.password = await bcrypt.hash(body.password, 12);
    }

    const user = await db.user.update({
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
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Failed to update admin user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    // Emails are deleted automatically because of onDelete: Cascade in schema
    await db.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete admin user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
