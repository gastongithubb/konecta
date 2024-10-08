import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { authenticateRequest } from '@/app/lib/auth.server';
import { User } from '@/types/user';

export async function GET(request: NextRequest) {
  const user = await authenticateRequest() as User | null;
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const dailyCount = await prisma.case.count({
      where: {
        teamId: user.teamId ?? undefined,
        createdAt: {
          gte: today,
        },
      },
    });

    const monthlyCount = await prisma.case.count({
      where: {
        teamId: user.teamId ?? undefined,
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
    });

    return NextResponse.json({ daily: dailyCount, monthly: monthlyCount });
  } catch (error) {
    console.error('Error obteniendo conteos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}