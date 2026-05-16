import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const { searchParams } = new URL(req.url)
    const resolved = searchParams.get('resolved')
    const severity = searchParams.get('severity')

    const items = await db.suspiciousActivity.findMany({
      where: {
        ...(resolved === 'true' ? { resolved: true } : resolved === 'false' ? { resolved: false } : {}),
        ...(severity ? { severity } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Suspicious activity error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
