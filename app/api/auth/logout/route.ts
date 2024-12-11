// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  cookies().delete('auth_token');
  cookies().delete('refresh_token');
  return NextResponse.json({ message: 'Logged out successfully' });
}