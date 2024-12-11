
// app/api/teams/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth.server';
import { prisma } from '@/app/lib/prisma';
import { Prisma } from '@prisma/client';
import { revalidateTag, unstable_cache } from 'next/cache';

// types/team.ts
export interface TeamCreateBody {
  name: string;
  teamLeaderId: string | number;
  managerId: string | number;
  grupoNovedades?: string;
  grupoGeneral?: string;
  memberIds?: (string | number)[];
}


// Validación de datos del equipo
const validateTeamBody = (body: any): body is TeamCreateBody => {
  if (!body || typeof body !== 'object') return false;

  const requiredString = (value: any) => 
    typeof value === 'string' && value.trim().length > 0;
  
  const validId = (value: any) => 
    typeof value === 'string' || typeof value === 'number';

  return (
    requiredString(body.name) &&
    validId(body.teamLeaderId) &&
    validId(body.managerId) &&
    (!body.memberIds || Array.isArray(body.memberIds))
  );
};

// Cache para obtener equipos
const getTeamsForUser = unstable_cache(
  async (userId: number, role: string) => {
    const where: Prisma.TeamWhereInput = {
      ...(role === 'manager' && { managerId: userId }),
      ...(role === 'team_leader' && { teamLeaderId: userId }),
      ...(role === 'user' && { members: { some: { id: userId } } })
    };

    return prisma.team.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        teamLeader: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });
  },
  ['teams'],
  { revalidate: 60, tags: ['teams'] }
);

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' }, 
        { status: 401 }
      );
    }

    const allowedRoles = ['team_leader', 'manager', 'user'];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json(
        { error: 'Acceso denegado' }, 
        { status: 403 }
      );
    }

    const teams = await getTeamsForUser(session.id, session.role);
    return NextResponse.json({ data: teams });
  } catch (error) {
    console.error('Error obteniendo equipos:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error interno del servidor'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' }, 
        { status: 401 }
      );
    }

    if (!['manager', 'team_leader'].includes(session.role)) {
      return NextResponse.json({ 
        error: 'Solo los managers y líderes de equipo pueden crear equipos' 
      }, { status: 403 });
    }

    const body = await request.json();
    if (!validateTeamBody(body)) {
      return NextResponse.json({ 
        error: 'Datos del equipo inválidos' 
      }, { status: 400 });
    }

    // Validaciones específicas por rol
    if (session.role === 'team_leader' && 
        parseInt(String(body.teamLeaderId)) !== session.id) {
      return NextResponse.json({ 
        error: 'Como líder de equipo, solo puedes crear equipos donde tú seas el líder' 
      }, { status: 403 });
    }

    // Asignar manager por defecto para team leaders
    let finalManagerId = parseInt(String(body.managerId));
    if (session.role === 'team_leader') {
      const defaultManager = await prisma.user.findFirst({
        where: { role: 'manager' }
      });
      
      if (!defaultManager) {
        return NextResponse.json({ 
          error: 'No se encontró un manager disponible' 
        }, { status: 400 });
      }
      
      finalManagerId = defaultManager.id;
    }

    // Crear equipo
    const team = await prisma.team.create({
      data: {
        name: body.name.trim(),
        teamLeader: { connect: { id: parseInt(String(body.teamLeaderId)) } },
        manager: { connect: { id: finalManagerId } },
        grupoNovedades: body.grupoNovedades?.trim() || '',
        grupoGeneral: body.grupoGeneral?.trim() || ''
      }
    });

    // Agregar miembros si se proporcionaron
    if (body.memberIds?.length) {
      await prisma.team.update({
        where: { id: team.id },
        data: {
          members: {
            connect: body.memberIds.map(id => ({ 
              id: parseInt(String(id))
            }))
          }
        }
      });
    }

    // Obtener equipo completo
    const updatedTeam = await prisma.team.findUniqueOrThrow({
      where: { id: team.id },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        teamLeader: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    // Invalidar cache
    await revalidateTag('teams');

    return NextResponse.json({ data: updatedTeam }, { status: 201 });
  } catch (error) {
    console.error('Error creando equipo:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({ 
          error: 'Ya existe un equipo con ese nombre' 
        }, { status: 409 });
      }
    }
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error interno del servidor' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}