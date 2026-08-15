import { NextResponse } from 'next/server'
import { DEFAULT_BLACKLISTED_USERNAMES } from '@/lib/admin'
import { requireAdmin } from '@/lib/admin-auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const authError = await requireAdmin()
    if (authError) return authError
    const items = await db.blacklistedUsername.findMany({
      orderBy: { username: 'asc' },
    })

    const defaults = DEFAULT_BLACKLISTED_USERNAMES.map((username) => ({
      id: `default:${username}`,
      username,
      createdAt: null,
      isDefault: true,
    }))

    const custom = items.map((item) => ({
      ...item,
      id: String(item.id),
      isDefault: false,
    }))

    return NextResponse.json([...defaults, ...custom])
  } catch (error) {
    console.error('Failed to fetch username blacklist:', error)
    return NextResponse.json({ error: 'Failed to fetch blacklist' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError
    const { username } = await req.json()
    if (typeof username !== 'string' || !username.trim()) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    // Same charset as registration, so a blacklist entry can actually match a
    // username someone could have registered.
    const normalized = username.trim().toLowerCase()
    if (!/^[a-z0-9]{1,20}$/.test(normalized)) {
      return NextResponse.json(
        { error: 'Username must be 1-20 lowercase letters or digits' },
        { status: 400 }
      )
    }

    const created = await db.blacklistedUsername
      .create({ data: { username: normalized } })
      .catch(() => null)

    if (!created) {
      return NextResponse.json({ error: 'That username is already blacklisted' }, { status: 409 })
    }

    return NextResponse.json(created)
  } catch (error) {
    console.error('Failed to add blacklisted username:', error)
    return NextResponse.json({ error: 'Failed to add username' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError
    const { id } = await req.json()
    const numericId = Number(id)
    if (!Number.isSafeInteger(numericId) || numericId <= 0) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }

    const deleted = await db.blacklistedUsername.delete({ where: { id: numericId } }).catch(() => null)
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete blacklisted username:', error)
    return NextResponse.json({ error: 'Failed to delete username' }, { status: 500 })
  }
}
