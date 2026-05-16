import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = req.cookies.get("admin_token")?.value
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
    try {
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
      await jwtVerify(token, secret)
      return NextResponse.next()
    } catch {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
  }

  if (pathname.startsWith("/dashboard")) {
    const token = req.cookies.get("next-auth.session-token")?.value ||
                  req.cookies.get("__Secure-next-auth.session-token")?.value
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"]
}
