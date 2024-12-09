// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/app/lib/auth.server';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  if (request.nextUrl.pathname === '/login' && token) {
    try {
      const decodedToken = await verifyAccessToken(token);
      if (decodedToken) {
        return NextResponse.redirect(new URL(`/dashboard/${decodedToken.role}`, request.url));
      }
    } catch (error) {
      return NextResponse.next();
    }
  }

  if (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/api/users')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const decodedToken = await verifyAccessToken(token);
      if (!decodedToken) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      const path = request.nextUrl.pathname;
      const userRole = decodedToken.role;

      if (path === '/dashboard') {
        return NextResponse.redirect(new URL(`/dashboard/${userRole}`, request.url));
      }

      const rolePath = `/dashboard/${userRole}`;
      if (!path.startsWith(rolePath)) {
        return NextResponse.redirect(new URL(rolePath, request.url));
      }

      return NextResponse.next();
    } catch (error) {
      console.error('Error verifying token:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/dashboard',
    '/dashboard/:path*',
    '/api/users/:path*',
    '/api/metrics/:path*'
  ],
};