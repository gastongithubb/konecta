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

    // Modificación: Agregar 'user' a los roles permitidos
    if (user.role !== 'team_leader' && user.role !== 'manager' && user.role !== 'user') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const where: Prisma.TeamWhereInput = 
      user.role === 'manager' 
        ? { managerId: user.id }
        : user.role === 'team_leader'
          ? { teamLeaderId: user.id }
          : user.role === 'user'
            ? { members: { some: { id: user.id } } } // Para usuarios, mostrar equipos donde son miembros
            : {};

    const teams = await prisma.team.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        // Incluir información adicional que pueda ser útil para los usuarios
        manager: {
          select: {
            id: true,
            name: true
          }
        },
        teamLeader: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json(teams, { status: 200 });
  } catch (error) {
    console.error('Error obteniendo equipos:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error interno del servidor',
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
        connect: { id: parseInt(body.managerId) }
      },
      grupoNovedades: body.grupoNovedades || '', // Provide a default empty string if not provided
      grupoGeneral: body.grupoGeneral || ''     // Provide a default empty string if not provided
    }

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