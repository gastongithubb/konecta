import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAccessToken } from '@/lib/auth'

export function middleware(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1]

  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 })
  }

  const decodedToken = verifyAccessToken(token)
  if (!decodedToken) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/users/:path*',
}