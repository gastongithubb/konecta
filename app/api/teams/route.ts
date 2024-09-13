import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/app/lib/auth.server';
import prisma from '@/app/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  const user = await authenticateRequest();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '10');
    const skip = (page - 1) * limit;

    const teams = await prisma.team.findMany({
      skip,
      take: limit,
      include: {
        manager: { select: { id: true, name: true, email: true } },
        teamLeader: { select: { id: true, name: true, email: true } },
        members: { select: { id: true, name: true, email: true } }
      }
    });

    const totalCount = await prisma.team.count();

    return NextResponse.json({
      data: {
        teams,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
    });
  } catch (error) {
    console.error('Error obteniendo equipos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await authenticateRequest();
  if (!user || user.role !== 'manager') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { teamLeaderId, memberIds } = await request.json();

    if (!teamLeaderId || typeof teamLeaderId !== 'string') {
      return NextResponse.json({ error: 'ID del líder de equipo inválido' }, { status: 400 });
    }

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json({ error: 'Se requiere al menos un miembro del equipo' }, { status: 400 });
    }

    if (memberIds.length > 19) {
      return NextResponse.json({ error: 'Un equipo no puede tener más de 20 miembros incluyendo al líder' }, { status: 400 });
    }

    // Verificar si el líder del equipo existe y tiene el rol correcto
    const teamLeader = await prisma.user.findUnique({
      where: { id: parseInt(teamLeaderId), role: 'team_leader' }
    });

    if (!teamLeader) {
      return NextResponse.json({ error: 'Líder de equipo no encontrado o no tiene el rol correcto' }, { status: 400 });
    }

    // Verificar si todos los miembros existen y tienen el rol correcto
    const members = await prisma.user.findMany({
      where: { 
        id: { in: memberIds.map(id => parseInt(id)) },
        role: 'user'
      }
    });

    if (members.length !== memberIds.length) {
      return NextResponse.json({ error: 'Uno o más miembros no encontrados o no tienen el rol correcto' }, { status: 400 });
    }

    const newTeam = await prisma.$transaction(async (prisma) => {
      const team = await prisma.team.create({
        data: {
          name: `Equipo de ${teamLeader.name}`, // Generar un nombre basado en el líder del equipo
          manager: { connect: { id: user.id } },
          teamLeader: { connect: { id: teamLeader.id } },
        },
      });

      await prisma.team.update({
        where: { id: team.id },
        data: {
          members: { connect: members.map(member => ({ id: member.id })) }
        }
      });

      return prisma.team.findUnique({
        where: { id: team.id },
        include: {
          manager: true,
          teamLeader: true,
          members: true
        }
      });
    });

    return NextResponse.json({ data: newTeam }, { status: 201 });
  } catch (error) {
    console.error('Error creando equipo:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'Ya existe un equipo con ese nombre' }, { status: 400 });
      }
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}