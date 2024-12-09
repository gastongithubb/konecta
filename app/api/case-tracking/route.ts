// src/app/api/case-tracking/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log('Received data:', data);

    if (!data.caseNumber || !data.action || !data.reason) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const result = await prisma.caseTracking.create({
      data: {
        caseNumber: data.caseNumber,
        action: data.action,
        area: data.action === 'Derivar' ? data.area : null,
        reason: data.reason,
        completed: false,
      },
    });

    return NextResponse.json({
      message: 'Seguimiento creado exitosamente',
      data: result
    });

  } catch (error: any) {
    console.error('Error detallado:', error);
    
    // Manejo específico para error de caseNumber único
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'El número de caso ya existe' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear el seguimiento del caso' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cases = await prisma.caseTracking.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(cases);
  } catch (error) {
    console.error('Error fetching cases:', error);
    return NextResponse.json(
      { error: 'Error al obtener los seguimientos' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    
    if (!data.id) {
      return NextResponse.json(
        { error: 'Falta el ID del caso' },
        { status: 400 }
      );
    }

    const result = await prisma.caseTracking.update({
      where: {
        id: data.id,
      },
      data: {
        completed: data.completed,
      },
    });
    
    return NextResponse.json({
      message: 'Seguimiento actualizado exitosamente',
      data: result
    });
  } catch (error) {
    console.error('Error updating case:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el seguimiento' },
      { status: 500 }
    );
  }
}