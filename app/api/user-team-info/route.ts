// app/api/user-team-info/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '@/app/lib/auth.server';
import { unstable_cache } from 'next/cache';

const prisma = new PrismaClient();

interface UserTeamInfo {
  name: string;
  team: {
    name: string;
    teamLeader: string;
  } | null;
}

// Cache para obtener información del usuario y su equipo
const getUserTeamInfo = unstable_cache(
  async (userId: number): Promise<UserTeamInfo | null> => {
    const userWithTeam = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        team: {
          include: {
            teamLeader: true
          }
        }
      }
    });

    if (!userWithTeam) return null;

    return {
      name: userWithTeam.name,
      team: userWithTeam.team ? {
        name: userWithTeam.team.name,
        teamLeader: userWithTeam.team.teamLeader.name
      } : null
    };
  },
  ['user-team-info'],
  { revalidate: 60, tags: ['user-team'] }
);

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' }, 
        { status: 401 }
      );
    }

    const userInfo = await getUserTeamInfo(session.id);
    
    if (!userInfo) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(userInfo);
  } catch (error) {
    console.error('Error obteniendo información del usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}