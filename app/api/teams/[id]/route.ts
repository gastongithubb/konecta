// app/api/teams/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { authenticateRequest } from '@/app/lib/auth.server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await authenticateRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

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

  return NextResponse.json(team);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await authenticateRequest(request);
  if (!user || user.role !== 'manager') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { name, teamLeaderId, memberIds } = await request.json();

  if (memberIds && memberIds.length > 19) {
    return NextResponse.json({ error: 'Un equipo no puede tener más de 20 miembros incluyendo al líder' }, { status: 400 });
  }

  try {
    const updatedTeam = await prisma.team.update({
      where: { id: parseInt(params.id) },
      data: { 
        name,
        teamLeader: teamLeaderId ? { connect: { id: teamLeaderId } } : undefined,
        members: memberIds ? { set: memberIds.map((id: unknown) => ({ id })) } : undefined
      },
      include: {
        manager: true,
        teamLeader: true,
        members: true
      }
    });

    return NextResponse.json(updatedTeam);
  } catch (error) {
    console.error('Error actualizando equipo:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await authenticateRequest(request);
  if (!user || user.role !== 'manager') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    await prisma.team.delete({
      where: { id: parseInt(params.id) }
    });

    return NextResponse.json({ message: 'Equipo eliminado' });
  } catch (error) {
    console.error('Error eliminando equipo:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}