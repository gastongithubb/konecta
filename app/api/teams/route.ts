// app/api/teams/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/app/lib/auth.server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);
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
  const user = await authenticateRequest(request);
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

export async function fetchTeamLeaders() {
  return prisma.user.findMany({
    where: { role: 'team_leader' },
    select: { id: true, name: true, email: true }
  });
}

export async function fetchAgents() {
  return prisma.user.findMany({
    where: { role: 'agent' },
    select: { id: true, name: true, email: true }
  });
}

export async function saveTeam(data: { leaderId: string, agentIds: string[] }) {
  try {
    // Parse leaderId to integer
    const leaderId = parseInt(data.leaderId, 10);
    
    // Create a new team or update an existing one
    const team = await prisma.team.create({
      data: {
        name: `Team led by ${leaderId}`, // Or you can use any other name or strategy to name your team
        manager: {
          connect: { id: leaderId }
        },
        teamLeader: {
          connect: { id: leaderId }
        },
        members: {
          connect: data.agentIds.map(id => ({ id: parseInt(id, 10) }))
        }
      },
      include: {
        manager: true,
        teamLeader: true,
        members: true
      }
    });

    return team; // Return the created team
  } catch (error) {
    console.error('Error guardando team:', error);
    throw new Error('No se puede guardar el team.'); // Throw a custom error or handle as needed
  }
}