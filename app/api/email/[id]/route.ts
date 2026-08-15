import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/lib/db';

/** Resolves the caller and the requested id, or returns an error response. */
async function resolveRequest(
  params: { id: string }
): Promise<NextResponse | { userId: number; emailId: number }> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = Number(session.user.id);
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const emailId = Number.parseInt(params.id, 10);
  if (!Number.isSafeInteger(emailId) || emailId <= 0) {
    return NextResponse.json({ error: 'Invalid email ID' }, { status: 400 });
  }

  return { userId, emailId };
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const resolved = await resolveRequest(params);
  if (resolved instanceof NextResponse) return resolved;
  const { userId, emailId } = resolved;

  try {
    // Scope the lookup by owner rather than fetching then comparing: a
    // not-found and a not-yours row are indistinguishable to the caller.
    const email = await db.email.findFirst({
      where: { id: emailId, userId, deletedAt: null },
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
      },
    });

    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    if (!email.isRead) {
      await db.email.update({
        where: { id: emailId },
        data: { isRead: true },
      });
    }

    return NextResponse.json(email, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Error fetching email:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const resolved = await resolveRequest(params);
  if (resolved instanceof NextResponse) return resolved;
  const { userId, emailId } = resolved;

  try {
    // Single scoped write: no check-then-act window, and no way to soft-delete
    // another account's mail.
    const result = await db.email.updateMany({
      where: { id: emailId, userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting email:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
