import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = Number(session.user.id);
    const emails = await db.email.findMany({
      where: { 
        userId,
        deletedAt: null
      },
      orderBy: { receivedAt: 'desc' },
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
      }
    });

    return NextResponse.json(emails);
  } catch (error) {
    console.error('Error fetching inbox:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
