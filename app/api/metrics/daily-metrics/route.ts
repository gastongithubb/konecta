// app/api/metrics/daily-metrics/route.ts
import { NextResponse } from 'next/server';
import { parse } from 'papaparse';
import { PrismaClient, Prisma } from '@prisma/client';
import { authenticateRequest } from '@/app/lib/auth.server';

const prisma = new PrismaClient();

interface CSVRow {
  'Nombre': string;
  'Q': string;
  'NPS': string;
  'CSAT': string;
  'CES': string;
  'RD': string;
}

export async function POST(request: Request) {
  try {
    console.log('Starting daily metrics file upload process');
    
    const user = await authenticateRequest();
    if (!user) {
      console.log('Authentication failed');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    console.log('User authenticated:', { id: user.id, role: user.role });

    if (!['manager', 'team_leader'].includes(user.role)) {
      console.log('Invalid role:', user.role);
      return NextResponse.json(
        { error: 'Acceso no autorizado. Solo managers y team leaders pueden subir métricas' },
        { status: 403 }
      );
    }

    // Obtenemos el equipo del usuario
    let team = null;
    if (user.role === 'team_leader') {
      team = await prisma.team.findFirst({
        where: {
          teamLeaderId: user.id
        }
      });
    } else if (user.role === 'manager' && user.teamId) {
      team = await prisma.team.findUnique({
        where: {
          id: user.teamId
        }
      });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.log('No file received in request');
      return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 });
    }

    // Eliminar registros existentes
    if (user.role === 'team_leader') {
      await prisma.dailyMetrics.deleteMany({
        where: {
          teamLeaderId: user.id
        }
      });
    } else if (team) {
      await prisma.dailyMetrics.deleteMany({
        where: {
          teamId: team.id
        }
      });
    }

    const text = await file.text();
    const { data } = parse<CSVRow>(text, { 
      header: true, 
      skipEmptyLines: true
    });

    const metrics = [];
    for (const row of data) {
      try {
        // Preparar los datos básicos
        const metricData: Prisma.DailyMetricsCreateInput = {
          name: row['Nombre'].trim(),
          q: parseInt(row['Q']) || 0,
          nps: parseFloat(row['NPS'].replace('%', '')) || 0,
          csat: parseFloat(row['CSAT'].replace('%', '')) || 0,
          ces: parseFloat(row['CES'].replace('%', '')) || 0,
          rd: parseFloat(row['RD'].replace('%', '')) || 0,
          teamLeader: {
            connect: {
              id: user.id
            }
          }
        };

        // Si hay un equipo, lo conectamos
        if (team) {
          metricData.team = {
            connect: {
              id: team.id
            }
          };
        }

        const created = await prisma.dailyMetrics.create({
          data: metricData
        });
        
        metrics.push(created);
      } catch (rowError) {
        console.error('Error processing row:', rowError);
        throw new Error(`Error processing row: ${rowError instanceof Error ? rowError.message : 'Unknown error'}`);
      }
    }

    console.log(`Successfully processed ${metrics.length} metrics`);
    return NextResponse.json({ 
      success: true, 
      count: metrics.length 
    });
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al procesar el archivo' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}


export async function GET(request: Request) {
  try {
    console.log('Starting GET daily metrics');
    
    const user = await authenticateRequest();
    if (!user) {
      console.log('Authentication failed');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!['manager', 'team_leader'].includes(user.role)) {
      console.log('Invalid role:', user.role);
      return NextResponse.json(
        { error: 'Acceso no autorizado' },
        { status: 403 }
      );
    }

    let baseQuery: Prisma.DailyMetricsWhereInput;

    if (user.role === 'team_leader') {
      // Para team leaders, buscar por su ID o por el equipo que lidera
      const team = await prisma.team.findFirst({
        where: {
          teamLeaderId: user.id
        }
      });

      baseQuery = {
        OR: [
          { teamLeaderId: user.id },
          team ? { teamId: team.id } : {}
        ]
      };
    } else {
      if (!user.teamId) {
        return NextResponse.json(
          { error: 'No se encontró un equipo asociado al manager' },
          { status: 400 }
        );
      }

      baseQuery = {
        teamId: user.teamId
      };
    }

    const metrics = await prisma.dailyMetrics.findMany({
      where: baseQuery,
      orderBy: [
        {
          createdAt: 'desc'
        },
        {
          name: 'asc'
        }
      ],
      include: {
        team: {
          select: {
            name: true
          }
        },
        teamLeader: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    console.log(`Found ${metrics.length} metrics`);
    
    return NextResponse.json({ 
      metrics,
      count: metrics.length 
    });
  } catch (error) {
    console.error('Error fetching daily metrics:', error);
    return NextResponse.json(
      { error: 'Error al obtener las métricas' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: Request) {
  try {
    console.log('Starting DELETE daily metrics');
    
    const user = await authenticateRequest();
    if (!user) {
      console.log('Authentication failed');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!['manager', 'team_leader'].includes(user.role)) {
      console.log('Invalid role:', user.role);
      return NextResponse.json(
        { error: 'Acceso no autorizado' },
        { status: 403 }
      );
    }

    let deleteQuery: Prisma.DailyMetricsWhereInput;

    if (user.role === 'team_leader') {
      deleteQuery = {
        teamLeaderId: user.id
      };
    } else {
      if (!user.teamId) {
        return NextResponse.json(
          { error: 'No se encontró un equipo asociado al manager' },
          { status: 400 }
        );
      }

      deleteQuery = {
        teamId: user.teamId
      };
    }

    const result = await prisma.dailyMetrics.deleteMany({
      where: deleteQuery
    });

    console.log(`Deleted ${result.count} metrics`);
    
    return NextResponse.json({ 
      success: true,
      count: result.count
    });
  } catch (error) {
    console.error('Error deleting metrics:', error);
    return NextResponse.json(
      { error: 'Error al eliminar las métricas' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}