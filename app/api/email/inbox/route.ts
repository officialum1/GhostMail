import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/lib/db';

/**
 * The dashboard polls this route every 20s and filters/searches client-side,
 * so the response shape stays a plain array. Two bounds keep that affordable:
 * a row cap, and a truncated body preview (the reading pane loads the full
 * message from `/api/email/[id]`). Without them a mailbox of 256KB bodies
 * produced a multi-hundred-megabyte response on every poll.
 */
const MAX_EMAILS = 200;
const PREVIEW_LENGTH = 2000;

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = Number(session.user.id);
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const emails = await db.email.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: { receivedAt: 'desc' },
      take: MAX_EMAILS,
      select: {
        id: true,
        toAddress: true,
        fromAddress: true,
        subject: true,
        bodyText: true,
        receivedAt: true,
        isRead: true,
        sent: true,
        userId: true,
      },
    });

    return NextResponse.json(
      emails.map((email) => ({
        ...email,
        bodyText: email.bodyText ? email.bodyText.slice(0, PREVIEW_LENGTH) : email.bodyText,
      })),
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Error fetching inbox:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
