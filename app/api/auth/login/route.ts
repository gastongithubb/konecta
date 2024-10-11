// app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import { authenticateUser, createAccessToken, createRefreshToken } from '@/app/lib/auth.server'

export async function POST(request: Request) {
  const { email, password } = await request.json()

  const user = await authenticateUser(email, password)
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const accessToken = await createAccessToken({ 
    sub: user.id.toString(), 
    role: user.role, 
    isPasswordChanged: user.isPasswordChanged 
  })

  const refreshToken = await createRefreshToken({
    sub: user.id.toString(),
    role: user.role,
    isPasswordChanged: user.isPasswordChanged
  })

  const response = NextResponse.json({ 
    user: { 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      isPasswordChanged: user.isPasswordChanged 
    }
  })

  response.cookies.set('auth_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 15, // 15 minutes
    path: '/',
  })

  response.cookies.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  })

  return response
}