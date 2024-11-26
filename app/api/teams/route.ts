import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/app/lib/auth.server';
import prisma from '@/app/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest();
    
    if (!user || !user.id || !user.role) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (user.role !== 'team_leader' && user.role !== 'manager') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const where: Prisma.TeamWhereInput = user.role === 'manager' 
      ? { managerId: user.id }
      : { teamLeaderId: user.id };

    const teams = await prisma.team.findMany({
      where,
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
        },
        _count: {
          select: {
            cases: true,
            dailyMetrics: true,
            semanalMetrics: true,
            tmoMetrics: true,
            trimestralMetrics: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const transformedTeams = teams.map(team => {
      const stats = {
        totalCases: team._count.cases,
        metrics: {
          daily: team._count.dailyMetrics > 0,
          weekly: team._count.semanalMetrics > 0,
          tmo: team._count.tmoMetrics > 0,
          quarterly: team._count.trimestralMetrics > 0
        }
      };

      return {
        id: team.id,
        name: team.name,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
        manager: team.manager,
        teamLeader: team.teamLeader,
        members: team.members,
        stats
      };
    });

    return NextResponse.json({ 
      data: transformedTeams
    });

  } catch (error) {
    console.error('Error obteniendo equipos:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error : undefined 
    }, { status: 500 });
  }
}

// POST - Crear un nuevo equipo
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (user.role !== 'manager' && user.role !== 'team_leader') {
      return NextResponse.json({ 
        error: 'Solo los managers y líderes de equipo pueden crear equipos' 
      }, { status: 403 });
    }

    const body = await request.json();
    
    // Validar que el nombre del equipo esté presente
    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ 
        error: 'El nombre del equipo es requerido' 
      }, { status: 400 });
    }

    // Si es team_leader, solo puede crear equipos donde él sea el líder
    if (user.role === 'team_leader' && body.teamLeaderId !== user.id) {
      return NextResponse.json({ 
        error: 'Como líder de equipo, solo puedes crear equipos donde tú seas el líder' 
      }, { status: 403 });
    }

    // Buscar un manager por defecto si el usuario es team_leader
    let managerId = user.id;
    if (user.role === 'team_leader') {
      const defaultManager = await prisma.user.findFirst({
        where: { role: 'manager' }
      });
      if (!defaultManager) {
        return NextResponse.json({ 
          error: 'No se encontró un manager disponible para asignar al equipo' 
        }, { status: 400 });
      }
      managerId = defaultManager.id;
    }

    const createData: Prisma.TeamCreateInput = {
      name: body.name,
      teamLeader: {
        connect: { id: parseInt(body.teamLeaderId) }
      },
      manager: {
        connect: { id: managerId }
      }
    };

    const newTeam = await prisma.team.create({
      data: createData,
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
        }
      }
    });

    // Si se proporcionaron miembros, actualizar las relaciones
    if (body.memberIds && Array.isArray(body.memberIds)) {
      await prisma.team.update({
        where: { id: newTeam.id },
        data: {
          members: {
            connect: body.memberIds.map((id: string | number) => ({ 
              id: typeof id === 'string' ? parseInt(id) : id 
            }))
          }
        }
      });
    }

    // Obtener el equipo actualizado con los miembros
    const updatedTeam = await prisma.team.findUnique({
      where: { id: newTeam.id },
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

    return NextResponse.json({ data: updatedTeam }, { status: 201 });
  } catch (error) {
    console.error('Error creando equipo:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error interno del servidor' 
    }, { status: 500 });
  }
}