import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const emails = await db.email.findMany({
      where: { userId: parseInt(session.user.id) },
      orderBy: { receivedAt: 'desc' },
      select: {
        id: true,
        toAddress: true,
        fromAddress: true,
        subject: true,
        bodyText: true,
        receivedAt: true,
        isRead: true,
        userId: true,
        // Exclude bodyHtml to keep the payload small for the list view
      }
    });

    return NextResponse.json(emails);
  } catch (error) {
    console.error('Error fetching inbox:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
