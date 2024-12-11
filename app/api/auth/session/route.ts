import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth.server';

// Esta es la forma correcta de desactivar el cache en App Router
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

    return NextResponse.json(session);
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { error: 'Error fetching session' }, 
      { status: 500 }
    );
  }
}