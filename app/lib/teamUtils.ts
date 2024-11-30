import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    const leaderId = parseInt(data.leaderId, 10);
    
    const team = await prisma.team.create({
      data: {
        name: `Team led by ${leaderId}`,
        manager: {
          connect: { id: leaderId }
        },
        teamLeader: {
          connect: { id: leaderId }
        },
        members: {
          connect: data.agentIds.map(id => ({ id: parseInt(id, 10) }))
        },
        grupoNovedades: '', // Add a default empty string
        grupoGeneral: ''    // Add a default empty string
      },
      include: {
        manager: true,
        teamLeader: true,
        members: true
      }
    });

    return team;
  } catch (error) {
    console.error('Error guardando team:', error);
    throw new Error('No se puede guardar el team.');
  }
}