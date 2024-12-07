// app/api/metrics/tmo/route.ts
import prisma from '@/app/lib/prisma';
import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/app/lib/auth.server';

interface TMOMetricInput {
  name: string;
  qLlAtendidas: number;
  tiempoACD: string;
  acw: string;
  hold: string;
  ring: string;
  tmo: string;
}

export async function POST(request: Request) {
  try {
    // Autenticar la solicitud
    const user = await authenticateRequest();
    
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    if (!user.teamId) {
      return NextResponse.json(
        { error: 'Usuario no asociado a un equipo' },
        { status: 400 }
      );
    }

    const data = await request.json();

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Los datos deben ser un array' },
        { status: 400 }
      );
    }

    const validData = data.filter((item): item is TMOMetricInput => {
      return (
        typeof item.name === 'string' &&
        item.name.length > 0 &&
        typeof item.qLlAtendidas === 'number' &&
        !isNaN(item.qLlAtendidas) &&
        typeof item.tiempoACD === 'string' &&
        typeof item.acw === 'string' &&
        typeof item.hold === 'string' &&
        typeof item.ring === 'string' &&
        typeof item.tmo === 'string'
      );
    });

    if (validData.length === 0) {
      return NextResponse.json(
        { error: 'No hay datos válidos para procesar' },
        { status: 400 }
      );
    }

    // Borrar registros existentes del equipo específico
    await prisma.tMOMetrics.deleteMany({
      where: {
        teamId: user.teamId
      }
    });

    // Insertar nuevos registros con los IDs del usuario autenticado
    const result = await prisma.tMOMetrics.createMany({
      data: validData.map(item => ({
        ...item,
        teamId: user.teamId!,
        teamLeaderId: user.id
      }))
    });

    return NextResponse.json({ 
      message: `${result.count} registros de TMO creados correctamente`,
      count: result.count
    });
  } catch (error) {
    console.error('Error en TMO metrics:', error);
    return NextResponse.json(
      { error: 'Error al procesar TMO metrics' }, 
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest();
    
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    if (!user.teamId) {
      return NextResponse.json(
        { error: 'Usuario no asociado a un equipo' },
        { status: 400 }
      );
    }

    // Obtener solo las métricas del equipo del usuario
    const metrics = await prisma.tMOMetrics.findMany({
      where: {
        teamId: user.teamId
      }
    });

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error al obtener TMO metrics:', error);
    return NextResponse.json(
      { error: 'Error al obtener TMO metrics' }, 
      { status: 500 }
    );
  }
}