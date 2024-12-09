import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma'
import { authenticateRequest } from '@/app/lib/auth.server';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await authenticateRequest();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const team = await prisma.team.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        manager: { select: { id: true, name: true, email: true } },
        teamLeader: { select: { id: true, name: true, email: true } },
        members: { select: { id: true, name: true, email: true } }
      }
    });

    if (!team) {
      return NextResponse.json({ error: 'Equipo no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ data: team });
  } catch (error) {
    console.error('Error obteniendo equipo:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await authenticateRequest();
  if (!user || user.role !== 'manager') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { name, teamLeaderId, memberIds } = await request.json();

    if (typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'El nombre del equipo es inválido' }, { status: 400 });
    }

    if (!Number.isInteger(teamLeaderId)) {
      return NextResponse.json({ error: 'ID del líder de equipo inválido' }, { status: 400 });
    }

    if (memberIds && (!Array.isArray(memberIds) || !memberIds.every(Number.isInteger))) {
      return NextResponse.json({ error: 'IDs de miembros inválidos' }, { status: 400 });
    }

    if (memberIds && memberIds.length > 20) {
      return NextResponse.json({ error: 'Un equipo no puede tener más de 21 miembros incluyendo al líder' }, { status: 400 });
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
            members: { set: memberIds.map((id: number) => ({ id })) }
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

    return NextResponse.json({ data: updatedTeam });
  } catch (error) {
    console.error('Error actualizando equipo:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'Ya existe un equipo con ese nombre' }, { status: 400 });
      }
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await authenticateRequest();
  if (!user || user.role !== 'manager') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    await prisma.team.delete({
      where: { id: parseInt(params.id) }
    });

    return NextResponse.json({ data: { message: 'Equipo eliminado' } });
  } catch (error) {
    console.error('Error eliminando equipo:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}