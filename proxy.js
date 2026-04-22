import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'

export function proxy(request) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth_token')?.value
  const decoded = token ? verifyToken(token) : null

  // Proteksi route admin
  if (pathname.startsWith('/admin')) {
    if (!decoded) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (decoded.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Proteksi route customer
  const protectedRoutes = ['/checkout', '/orders', '/wishlist', '/profile']
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!decoded) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Redirect jika sudah login
  if ((pathname === '/login' || pathname === '/register') && decoded) {
    if (decoded.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/checkout/:path*',
    '/orders/:path*',
    '/wishlist/:path*',
    '/profile/:path*',
    '/login',
    '/register',
  ],
}
