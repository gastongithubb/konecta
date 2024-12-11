import { NextResponse } from 'next/server'
import { verifyAccessToken, getUserData } from '@/app/lib/auth.server'
import { cookies } from 'next/headers'
import type { UserRole } from '@/types/auth'

export async function GET() {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) {
    return NextResponse.json({ error: 'Missing or invalid token' }, { status: 401 })
  }

  try {
    const decoded = await verifyAccessToken(token)
    if (!decoded || !decoded.sub) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userData = await getUserData(decoded.sub)
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      name: userData.name,
      role: userData.role,
      email: userData.email,
      isPasswordChanged: userData.isPasswordChanged
    })
  } catch (error) {
    console.error('Error fetching user data:', error)
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
  }
}