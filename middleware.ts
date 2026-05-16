import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = req.cookies.get('admin_token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    try {
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
      await jwtVerify(token, secret)
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

  if (isPublicRoute) {
    try {
      const maintenanceUrl = new URL('/api/public/maintenance', req.url)
      const res = await fetch(maintenanceUrl.toString(), {
        headers: { 'x-middleware': '1' },
        next: { revalidate: 30 },
      })
      if (res.ok) {
        const data = await res.json()
        if (data.enabled) {
          return NextResponse.redirect(new URL('/maintenance', req.url))
        }
      }
    } catch {
      /* continue if check fails */
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/((?!api|_next/static|_next/image|favicon|.*\\..*).*)'],
}
