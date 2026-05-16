import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const headers = ['ID', 'Username', 'Email', 'Created At'];
    const csvRows = users.map((user: { id: number; username: string; email: string; createdAt: Date }) => 
      [user.id, user.username, user.email, user.createdAt.toISOString()].join(',')
    );
    
    const csvContent = [headers.join(','), ...csvRows].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="ghostmail_users.csv"',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 });
  }
}
