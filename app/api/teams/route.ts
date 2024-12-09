import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/app/lib/auth.server';
import { prisma } from '@/app/lib/prisma'
import { Prisma } from '@prisma/client';

// Type definitions for better type safety
type TeamCreateBody = {
  name: string;
  teamLeaderId: string | number;
  managerId: string | number;
  grupoNovedades?: string;
  grupoGeneral?: string;
  memberIds?: (string | number)[];
};

// Validation functions
const validateTeamBody = (body: any): body is TeamCreateBody => {
  const validationErrors = [];

  if (!body || typeof body !== 'object') {
    validationErrors.push('El body debe ser un objeto');
    return false;
  }

  if (!body.name || typeof body.name !== 'string') {
    validationErrors.push('El nombre es requerido y debe ser un string');
  }

  if (!body.teamLeaderId) {
    validationErrors.push('El teamLeaderId es requerido');
  }

  if (!body.managerId) {
    validationErrors.push('El managerId es requerido');
  }

  if (validationErrors.length > 0) {
    console.error('Errores de validación:', validationErrors);
  }

  return (
    typeof body === 'object' &&
    body !== null &&
    typeof body.name === 'string' &&
    body.name.trim().length > 0 &&
    (typeof body.teamLeaderId === 'string' || typeof body.teamLeaderId === 'number') &&
    (typeof body.managerId === 'string' || typeof body.managerId === 'number') &&
    (!body.memberIds || Array.isArray(body.memberIds))
  );
};

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest();

    if (!user?.id || !user?.role) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const allowedRoles = ['team_leader', 'manager', 'user'];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const where: Prisma.TeamWhereInput = {
      ...(user.role === 'manager' && { managerId: user.id }),
      ...(user.role === 'team_leader' && { teamLeaderId: user.id }),
      ...(user.role === 'user' && { members: { some: { id: user.id } } })
    };

    const teams = await prisma.team.findMany({
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

    return NextResponse.json({ data: teams }, { status: 200 });
  } catch (error) {
    console.error('Error obteniendo equipos:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error interno del servidor'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest();
    
    if (!user?.id || !user?.role) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!['manager', 'team_leader'].includes(user.role)) {
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

    // Validate team leader permissions
    if (user.role === 'team_leader' && parseInt(String(body.teamLeaderId)) !== user.id) {
      return NextResponse.json({ 
        error: 'Como líder de equipo, solo puedes crear equipos donde tú seas el líder' 
      }, { status: 403 });
    }

    // For team leaders, find and assign a default manager
    let finalManagerId = parseInt(String(body.managerId));
    if (user.role === 'team_leader') {
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

    // Create team with initial data
    const team = await prisma.team.create({
      data: {
        name: body.name.trim(),
        teamLeader: {
          connect: { id: parseInt(String(body.teamLeaderId)) }
        },
        manager: {
          connect: { id: finalManagerId }
        },
        grupoNovedades: body.grupoNovedades?.trim() || '',
        grupoGeneral: body.grupoGeneral?.trim() || ''
      }
    });

    // Add members if provided
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

    // Return complete team data
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
  }
}