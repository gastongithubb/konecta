'use server'

import { prisma } from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/app/lib/auth.server';
import { type TeamMember, WeekInfo } from '@/types/team-monitoring';

async function getTeamForTeamLeader(teamLeaderId: number) {
  const team = await prisma.team.findFirst({
    where: { teamLeaderId },
    select: { id: true }
  });
  return team?.id;
}

export async function getTeamMembers(teamId?: number): Promise<TeamMember[]> {
  try {
    const session = await getSession();
    
    if (!session) {
      throw new Error('No autorizado');
    }

    let effectiveTeamId = teamId;

    if (session.role === 'team_leader') {
      effectiveTeamId = await getTeamForTeamLeader(session.id);
      if (!effectiveTeamId) {
        throw new Error('No tienes un equipo asignado para liderar');
      }
    } 
    else if (session.role === 'user') {
      if (!session.teamId) {
        throw new Error('No tienes un equipo asignado');
      }
      effectiveTeamId = session.teamId;
    }
    else if (session.role === 'manager' && !effectiveTeamId) {
      throw new Error('Debe especificar un equipo para ver');
    }

    const users = await prisma.user.findMany({
      where: { 
        teamId: effectiveTeamId 
      },
      select: {
        id: true,
        email: true,
        name: true,
        TeamWeeklyTracking: {
          select: {
            weekId: true,
            callType: true,
            audio: true,
            score: true,
          }
        }
      }
    });

    const members: TeamMember[] = users.map(user => {
      const weeklyData = user.TeamWeeklyTracking.reduce((acc, tracking) => {
        acc[`week${tracking.weekId}`] = {
          callType: tracking.callType || undefined,
          audio: tracking.audio || undefined,
          score: tracking.score || undefined
        };
        return acc;
      }, {} as Record<string, { callType?: string; audio?: string; score?: number }>);

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        ...weeklyData
      };
    });

    return members;
  } catch (error) {
    console.error('Error getting team members:', error);
    throw error;
  }
}

export async function getWeekConfigurations(): Promise<WeekInfo[]> {
  try {
    const session = await getSession();
    
    if (!session) {
      throw new Error('No autorizado');
    }

    const weeks = await prisma.weekConfiguration.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        weekNumber: 'asc'
      },
      select: {
        id: true,
        weekNumber: true,
        label: true,
        startDate: true,
        endDate: true,
        isActive: true
      }
    });

    return weeks.map(week => ({
      id: week.id,
      label: week.label,
      startDate: week.startDate.toISOString().split('T')[0],
      endDate: week.endDate.toISOString().split('T')[0],
      isActive: week.isActive
    }));
  } catch (error) {
    console.error('Error getting week configurations:', error);
    throw error;
  }
}

export async function updateWeekConfigurations(weeks: WeekInfo[]): Promise<void> {
  try {
    const session = await getSession();
    
    if (!session) {
      throw new Error('No autorizado');
    }

    if (!['team_leader', 'manager'].includes(session.role)) {
      throw new Error('No tienes permiso para actualizar las semanas');
    }

    // Begin transaction
    await prisma.$transaction(async (tx) => {
      // First, deactivate all existing weeks
      await tx.weekConfiguration.updateMany({
        where: {
          isActive: true
        },
        data: {
          isActive: false
        }
      });

      // Then, upsert each week configuration
      for (const week of weeks) {
        await tx.weekConfiguration.upsert({
          where: {
            id: week.id
          },
          update: {
            label: week.label,
            startDate: new Date(week.startDate),
            endDate: new Date(week.endDate),
            isActive: true
          },
          create: {
            weekNumber: week.id,
            label: week.label,
            startDate: new Date(week.startDate),
            endDate: new Date(week.endDate),
            isActive: true,
            createdBy: session.id
          }
        });
      }
    });

    revalidatePath('/team-monitoring');
  } catch (error) {
    console.error('Error updating week configurations:', error);
    throw error;
  }
}

export async function updateWeekData(
  userId: number,
  weekId: number,
  data: {
    callType?: string;
    audio?: string;
    score?: number;
  }
): Promise<void> {
  try {
    const session = await getSession();
    
    if (!session) {
      throw new Error('No autorizado');
    }

    const userToUpdate = await prisma.user.findUnique({
      where: { id: userId },
      select: { teamId: true }
    });

    if (!userToUpdate) {
      throw new Error('Usuario no encontrado');
    }

    if (session.role === 'team_leader') {
      const teamId = await getTeamForTeamLeader(session.id);
      if (!teamId || userToUpdate.teamId !== teamId) {
        throw new Error('No tienes permiso para actualizar datos de este usuario');
      }
    } else if (session.role === 'manager') {
      // Los managers pueden actualizar cualquier usuario
    } else {
      throw new Error('No tienes permiso para actualizar datos');
    }

    await prisma.teamWeeklyTracking.upsert({
      where: {
        userId_weekId: {
          userId,
          weekId,
        },
      },
      update: data,
      create: {
        userId,
        weekId,
        ...data,
      },
    });
    
    revalidatePath('/team-monitoring');
  } catch (error) {
    console.error('Error updating week data:', error);
    throw error;
  }
}

export async function validateWeekData(weekData: WeekInfo) {
  if (!weekData.label || weekData.label.trim() === '') {
    throw new Error('El nombre de la semana es requerido');
  }

  if (!weekData.startDate) {
    throw new Error('La fecha de inicio es requerida');
  }

  if (!weekData.endDate) {
    throw new Error('La fecha de fin es requerida');
  }

  const startDate = new Date(weekData.startDate);
  const endDate = new Date(weekData.endDate);

  if (startDate > endDate) {
    throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
  }

  return true;
}