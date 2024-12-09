// src/app/api/case-tracking/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { authenticateRequest } from '@/app/lib/auth.server';
import { Prisma } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const user = await authenticateRequest();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    
    if (!data.caseNumber || !data.action || !data.reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await prisma.caseTracking.create({
      data: {
        ...data,
        teamId: user.teamId,
        userId: user.id,
        area: data.action === 'Derivar' ? data.area : null,
      },
    });

    return NextResponse.json({ message: 'Success', data: result });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Case number already exists' },
          { status: 400 }
        );
      }
    }
    
    console.error('Error creating case tracking:', error);
    return NextResponse.json(
      { error: 'Failed to create case tracking' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const user = await authenticateRequest();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const cases = await prisma.caseTracking.findMany({
      where: { 
        teamId: Number(user.teamId)
      },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } }
    });
    
    return NextResponse.json(cases);
  } catch (error) {
    console.error('Error fetching cases:', error);
    return NextResponse.json({ error: 'Error al obtener los seguimientos' }, { status: 500 });
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
        completed: !!data.completed,
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