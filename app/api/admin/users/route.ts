import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const take = Number.isNaN(limit) ? 20 : limit;
  const skip = (page - 1) * take;
  const where = search ? {
    OR: [
      { username: { contains: search } },
      { email: { contains: search } }
    ]
  } : undefined;

  try {
    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
        include: {
          _count: {
            select: { emails: true }
          },
          bannedUser: {
            select: { reason: true }
          }
        }
      }),
      db.user.count({ where })
    ]);

    return NextResponse.json({
      users,
      total
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
