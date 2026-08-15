import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { NextRequest } from 'next/server'
import { getJwtSecret } from '@/lib/jwtSecret'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = req.cookies.get('admin_token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    try {
      const { payload } = await jwtVerify(token, getJwtSecret())
      // Reject the short-lived 2FA-pending token: it proves the password step
      // only, not a completed login.
      if (payload.scope !== 'admin') {
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }
      return NextResponse.next()
    } catch {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  if (pathname.startsWith('/dashboard')) {
    const token =
      req.cookies.get('next-auth.session-token')?.value ||
      req.cookies.get('__Secure-next-auth.session-token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  const isPublicRoute =
    !pathname.startsWith('/admin') &&
    !pathname.startsWith('/api') &&
    pathname !== '/maintenance' &&
    !pathname.startsWith('/_next')

  if (isPublicRoute && (await isMaintenanceMode(req))) {
    return NextResponse.redirect(new URL('/maintenance', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/((?!api|_next/static|_next/image|favicon|.*\\..*).*)'],
}

/**
 * Module-scope cache for the maintenance flag.
 *
 * The middleware runs on every public request, and `next: { revalidate }` is
 * not honoured for a same-origin fetch from middleware, so this was issuing one
 * extra round-trip (and one DB query) per page view. Caching in the isolate
 * keeps it to at most one lookup per TTL per instance; a maintenance toggle
 * takes effect within `MAINTENANCE_TTL_MS`.
 */
const MAINTENANCE_TTL_MS = 30_000
let maintenanceCache: { enabled: boolean; expiresAt: number } | null = null
let maintenanceInFlight: Promise<boolean> | null = null

async function isMaintenanceMode(req: NextRequest): Promise<boolean> {
  const now = Date.now()
  if (maintenanceCache && maintenanceCache.expiresAt > now) {
    return maintenanceCache.enabled
  }

  // Collapse concurrent misses into a single request.
  if (maintenanceInFlight) return maintenanceInFlight

  maintenanceInFlight = (async () => {
    try {
      const res = await fetch(new URL('/api/public/maintenance', req.url).toString(), {
        headers: { 'x-middleware': '1' },
        cache: 'no-store',
      })
      const enabled = res.ok ? Boolean((await res.json())?.enabled) : false
      maintenanceCache = { enabled, expiresAt: Date.now() + MAINTENANCE_TTL_MS }
      return enabled
    } catch {
      // Fail open: an unreachable settings lookup must not take the site down.
      maintenanceCache = { enabled: false, expiresAt: Date.now() + MAINTENANCE_TTL_MS }
      return false
    } finally {
      maintenanceInFlight = null
    }
  })()

  return maintenanceInFlight
}
