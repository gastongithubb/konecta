import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAccessToken } from '@/app/lib/auth.server'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value

  // Si el usuario intenta acceder a /login y ya está autenticado, redirigir al dashboard
  if (request.nextUrl.pathname === '/login' && token) {
    const decodedToken = await verifyAccessToken(token)
    if (decodedToken) {
      return NextResponse.redirect(new URL(`/dashboard/${decodedToken.role}`, request.url))
    }
  }

  // Para rutas protegidas
  if (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/api/users')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const decodedToken = await verifyAccessToken(token)
    if (!decodedToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Verificar el rol y redirigir al dashboard correspondiente
    if (request.nextUrl.pathname === '/dashboard') {
      const userRole = decodedToken.role
      switch (userRole) {
        case 'manager':
          return NextResponse.redirect(new URL('/dashboard/manager', request.url))
        case 'leader':
          return NextResponse.redirect(new URL('/dashboard/leader', request.url))
        case 'agent':
          return NextResponse.redirect(new URL('/dashboard/agent', request.url))
        default:
          return NextResponse.redirect(new URL('/dashboard/unauthorized', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/dashboard', '/dashboard/:path*', '/api/users/:path*'],
}