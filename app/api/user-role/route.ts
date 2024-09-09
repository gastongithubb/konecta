import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/app/lib/auth';

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;

  console.log('Auth Token from cookie:', token); // Debug log

  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  try {
    const decodedToken = await verifyAccessToken(token);
    console.log('Decoded Token:', decodedToken); // Debug log
    
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    return NextResponse.json({ role: decodedToken.role });
  } catch (error: unknown) {
    console.error('Error verifying token:', error);
    
    if (error instanceof Error) {
      return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'Internal server error', details: 'Unknown error occurred' }, { status: 500 });
    }
  }
}