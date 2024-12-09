// app/api/auth/user/route.ts

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/app/lib/auth.server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return new NextResponse(
      JSON.stringify({ error: 'No token provided' }),
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const decodedToken = await verifyAccessToken(token);
    
    if (!decodedToken) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid token' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(decodedToken.sub) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        teamId: true
      }
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'User not found' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new NextResponse(
      JSON.stringify({ user }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error verifying token:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}