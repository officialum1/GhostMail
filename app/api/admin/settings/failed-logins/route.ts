import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const authError = await requireAdmin()
    if (authError) return authError
    const attempts = await db.failedLoginAttempt.findMany({
      orderBy: { attemptedAt: 'desc' },
      take: 20,
    })

    return NextResponse.json(attempts)
  } catch (error) {
    console.error('Failed to fetch failed logins:', error)
    return NextResponse.json({ error: 'Failed to fetch failed logins' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const authError = await requireAdmin()
    if (authError) return authError
    await db.failedLoginAttempt.deleteMany()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to clear failed logins:', error)
    return NextResponse.json({ error: 'Failed to clear failed logins' }, { status: 500 })
  }
}
