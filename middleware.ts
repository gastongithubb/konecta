import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAccessToken } from '@/app/lib/auth'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value

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
        return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*', '/api/users/:path*'],
}