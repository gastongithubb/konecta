export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { authenticateUser, createAccessToken, createRefreshToken } from '@/app/lib/auth.server'
import { prisma } from '@/app/lib/prisma'

export async function POST(request: Request) {
  try {
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

    const NINE_HOURS_IN_SECONDS = 9 * 60 * 60
    
    response.cookies.set('auth_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: NINE_HOURS_IN_SECONDS,
      path: '/',
    })

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Error en autenticación:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}