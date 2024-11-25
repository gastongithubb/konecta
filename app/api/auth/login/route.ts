export const runtime = 'nodejs'
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

  // Configuración del token de acceso para 9 horas
  // 9 horas * 60 minutos * 60 segundos
  const NINE_HOURS_IN_SECONDS = 9 * 60 * 60
  
  response.cookies.set('auth_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: NINE_HOURS_IN_SECONDS, // 9 horas en segundos
    path: '/',
  })

  // Mantenemos el refresh token con una duración más larga para permitir
  // la renovación automática cuando sea necesario
  response.cookies.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 días
    path: '/',
  })

  return response
}