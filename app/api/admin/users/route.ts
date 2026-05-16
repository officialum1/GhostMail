import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const take = 20;
  const skip = (page - 1) * take;

  try {
    const users = await db.user.findMany({
      where: search ? {
        OR: [
          { username: { contains: search } },
          { email: { contains: search } }
        ]
      } : undefined,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
      include: {
        _count: {
          select: { emails: true }
        }
      }
    });

    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
