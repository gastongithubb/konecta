// app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth.server';
import { prisma } from '@/app/lib/prisma';

// Desactivar cache en App Router
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'No session found' }, 
        { status: 401 }
      );
    }

    // Obtener datos actualizados del usuario
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        teamId: true,
        isPasswordChanged: true,
        avatarUrl: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { error: 'Error fetching session' }, 
      { status: 500 }
    );
  }
}