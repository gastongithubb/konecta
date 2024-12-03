// app/api/metrics-upload/base.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/app/lib/prisma';
import { authenticateRequest } from '@/app/lib/auth.server';
import { Prisma } from '@prisma/client';

export async function handleMetricUpload(
  request: NextRequest,
  processData: (data: any[], userId: number, teamId: number) => any[],
  prismaModel: any
) {
  try {
    // Verificar autenticación
    const user = await authenticateRequest();
    if (!user || user.role !== 'team_leader') {
      return NextResponse.json(
        { error: 'No autorizado' }, 
        { status: 401 }
      );
    }

    // Obtener y validar datos
    const body = await request.json();
    const data = Array.isArray(body) ? body : body.data;
    
    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Formato inválido' }, 
        { status: 400 }
      );
    }

    // Obtener equipo del usuario
    const team = await prisma.team.findFirst({
      where: { teamLeaderId: user.id }
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Equipo no encontrado' }, 
        { status: 404 }
      );
    }

    // Procesar datos
    const processedData = processData(data, user.id, team.id);

    if (processedData.length === 0) {
      return NextResponse.json(
        { error: 'No se pudo procesar los datos' }, 
        { status: 400 }
      );
    }

    // Guardar datos
    const result = await prismaModel.createMany({
      data: processedData
    });

    return NextResponse.json(
      { 
        message: 'Datos guardados exitosamente',
        count: result.count 
      }, 
      { status: 201 }
    );

  } catch (error) {
    console.error('Error:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existen métricas para este período' }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}