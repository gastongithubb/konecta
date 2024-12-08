// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/app/lib/auth.server';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  // Manejo de la ruta /login
  if (request.nextUrl.pathname === '/login' && token) {
    try {
      const decodedToken = await verifyAccessToken(token);
      if (decodedToken) {
        // Si el usuario ya está autenticado, redirigir según su rol
        return NextResponse.redirect(new URL(`/dashboard/${decodedToken.role}`, request.url));
      }
    } catch (error) {
      // Si hay un error con el token, permitir el acceso a /login
      return NextResponse.next();
    }
  }

  // Manejo de rutas protegidas
  if (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/api/users')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const decodedToken = await verifyAccessToken(token);
      if (!decodedToken) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Verificar acceso basado en el rol y la ruta
      const path = request.nextUrl.pathname;
      const userRole = decodedToken.role;

      // Si es la ruta base del dashboard
      if (path === '/dashboard') {
        return NextResponse.redirect(new URL(`/dashboard/${userRole}`, request.url));
      }

      // Verificar que el usuario tenga acceso a la sección específica
      const rolePath = `/dashboard/${userRole}`;
      if (!path.startsWith(rolePath)) {
        return NextResponse.redirect(new URL(rolePath, request.url));
      }

      // Para rutas específicas de roles, verificar permisos
      if (path.startsWith('/dashboard/team_leader') && userRole !== 'team_leader') {
        return NextResponse.redirect(new URL(`/dashboard/${userRole}`, request.url));
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
    '/api/metrics/:path*'  // Añadido para proteger las rutas de métricas
  ],
};