import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'

import { authConfig } from '@/lib/auth.config'

const { auth } = NextAuth(authConfig)

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password']

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))

  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
}
