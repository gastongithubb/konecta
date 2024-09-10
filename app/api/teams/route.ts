import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/app/lib/auth.server';
import prisma from '@/app/lib/prisma';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  const user = await authenticateRequest();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const teams = await prisma.team.findMany({
    include: {
      manager: { select: { id: true, name: true, email: true } },
      teamLeader: { select: { id: true, name: true, email: true } },
      members: { select: { id: true, name: true, email: true } }
    }
  });

  return NextResponse.json(teams);
}

export async function POST(request: NextRequest) {
  const user = await authenticateRequest();
  if (!user || user.role !== 'manager') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { name, teamLeaderId, memberIds } = await request.json();

  if (!name || !teamLeaderId) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
  }

  if (memberIds && memberIds.length > 19) {
    return NextResponse.json({ error: 'Un equipo no puede tener más de 20 miembros incluyendo al líder' }, { status: 400 });
  }

  try {
    const newTeam = await prisma.team.create({
      data: {
        name,
        manager: { connect: { id: user.id } },
        teamLeader: { connect: { id: teamLeaderId } },
        members: { connect: memberIds ? memberIds.map((id: number) => ({ id })) : [] }
      },
      include: {
        manager: true,
        teamLeader: true,
        members: true
      }
    });

    return NextResponse.json(newTeam, { status: 201 });
  } catch (error) {
    console.error('Error creando equipo:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}