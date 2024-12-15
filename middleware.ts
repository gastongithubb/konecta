// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/app/lib/auth.server';
import type { UserRole } from '@/types/auth';

const allowedOrigins = [
  'http://localhost:3000',
  'https://sancor-konectagroup.vercel.app'
];

function corsResponse(request: NextRequest, response: NextResponse) {
  const origin = request.headers.get('origin');
  const isAllowedOrigin = origin && allowedOrigins.includes(origin);

  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  return response;
}

export async function middleware(request: NextRequest) {
  // Manejar CORS para rutas de API
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const isAllowedOrigin = origin && allowedOrigins.includes(origin);

    // Manejar preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Si es una ruta de autenticación, permitir sin verificar token
    if (request.nextUrl.pathname.startsWith('/api/auth/')) {
      return corsResponse(request, NextResponse.next());
    }

    // Para otras rutas API que requieren autenticación
    if (request.nextUrl.pathname.startsWith('/api/users')) {
      const token = request.cookies.get('auth_token')?.value;
      if (!token) {
        const response = new NextResponse(
          JSON.stringify({ error: 'No autorizado' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
        return corsResponse(request, response);
      }

      try {
        const decodedToken = await verifyAccessToken(token);
        if (!decodedToken) {
          throw new Error('Token inválido');
        }
      } catch (error) {
        const response = new NextResponse(
          JSON.stringify({ error: 'Token inválido' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
        return corsResponse(request, response);
      }
    }
    
    return corsResponse(request, NextResponse.next());
  }

  // Lógica de autenticación para rutas no-API
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

  if (request.nextUrl.pathname.startsWith('/dashboard') || 
      request.nextUrl.pathname.startsWith('/api/users')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const decodedToken = await verifyAccessToken(token);
      if (!decodedToken) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      const path = request.nextUrl.pathname;
      const userRole = decodedToken.role as UserRole;

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
    '/api/metrics/:path*',
    '/api/auth/:path*'
  ],
};