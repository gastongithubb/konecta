import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/app/lib/auth.server';
import prisma from '@/app/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(request: NextRequest) {
  const user = await authenticateRequest();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (user.role !== 'team_leader') {
    return NextResponse.json({ error: 'Acceso denegado. Solo los líderes de equipo pueden subir métricas.' }, { status: 403 });
  }

  try {
    const { metrics } = await request.json();

    if (!Array.isArray(metrics) || metrics.length === 0) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const team = await prisma.team.findFirst({
      where: { teamLeaderId: user.id }
    });

    if (!team) {
      return NextResponse.json({ error: 'Equipo no encontrado para este líder' }, { status: 404 });
    }

    const results = await prisma.$transaction(async (prisma) => {
      return Promise.all(metrics.map(async (metric) => {
        const { date, nsp, q, nps, csat, ces, rd } = metric;

        if (!date || isNaN(nsp) || isNaN(q) || isNaN(nps) || isNaN(csat) || isNaN(ces) || isNaN(rd)) {
          return { error: 'Datos incompletos o inválidos', metric };
        }

        return prisma.dailyMetrics.create({
          data: {
            date: new Date(date),
            nsp,
            q,
            nps,
            csat,
            ces,
            rd,
            userId: user.id,
            teamId: team.id
          }
        });
      }));
    });

    const errors = results.filter(result => 'error' in result);
    if (errors.length > 0) {
      return NextResponse.json({ error: 'Algunos datos no pudieron ser procesados', details: errors }, { status: 400 });
    }

    return NextResponse.json({ data: { message: 'Datos subidos exitosamente', count: results.length } }, { status: 201 });
  } catch (error) {
    console.error('Error subiendo métricas diarias:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'Ya existen métricas para esta fecha' }, { status: 400 });
      }
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

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

    let where = {};
    if (user.role === 'team_leader') {
      const team = await prisma.team.findFirst({
        where: { teamLeaderId: user.id }
      });
      if (!team) {
        return NextResponse.json({ error: 'Equipo no encontrado para este líder' }, { status: 404 });
      }
      where = { teamId: team.id };
    } else if (user.role === 'user') {
      where = { userId: user.id };
    }

    const metrics = await prisma.dailyMetrics.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        team: { select: { id: true, name: true } }
      }
    });

    const totalCount = await prisma.dailyMetrics.count({ where });

    return NextResponse.json({
      data: {
        metrics,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
    });
  } catch (error) {
    console.error('Error obteniendo métricas diarias:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}