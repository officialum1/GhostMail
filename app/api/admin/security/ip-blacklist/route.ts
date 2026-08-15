import { NextResponse } from 'next/server'
import { logAudit } from '@/lib/audit'
import { getAdminFromToken } from '@/lib/adminSession'
import { getClientIp } from '@/lib/clientIp'
import { db } from '@/lib/db'

const MAX_REASON_LENGTH = 500

const IPV4_RE = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/
/** Deliberately permissive on IPv6 shorthand, strict on the character set. */
const IPV6_RE = /^(?=.*:)[0-9a-f:]{2,45}$/i

function normalizeIp(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const value = raw.trim()
  if (!value || value.length > 45) return null
  if (IPV4_RE.test(value)) return value
  if (IPV6_RE.test(value) && !value.includes(':::')) return value.toLowerCase()
  return null
}

export async function GET() {
  try {
    const admin = await getAdminFromToken()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const items = await db.ipBlacklist.findMany({ orderBy: { createdAt: 'desc' }, take: 1000 })
    return NextResponse.json(items)
  } catch (error) {
    console.error('IP blacklist GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getAdminFromToken()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const ip = normalizeIp(body?.ip)
    if (!ip) {
      return NextResponse.json({ error: 'A valid IPv4 or IPv6 address is required' }, { status: 400 })
    }

    const reason =
      typeof body?.reason === 'string' && body.reason.trim()
        ? body.reason.trim().slice(0, MAX_REASON_LENGTH)
        : null

    // Blocking the caller's own address locks the admin out of the panel.
    if (ip === getClientIp(req)) {
      return NextResponse.json({ error: 'Refusing to blacklist your own IP address' }, { status: 400 })
    }

    const item = await db.ipBlacklist.upsert({
      where: { ip },
      create: { ip, reason },
      update: { reason },
    })

    await logAudit(admin.adminId, 'ip_blacklist_add', ip, reason ?? undefined, getClientIp(req))

    return NextResponse.json(item)
  } catch (error) {
    console.error('IP blacklist POST error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = await getAdminFromToken()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = Number.parseInt(searchParams.get('id') || '', 10)
    if (!Number.isSafeInteger(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const item = await db.ipBlacklist.delete({ where: { id } }).catch(() => null)
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await logAudit(admin.adminId, 'ip_blacklist_remove', item.ip, undefined, getClientIp(req))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('IP blacklist DELETE error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
