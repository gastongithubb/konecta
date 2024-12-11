// app/api/metrics/tmo/route.ts
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth.server';
import { revalidateTag, unstable_cache } from 'next/cache';
import type { TMOMetric } from '@/types/metrics';

const prisma = new PrismaClient();



// Cache para obtener equipo del usuario
const getUserTeam = unstable_cache(
  async (userId: number) => {
    return prisma.team.findFirst({
      where: { teamLeaderId: userId },
    });
  },
  ['user-team'],
  { revalidate: 3600, tags: ['team'] }
);

// Cache para obtener métricas con filtros
const getFilteredMetrics = unstable_cache(
  async (
    whereClause: any,
    page: number,
    limit: number
  ) => {
    const [total, metrics] = await Promise.all([
      prisma.tMOMetrics.count({ where: whereClause }),
      prisma.tMOMetrics.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          team: {
            select: { name: true }
          }
        }
      })
    ]);

    return {
      metrics,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit
      }
    };
  },
  ['tmo-metrics'],
  { revalidate: 300, tags: ['tmo'] }
);

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'team_leader') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const metrics = await request.json();

    if (!Array.isArray(metrics)) {
      return NextResponse.json(
        { error: 'Formato inválido' },
        { status: 400 }
      );
    }

    const result = await prisma.tMOMetrics.createMany({
      data: metrics.map((metric: TMOMetric) => ({
        name: metric.name,
        qLlAtendidas: metric.qLlAtendidas,
        tiempoACD: metric.tiempoACD,
        acw: metric.acw,
        hold: metric.hold,
        ring: metric.ring,
        tmo: metric.tmo,
        teamId: metric.teamId,
        teamLeaderId: metric.teamLeaderId,
      })),
    });

    // Invalidar cache después de crear nuevas métricas
    await revalidateTag('tmo');

    return NextResponse.json({
      message: 'Métricas guardadas correctamente',
      count: result.count,
    });

  } catch (error) {
    console.error('Error al guardar las métricas:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Construir where clause basado en el rol
    let whereClause: any = {};

    if (session.role === 'team_leader') {
      const team = await getUserTeam(session.id);
      if (!team) {
        return NextResponse.json(
          { error: 'Equipo no encontrado' },
          { status: 404 }
        );
      }
      whereClause.teamId = team.id;
    } else if (session.role === 'user') {
      whereClause = {
        name: session.name,
        teamId: session.teamId
      };
    } else if (session.role !== 'manager') {
      return NextResponse.json(
        { error: 'Rol no autorizado' },
        { status: 403 }
      );
    }

    // Añadir filtros de búsqueda
    if (search) {
      whereClause.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const result = await getFilteredMetrics(whereClause, page, limit);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error al obtener las métricas:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}