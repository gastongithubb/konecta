import { NextResponse } from 'next/server'
import { authenticateUser, createAccessToken } from '@/lib/auth'

export async function POST(request: Request) {
  const { email, password } = await request.json()

  const user = await authenticateUser(email, password)
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = await createAccessToken({ sub: user.id.toString(), role: user.role })

  const response = NextResponse.json({ user: { id: user.id, email: user.email, role: user.role } })
  response.cookies.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 15, // 15 minutes
    path: '/',
  })

  return response
}