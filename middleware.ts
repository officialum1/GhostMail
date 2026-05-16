import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./auth";
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // --- Admin Routes ---
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      const adminToken = request.cookies.get('admin_token');
      if (adminToken) {
        try {
          const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'secret');
          await jwtVerify(adminToken.value, secret);
          return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        } catch (e) {
          // Token invalid, allow to proceed to login
        }
      }
      return NextResponse.next();
    }

    const adminToken = request.cookies.get('admin_token');
    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'secret');
      await jwtVerify(adminToken.value, secret);
      return NextResponse.next();
    } catch (e) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // --- User Routes ---
  const session = await auth();

  if (pathname.startsWith("/dashboard") && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if ((pathname.startsWith("/login") || pathname.startsWith("/register")) && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/admin/:path*"],
};
