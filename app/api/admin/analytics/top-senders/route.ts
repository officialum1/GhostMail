import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { getEmailDomain } from '@/lib/emailAddress'

export async function GET() {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const emails = await db.email.findMany({
      where: { deletedAt: null },
      select: { fromAddress: true },
      take: 50000,
    })

    const counts = new Map<string, number>()
    for (const email of emails) {
      const domain = getEmailDomain(email.fromAddress) || 'unknown'
      counts.set(domain, (counts.get(domain) ?? 0) + 1)
    }

    const total = emails.length || 1
    const topSenders = [...counts.entries()]
      .map(([domain, count]) => ({
        domain,
        count,
        percentage: Math.round((count / total) * 1000) / 10,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)

    return NextResponse.json(topSenders)
  } catch (error) {
    console.error('Top senders error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
