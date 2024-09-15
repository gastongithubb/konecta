import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/app/lib/auth.server';
import prisma from '@/app/lib/prisma';
import { Prisma } from '@prisma/client';

interface BaseMetric {
  teamLeaderId: number;
  teamId: number;
}

interface TrimestralMetric extends BaseMetric {
  name: string;
  month: string;
  qResp: number;
  nps: number;
  sat: number;
  rd: number;
}

interface SemanalMetric extends BaseMetric {
  name: string;
  week: string;
  q: number;
  nps: number;
  csat: number;
}

interface TMOMetric extends BaseMetric {
  name: string;
  qLlAtendidas: number;
  tiempoACD: string;
  acw: string;
  hold: string;
  ring: string;
  tmo: string;
}

interface NPSDiarioMetric extends BaseMetric {
  date: Date;
  nsp: number;
  q: number;
  nps: number;
  csat: number;
  ces: number;
  rd: number;
}

type MetricType = TrimestralMetric | SemanalMetric | TMOMetric | NPSDiarioMetric;


export async function POST(request: NextRequest) {
  const user = await authenticateRequest();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (user.role !== 'team_leader') {
    return NextResponse.json({ error: 'Acceso denegado. Solo los líderes de equipo pueden subir métricas.' }, { status: 403 });
  }

  try {
    const { fileType, data } = await request.json();

    if (!['trimestral', 'semanal', 'tmo', 'nps-diario'].includes(fileType)) {
      return NextResponse.json({ error: 'Tipo de archivo no válido' }, { status: 400 });
    }

    const team = await prisma.team.findFirst({
      where: { teamLeaderId: user.id }
    });

    if (!team) {
      return NextResponse.json({ error: 'Equipo no encontrado para este líder' }, { status: 404 });
    }

    let processedData: MetricType[] = [];
    switch (fileType) {
    case 'trimestral':
      processedData = processTrimestralData(data, user.id, team.id);
      break;
    case 'semanal':
      processedData = processSemanalData(data, user.id, team.id);
      break;
    case 'tmo':
      processedData = processTMOData(data, user.id, team.id);
      break;
    case 'nps-diario':
      processedData = processNPSDiarioData(data, user.id, team.id);
      break;
  }

    if (!processedData || processedData.length === 0) {
      return NextResponse.json({ error: 'No se pudo procesar los datos o todos los datos fueron inválidos' }, { status: 400 });
    }

    const count = await saveDataToDatabase(fileType, processedData);

    return NextResponse.json({ 
      message: 'Datos subidos exitosamente', 
      count
    }, { status: 201 });
  } catch (error) {
    console.error('Error subiendo métricas:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'Ya existen métricas para esta fecha o período' }, { status: 400 });
      }
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

function processTrimestralData(data: Record<string, string>[], userId: number, teamId: number): TrimestralMetric[] {
  return data.map(row => ({
    name: row['Nombre'] || '',
    month: 'septiembre', // Ajusta según el mes actual
    qResp: parseInt(row['Q de resp'] || '0'),
    nps: parseInt(row['NPS'] || '0'),
    sat: parseFloat(row['SAT']?.replace('%', '') || '0') / 100,
    rd: parseFloat(row['RD']?.replace('%', '') || '0') / 100,
    teamLeaderId: userId,
    teamId
  })).filter(item => item.name);
}

function processSemanalData(data: Record<string, string>[], userId: number, teamId: number): SemanalMetric[] {
  const weeks = ['Semana Vernes 09', 'Data Viernes 16', 'Data Viernes 20', 'Data Viernes 30'];
  return data.flatMap(row => 
    weeks.map(week => ({
      name: row['EQUIPO'] || '',
      week,
      q: parseInt(row[`${week}.Q`] || '0'),
      nps: parseInt(row[`${week}.NPS`] || '0'),
      csat: parseFloat(row[`${week}.CSAT`]?.replace('%', '') || '0') / 100,
      teamLeaderId: userId,
      teamId
    }))
  ).filter(item => item.name);
}

function processTMOData(data: Record<string, string>[], userId: number, teamId: number): TMOMetric[] {
  return data.map(row => ({
    name: row['TMO AL 30']?.replace('KN - ', '') || '',
    qLlAtendidas: parseInt(row['Q Ll atendidas'] || '0'),
    tiempoACD: row['Tiempo ACD'] || '',
    acw: row['ACW'] || '',
    hold: row['HOLD'] || '',
    ring: row['RING'] || '',
    tmo: row['TMO'] || '',
    teamLeaderId: userId,
    teamId
  })).filter(item => item.name);
}

function processNPSDiarioData(data: Record<string, string>[], userId: number, teamId: number): NPSDiarioMetric[] {
  return data.map(row => ({
    date: new Date(row.date),
    nsp: parseInt(row.nsp || '0'),
    q: parseInt(row.q || '0'),
    nps: parseInt(row.nps || '0'),
    csat: parseFloat(row.csat || '0'),
    ces: parseFloat(row.ces || '0'),
    rd: parseFloat(row.rd || '0'),
    teamLeaderId: userId,  // Add this line
    teamId
  })).filter(item => !isNaN(item.date.getTime()));
}

async function saveDataToDatabase(fileType: string, data: any[]): Promise<number> {
  let result: Prisma.BatchPayload;
  switch (fileType) {
    case 'trimestral':
      result = await prisma.trimestralMetrics.createMany({ data });
      break;
    case 'semanal':
      result = await prisma.semanalMetrics.createMany({ data });
      break;
    case 'tmo':
      result = await prisma.tMOMetrics.createMany({ data });
      break;
    case 'nps-diario':
      result = await prisma.dailyMetrics.createMany({ data });
      break;
    default:
      throw new Error('Tipo de archivo no válido');
  }
  return result.count;
}