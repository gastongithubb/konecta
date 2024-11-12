import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/app/lib/auth.server';
import prisma from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest();
    
    if (!user || !user.id || !user.role) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (user.role !== 'team_leader' && user.role !== 'manager') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const where = user.role === 'manager' 
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
      }
    });

    const transformedTeams = await Promise.all(teams.map(async team => {
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
        stats,
        _count: undefined
      };
    }));

    return NextResponse.json({ 
      data: transformedTeams,
      total: transformedTeams.length
    });

  } catch (error: any) { // Tipamos error como any para acceder a message
    console.error('Error obteniendo equipos:', error);
    
    const errorMessage = error?.message || 'Error interno del servidor';
    
    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined 
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

    if (user.role !== 'manager') {
      return NextResponse.json({ error: 'Solo los managers pueden crear equipos' }, { status: 403 });
    }

    const body = await request.json();
    
    const newTeam = await prisma.team.create({
      data: {
        name: body.name,
        managerId: user.id,
        teamLeaderId: body.teamLeaderId,
        // Removemos description ya que no existe en el modelo
      },
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

    return NextResponse.json({ data: newTeam }, { status: 201 });
  } catch (error) {
    console.error('Error creando equipo:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT - Actualizar un equipo existente
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateRequest();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (user.role !== 'manager' && user.role !== 'team_leader') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const body = await request.json();

    // Verificar que el equipo exista y pertenezca al usuario
    const existingTeam = await prisma.team.findFirst({
      where: {
        id: parseInt(params.id),
        OR: [
          { managerId: user.id },
          { teamLeaderId: user.id }
        ]
      }
    });

    if (!existingTeam) {
      return NextResponse.json(
        { error: 'Equipo no encontrado o no tienes permisos para modificarlo' }, 
        { status: 404 }
      );
    }

    // Solo el manager puede cambiar el team leader
    const updateData: any = {
      name: body.name,
      description: body.description
    };

    if (user.role === 'manager' && body.teamLeaderId) {
      updateData.teamLeaderId = body.teamLeaderId;
    }

    const updatedTeam = await prisma.team.update({
      where: {
        id: parseInt(params.id)
      },
      data: updateData,
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

    return NextResponse.json({ data: updatedTeam });
  } catch (error) {
    console.error('Error actualizando equipo:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE - Eliminar un equipo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateRequest();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (user.role !== 'manager') {
      return NextResponse.json({ error: 'Solo los managers pueden eliminar equipos' }, { status: 403 });
    }

    // Verificar que el equipo exista y pertenezca al manager
    const team = await prisma.team.findFirst({
      where: {
        id: parseInt(params.id),
        managerId: user.id
      }
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Equipo no encontrado o no tienes permisos para eliminarlo' }, 
        { status: 404 }
      );
    }

    // Eliminar el equipo
    await prisma.team.delete({
      where: {
        id: parseInt(params.id)
      }
    });

    return NextResponse.json({ message: 'Equipo eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando equipo:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}