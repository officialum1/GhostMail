import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const take = 20;
  const skip = (page - 1) * take;

  try {
    const emails = await db.email.findMany({
      where: search ? {
        OR: [
          { subject: { contains: search } },
          { fromAddress: { contains: search } },
          { toAddress: { contains: search } }
        ]
      } : undefined,
      orderBy: { receivedAt: 'desc' },
      take,
      skip,
      include: {
        user: { select: { username: true } }
      }
    });

    return NextResponse.json(emails);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 });
  }
}
