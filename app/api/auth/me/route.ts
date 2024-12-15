// app/api/auth/me/route.ts
import { getSession } from '@/app/lib/auth.server';
import { prisma } from '@/app/lib/prisma';
import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import type { UserRole } from '@/types/auth';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

// Definir los selectores para cada rol
const roleSelectors = {
  team_leader: {
    id: true,
    name: true,
    email: true,
    role: true,
    teamId: true,
    leadTeams: {
      select: {
        id: true,
        name: true,
        members: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    }
  },
  manager: {
    id: true,
    name: true,
    email: true,
    role: true,
    managedTeams: {
      select: {
        id: true,
        name: true,
        teamLeader: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    }
  },
  user: {
    id: true,
    name: true,
    email: true,
    role: true,
    teamId: true,
    team: {
      select: {
        id: true,
        name: true,
        teamLeader: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    }
  },
  // Añadir selectores para agent y leader
  agent: {
    id: true,
    name: true,
    email: true,
    role: true,
    teamId: true,
    team: {
      select: {
        id: true,
        name: true,
        teamLeader: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    }
  },
  leader: {
    id: true,
    name: true,
    email: true,
    role: true,
    teamId: true,
    team: {
      select: {
        id: true,
        name: true,
        teamLeader: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    }
  }
} as const;

// Asegurarse de que el tipo coincide con UserRole
type RoleSelectorsKey = keyof typeof roleSelectors;
type ValidateRoles<T extends string> = T extends RoleSelectorsKey ? T : never;
type ValidatedUserRole = ValidateRoles<UserRole>;

// Función actualizada para obtener datos del usuario
const getUserData = unstable_cache(
  async (userId: number, role: UserRole) => {
    try {
      // Usar un rol por defecto si el rol proporcionado no tiene un selector
      const selector = roleSelectors[role as keyof typeof roleSelectors] || roleSelectors.user;
      
      return await prisma.user.findUnique({
        where: { id: userId },
        select: selector
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  },
  ['user-data'],
  {
    revalidate: 3600,
    tags: ['user-data']
  }
);

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' }, 
        { status: 401 }
      );
    }

    const userData = await getUserData(session.id, session.role);

    if (!userData) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(userData);

  } catch (error) {
    console.error('Error en /api/auth/me:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos del usuario' }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Tipos de respuesta para TypeScript
type TeamMember = {
  id: number;
  name: string;
};

type Team = {
  id: number;
  name: string;
  teamLeader?: TeamMember;
  members?: TeamMember[];
};

type UserResponse = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  teamId?: number;
  team?: Team;
  leadTeams?: Team[];
  managedTeams?: Team[];
};