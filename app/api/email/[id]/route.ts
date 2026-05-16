import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const emailId = parseInt(params.id);
    if (isNaN(emailId)) {
      return NextResponse.json({ error: 'Invalid email ID' }, { status: 400 });
    }

    const email = await db.email.findUnique({
      where: { id: emailId }
    });

    if (!email || email.userId !== session.user.id) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    if (!email.isRead) {
      await db.email.update({
        where: { id: emailId },
        data: { isRead: true }
      });
    }

    return NextResponse.json(email);
  } catch (error) {
    console.error('Error fetching email:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const emailId = parseInt(params.id);
    if (isNaN(emailId)) {
      return NextResponse.json({ error: 'Invalid email ID' }, { status: 400 });
    }

    const email = await db.email.findUnique({
      where: { id: emailId }
    });

    if (!email || email.userId !== session.user.id) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    await db.email.update({
      where: { id: emailId },
      data: { deletedAt: new Date() }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting email:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
