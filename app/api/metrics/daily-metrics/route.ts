// app/api/metrics/daily-metrics/route.ts
import { NextResponse } from 'next/server';
import { parse } from 'papaparse';
import { PrismaClient, Prisma } from '@prisma/client';
import { getSession } from '@/app/lib/auth.server';
import { revalidateTag } from 'next/cache';
import { unstable_cache } from 'next/cache';

const prisma = new PrismaClient();

// types/metrics.ts
export interface CSVRow {
  'Nombre': string;
  'Q': string;
  'NPS': string;
  'CSAT': string;
  'CES': string;
  'RD': string;
}

// Cache para obtener el equipo del usuario
const getUserTeam = unstable_cache(
  async (userId: number, role: string) => {
    if (role === 'team_leader') {
      return prisma.team.findFirst({
        where: { teamLeaderId: userId }
      });
    }
    return null;
  },
  ['user-team'],
  { revalidate: 3600, tags: ['team'] }
);

// Cache para obtener métricas
const getMetricsForUser = unstable_cache(
  async (userId: number, role: string, teamId: number | null) => {
    let baseQuery: Prisma.DailyMetricsWhereInput;

    if (role === 'team_leader') {
      const team = await getUserTeam(userId, role);
      baseQuery = {
        OR: [
          { teamLeaderId: userId },
          team ? { teamId: team.id } : {}
        ]
      };
    } else {
      baseQuery = { teamId: teamId ?? undefined };
    }

    return prisma.dailyMetrics.findMany({
      where: baseQuery,
      orderBy: [
        { createdAt: 'desc' },
        { name: 'asc' }
      ],
      include: {
        team: {
          select: { name: true }
        },
        teamLeader: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
  },
  ['daily-metrics'],
  { revalidate: 300, tags: ['metrics'] }
);

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!['manager', 'team_leader'].includes(session.role)) {
      return NextResponse.json(
        { error: 'Acceso no autorizado. Solo managers y team leaders pueden subir métricas' },
        { status: 403 }
      );
    }

    const team = await getUserTeam(session.id, session.role);
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 });
    }

    // Limpiar métricas existentes
    if (session.role === 'team_leader') {
      await prisma.dailyMetrics.deleteMany({
        where: { teamLeaderId: session.id }
      });
    } else if (team) {
      await prisma.dailyMetrics.deleteMany({
        where: { teamId: team.id }
      });
    }

    const text = await file.text();
    const { data } = parse<CSVRow>(text, { header: true, skipEmptyLines: true });

    const metrics = await Promise.all(data.map(async (row) => {
      const metricData: Prisma.DailyMetricsCreateInput = {
        name: row['Nombre'].trim(),
        q: parseInt(row['Q']) || 0,
        nps: parseFloat(row['NPS'].replace('%', '')) || 0,
        csat: parseFloat(row['CSAT'].replace('%', '')) || 0,
        ces: parseFloat(row['CES'].replace('%', '')) || 0,
        rd: parseFloat(row['RD'].replace('%', '')) || 0,
        teamLeader: { connect: { id: session.id } }
      };

      if (team) {
        metricData.team = { connect: { id: team.id } };
      }

      return prisma.dailyMetrics.create({ data: metricData });
    }));

    revalidateTag('metrics');
    
    return NextResponse.json({ 
      success: true, 
      count: metrics.length 
    });
  } catch (error) {
    console.error('Error en carga de métricas:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al procesar el archivo' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!['manager', 'team_leader'].includes(session.role)) {
      return NextResponse.json(
        { error: 'Acceso no autorizado' },
        { status: 403 }
      );
    }

    const metrics = await getMetricsForUser(session.id, session.role, session.teamId);
    
    return NextResponse.json({ 
      metrics,
      count: metrics.length 
    });
  } catch (error) {
    console.error('Error obteniendo métricas:', error);
    return NextResponse.json(
      { error: 'Error al obtener las métricas' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!['manager', 'team_leader'].includes(session.role)) {
      return NextResponse.json(
        { error: 'Acceso no autorizado' },
        { status: 403 }
      );
    }

    const deleteQuery: Prisma.DailyMetricsWhereInput = session.role === 'team_leader'
      ? { teamLeaderId: session.id }
      : { teamId: session.teamId ?? undefined };

    const result = await prisma.dailyMetrics.deleteMany({
      where: deleteQuery
    });

    revalidateTag('metrics');
    
    return NextResponse.json({ 
      success: true,
      count: result.count
    });
  } catch (error) {
    console.error('Error eliminando métricas:', error);
    return NextResponse.json(
      { error: 'Error al eliminar las métricas' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}