import { NextResponse } from 'next/server'
import { verifyAccessToken, getUserData } from '@/app/lib/auth.server';
import { cookies } from 'next/headers'

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
    
    // Ensure user role is one of the expected values
    const userRole = ['user', 'manager', 'team_leader'].includes(userData.role) 
      ? userData.role 
      : 'user'; // Default to 'user' if role is unexpected

    return NextResponse.json({
      name: userData.name,
      role: userRole,
      // Add any other necessary user data fields here
    })
  } catch (error) {
    console.error('Error fetching user data:', error)
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
  }
}