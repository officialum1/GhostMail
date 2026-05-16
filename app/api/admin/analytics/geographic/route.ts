import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const logs = await db.activityLog.findMany({
      where: { ip: { not: null } },
      select: { ip: true },
      take: 10000,
      orderBy: { createdAt: 'desc' },
    })

    const counts = new Map<string, number>()
    for (const log of logs) {
      if (!log.ip || log.ip === 'unknown') continue
      const prefix = log.ip.split('.').slice(0, 2).join('.') + '.*'
      counts.set(prefix, (counts.get(prefix) ?? 0) + 1)
    }

    const topIps = [...counts.entries()]
      .map(([ipPrefix, count]) => ({ ipPrefix, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15)

    return NextResponse.json(topIps)
  } catch (error) {
    console.error('Geographic error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
