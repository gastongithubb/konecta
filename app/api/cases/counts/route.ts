// app/api/cases/counts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/auth.server';
import { unstable_cache } from 'next/cache';

interface CaseMetrics {
  daily: number;
  monthly: number;
}

const getTeamMetrics = unstable_cache(
  async (teamId: number | null): Promise<CaseMetrics> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [dailyCount, monthlyCount] = await Promise.all([
      prisma.case.count({
        where: {
          teamId: teamId ?? undefined,
          createdAt: {
            gte: today,
          },
        },
      }),
      prisma.case.count({
        where: {
          teamId: teamId ?? undefined,
          createdAt: {
            gte: firstDayOfMonth,
          },
        },
      }),
    ]);

    return {
      daily: dailyCount,
      monthly: monthlyCount
    };
  },
  ['case-metrics'],
  { 
    revalidate: 300, // Cache por 5 minutos para métricas
    tags: ['case-metrics'] 
  }
);

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' }, 
        { status: 401 }
      );
    }

    const metrics = await getTeamMetrics(session.teamId);
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error obteniendo métricas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}