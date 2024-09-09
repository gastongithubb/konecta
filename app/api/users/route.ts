import { NextResponse } from 'next/server'
import { verifyAccessToken, getUserData } from '@/app/lib/auth'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) {
    return NextResponse.json({ error: 'Missing or invalid token' }, { status: 401 })
  }

  const decoded = await verifyAccessToken(token)
  if (!decoded) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  try {
    const userData = await getUserData(decoded.sub)
    return NextResponse.json(userData)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
  }
}