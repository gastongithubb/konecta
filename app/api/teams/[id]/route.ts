// app/api/teams/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/auth.server';
import { Prisma } from '@prisma/client';
import { revalidateTag, unstable_cache } from 'next/cache';

// Cache para obtener equipo por ID
const getTeamById = unstable_cache(
  async (teamId: number) => {
    return prisma.team.findUnique({
      where: { id: teamId },
      include: {
        manager: { 
          select: { id: true, name: true, email: true } 
        },
        teamLeader: { 
          select: { id: true, name: true, email: true } 
        },
        members: { 
          select: { id: true, name: true, email: true } 
        }
      }
    });
  },
  ['team'],
  { revalidate: 60, tags: ['team'] }
);

export async function GET(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' }, 
        { status: 401 }
      );
    }

    const team = await getTeamById(parseInt(params.id));

    if (!team) {
      return NextResponse.json(
        { error: 'Equipo no encontrado' }, 
        { status: 404 }
      );
    }

    const hasAccess = 
      session.role === 'manager' || 
      team.teamLeaderId === session.id ||
      team.members.some(member => member.id === session.id);

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'No tienes acceso a este equipo' }, 
        { status: 403 }
      );
    }

    return NextResponse.json({ data: team });
  } catch (error) {
    console.error('Error obteniendo equipo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'manager') {
      return NextResponse.json(
        { error: 'No autorizado' }, 
        { status: 401 }
      );
    }

    const { name, teamLeaderId, memberIds } = await request.json();

    // Validaciones
    if (typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'El nombre del equipo es inválido' }, 
        { status: 400 }
      );
    }

    if (!Number.isInteger(teamLeaderId)) {
      return NextResponse.json(
        { error: 'ID del líder de equipo inválido' }, 
        { status: 400 }
      );
    }

    if (memberIds) {
      if (!Array.isArray(memberIds) || !memberIds.every(Number.isInteger)) {
        return NextResponse.json(
          { error: 'IDs de miembros inválidos' }, 
          { status: 400 }
        );
      }

      if (memberIds.length > 20) {
        return NextResponse.json(
          { error: 'Un equipo no puede tener más de 21 miembros incluyendo al líder' }, 
          { status: 400 }
        );
      }
    }

    const updatedTeam = await prisma.$transaction(async (prisma) => {
      const team = await prisma.team.update({
        where: { id: parseInt(params.id) },
        data: { 
          name,
          teamLeader: { connect: { id: teamLeaderId } },
        },
      });

      if (memberIds) {
        await prisma.team.update({
          where: { id: team.id },
          data: {
            members: { 
              set: memberIds.map((id: number) => ({ id })) 
            }
          }
        });
      }

      return prisma.team.findUnique({
        where: { id: team.id },
        include: {
          manager: true,
          teamLeader: true,
          members: true
        }
      });
    });

    // Invalidar cache después de actualizar
    await revalidateTag('team');
    await revalidateTag('teams');

    return NextResponse.json({ data: updatedTeam });
  } catch (error) {
    console.error('Error actualizando equipo:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Ya existe un equipo con ese nombre' }, 
          { status: 400 }
        );
      }
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'manager') {
      return NextResponse.json(
        { error: 'No autorizado' }, 
        { status: 401 }
      );
    }

    await prisma.team.delete({
      where: { id: parseInt(params.id) }
    });

    // Invalidar cache después de eliminar
    await revalidateTag('team');
    await revalidateTag('teams');

    return NextResponse.json({ 
      data: { message: 'Equipo eliminado' } 
    });
  } catch (error) {
    console.error('Error eliminando equipo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}