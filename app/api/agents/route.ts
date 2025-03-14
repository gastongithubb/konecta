// api/agents/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/app/lib/auth.server';
import { prisma } from '@/app/lib/prisma';
export const dynamic = 'force-dynamic';



export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const decoded = await verifyAccessToken(token);
    if (!decoded || (decoded.role !== 'manager' && decoded.role !== 'team_leader')) {
      return NextResponse.json({ error: 'Prohibido' }, { status: 403 });
    }

    const agents = await prisma.user.findMany({
      where: {
        role: {
          in: ['user', 'team_leader']
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        teamId: true
      },
    });
    
    return NextResponse.json({ 
      data: agents,
      total: agents.length 
    });
  } catch (error) {
    console.error('Error al obtener agentes:', error);
    return NextResponse.json({ error: 'Error Interno del Servidor' }, { status: 500 });
  }
}