// app/api/metrics/tmo-metrics/route.ts
import { NextResponse } from 'next/server';
import { parse } from 'papaparse';
import { PrismaClient, Prisma } from '@prisma/client';
import { authenticateRequest } from '@/app/lib/auth.server';

const prisma = new PrismaClient();

interface CSVRow {
  'Usuario Orion': string;
  'Q Ll atendidas': string;
  'Tiempo ACD': string;
  'ACW': string;
  'HOLD': string;
  'RING': string;
  'TMO': string;
}

export async function POST(request: Request) {
  try {
    console.log('Starting file upload process');
    
    const user = await authenticateRequest();
    if (!user) {
      console.log('Authentication failed');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    console.log('User authenticated:', { id: user.id, role: user.role });

    // Validación de rol
    if (!['manager', 'team_leader'].includes(user.role)) {
      console.log('Invalid role:', user.role);
      return NextResponse.json(
        { error: 'Acceso no autorizado. Solo managers y team leaders pueden subir métricas TMO' },
        { status: 403 }
      );
    }

    // Get teamId logic...
    let teamId = null;
    if (user.role === 'team_leader') {
      const team = await prisma.team.findFirst({
        where: {
          teamLeaderId: user.id
        }
      });
      if (team) {
        teamId = team.id;
      }
    } else if (user.role === 'manager') {
      teamId = user.teamId;
    }

    if (teamId === null) {
      console.log('No team found for user');
      return NextResponse.json(
        { error: 'No se encontró un equipo asociado al usuario' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.log('No file received in request');
      return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 });
    }

    // First, delete all existing records for this team
    await prisma.tMOMetrics.deleteMany({
      where: {
        teamId: teamId
      }
    });
    
    console.log(`Deleted existing metrics for team ${teamId}`);

    const text = await file.text();
    const { data } = parse<CSVRow>(text, { 
      header: true, 
      skipEmptyLines: true
    });

    const metrics = [];
    for (const row of data) {
      try {
        const name = row['Usuario Orion']?.split('-')[1]?.trim() || row['Usuario Orion'];
        console.log('Processing row for:', name);

        const created = await prisma.tMOMetrics.create({ 
          data: {
            name,
            qLlAtendidas: parseInt(row['Q Ll atendidas']) || 0,
            tiempoACD: row['Tiempo ACD'] || '00:00:00',
            acw: row['ACW'] || '00:00:00',
            hold: row['HOLD'] || '00:00:00',
            ring: row['RING'] || '00:00:00',
            tmo: row['TMO'] || '00:00:00',
            teamLeaderId: user.id,
            teamId: teamId
          }
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
    console.log('Starting GET TMO metrics');
    
    const user = await authenticateRequest();
    if (!user) {
      console.log('Authentication failed');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    console.log('User authenticated:', { id: user.id, role: user.role });

    if (!['manager', 'team_leader'].includes(user.role)) {
      console.log('Invalid role:', user.role);
      return NextResponse.json(
        { error: 'Acceso no autorizado' },
        { status: 403 }
      );
    }

    let teamId = null;
    if (user.role === 'team_leader') {
      const team = await prisma.team.findFirst({
        where: {
          teamLeaderId: user.id
        }
      });
      if (team) {
        teamId = team.id;
      }
    } else if (user.role === 'manager') {
      teamId = user.teamId;
    }

    // Definir la consulta base con tipos correctos
    const baseQuery: Prisma.TMOMetricsWhereInput = user.role === 'team_leader'
      ? {
          OR: [
            { teamLeaderId: user.id },
            { teamId: teamId }
          ]
        }
      : { teamId: teamId };

    const metrics = await prisma.tMOMetrics.findMany({
      where: baseQuery,
      orderBy: {
        createdAt: 'desc' as Prisma.SortOrder
      },
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

    console.log(`Found ${metrics.length} metrics`);
    
    return NextResponse.json({ 
      metrics,
      count: metrics.length 
    });
  } catch (error) {
    console.error('Error fetching TMO metrics:', error);
    return NextResponse.json(
      { error: 'Error al obtener las métricas' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}