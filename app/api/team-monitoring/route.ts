// app/api/team-monitoring/weeks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/auth.server';
import { WeekConfigurationInput } from '@/types/team-monitoring';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const weeks = await prisma.weekConfiguration.findMany({
      where: { isActive: true },
      orderBy: { weekNumber: 'asc' }
    });

    return NextResponse.json(weeks);
  } catch (error) {
    console.error('Error fetching weeks:', error);
    return NextResponse.json(
      { error: 'Error al obtener las semanas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['manager', 'team_leader'].includes(session.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data: WeekConfigurationInput = await request.json();

    const week = await prisma.weekConfiguration.create({
      data: {
        ...data,
        createdBy: session.id,
      },
    });

    return NextResponse.json(week);
  } catch (error) {
    console.error('Error creating week:', error);
    return NextResponse.json(
      { error: 'Error al crear la semana' },
      { status: 500 }
    );
  }
}