import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const email = await db.email.findUnique({
      where: { id },
      include: { user: { select: { username: true } } }
    });

    if (!email) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(email);
  } catch (error) {
    console.error('Failed to fetch admin email:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    await db.email.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete admin email:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
