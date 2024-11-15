import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/app/lib/auth.server';
import prisma from '@/app/lib/prisma';

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  try {
    const decodedToken = await verifyAccessToken(token);
    
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Obtener datos completos del usuario desde la base de datos
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: unknown) {
    console.error('Error verifying token:', error);
    
    if (error instanceof Error) {
      return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'Internal server error', details: 'Unknown error occurred' }, { status: 500 });
    }
  }
}