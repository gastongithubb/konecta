// app/api/metrics/tmo-metrics/route.ts
import { NextResponse } from 'next/server';
import { parse } from 'papaparse';
import { PrismaClient, Prisma } from '@prisma/client';
import { getSession } from '@/app/lib/auth.server';
import { revalidateTag, unstable_cache } from 'next/cache';

// types/metrics.ts
export interface TMOCSVRow {
  'Usuario Orion': string;
  'Q Ll atendidas': string;
  'Tiempo ACD': string;
  'ACW': string;
  'HOLD': string;
  'RING': string;
  'TMO': string;
}

const prisma = new PrismaClient();

// Cache para obtener equipo del usuario
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

// Cache para obtener métricas TMO
const getTMOMetrics = unstable_cache(
  async (baseQuery: Prisma.TMOMetricsWhereInput) => {
    return prisma.tMOMetrics.findMany({
      where: baseQuery,
      orderBy: { createdAt: 'desc' },
      include: {
        team: true,
        teamLeader: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
  },
  ['tmo-metrics'],
  { revalidate: 300, tags: ['tmo-metrics'] }
);

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!['manager', 'team_leader'].includes(session.role)) {
      return NextResponse.json(
        { error: 'Acceso no autorizado. Solo managers y team leaders pueden subir métricas TMO' },
        { status: 403 }
      );
    }

    let teamId = null;
    if (session.role === 'team_leader') {
      const team = await getUserTeam(session.id, session.role);
      if (team) teamId = team.id;
    } else if (session.role === 'manager') {
      teamId = session.teamId;
    }

    if (!teamId) {
      return NextResponse.json(
        { error: 'No se encontró un equipo asociado al usuario' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 });
    }

    // Eliminar métricas existentes
    await prisma.tMOMetrics.deleteMany({
      where: { teamId }
    });

    const text = await file.text();
    const { data } = parse<TMOCSVRow>(text, { 
      header: true, 
      skipEmptyLines: true 
    });

    const metrics = await Promise.all(data.map(async row => {
      const name = row['Usuario Orion']?.split('-')[1]?.trim() || row['Usuario Orion'];
      
      return prisma.tMOMetrics.create({ 
        data: {
          name,
          qLlAtendidas: parseInt(row['Q Ll atendidas']) || 0,
          tiempoACD: row['Tiempo ACD'] || '00:00:00',
          acw: row['ACW'] || '00:00:00',
          hold: row['HOLD'] || '00:00:00',
          ring: row['RING'] || '00:00:00',
          tmo: row['TMO'] || '00:00:00',
          teamLeaderId: session.id,
          teamId
        }
      });
    }));

    // Invalidar cache después de actualizar
    await revalidateTag('tmo-metrics');

    return NextResponse.json({ 
      success: true, 
      count: metrics.length 
    });
  } catch (error) {
    console.error('Error en carga de métricas TMO:', error);
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

    let teamId = null;
    if (session.role === 'team_leader') {
      const team = await getUserTeam(session.id, session.role);
      if (team) teamId = team.id;
    } else if (session.role === 'manager') {
      teamId = session.teamId;
    }

    const baseQuery: Prisma.TMOMetricsWhereInput = session.role === 'team_leader'
      ? {
          OR: [
            { teamLeaderId: session.id },
            { teamId }
          ]
        }
      : { teamId };

    const metrics = await getTMOMetrics(baseQuery);
    
    return NextResponse.json({ 
      metrics,
      count: metrics.length 
    });
  } catch (error) {
    console.error('Error obteniendo métricas TMO:', error);
    return NextResponse.json(
      { error: 'Error al obtener las métricas' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}