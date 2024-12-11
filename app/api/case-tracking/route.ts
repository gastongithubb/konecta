// app/api/case-tracking/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/auth.server';
import { Prisma } from '@prisma/client';
import { unstable_cache } from 'next/cache';
import { revalidateTag } from 'next/cache';
import type { User } from '@/types/auth';

interface CaseTrackingData {
  caseNumber: string;
  action: string;
  reason: string;
  area?: string;
}

const getCasesByTeam = unstable_cache(
  async (teamId: number) => {
    return await prisma.caseTracking.findMany({
      where: { teamId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } }
    });
  },
  ['case-tracking'],
  {
    revalidate: 60,
    tags: ['case-tracking']
  }
);

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' }, 
        { status: 401 }
      );
    }

    if (!session.teamId) {
      return NextResponse.json(
        { error: 'Usuario no pertenece a ningún equipo' },
        { status: 400 }
      );
    }

    const data = await req.json() as CaseTrackingData;
    
    if (!data.caseNumber || !data.action || !data.reason) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const result = await prisma.caseTracking.create({
      data: {
        ...data,
        teamId: session.teamId,
        userId: session.id,
        area: data.action === 'Derivar' ? data.area : null,
      },
    });

    revalidateTag('case-tracking');

    return NextResponse.json({ 
      message: 'Seguimiento creado exitosamente', 
      data: result 
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'El número de caso ya existe' },
          { status: 400 }
        );
      }
    }
    
    console.error('Error al crear seguimiento:', error);
    return NextResponse.json(
      { error: 'Error al crear el seguimiento' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' }, 
        { status: 401 }
      );
    }

    if (!session.teamId) {
      return NextResponse.json(
        { error: 'Usuario no pertenece a ningún equipo' },
        { status: 400 }
      );
    }

    const cases = await getCasesByTeam(session.teamId);
    return NextResponse.json(cases);
  } catch (error) {
    console.error('Error al obtener casos:', error);
    return NextResponse.json(
      { error: 'Error al obtener los seguimientos' }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' }, 
        { status: 401 }
      );
    }

    if (!session.teamId) {
      return NextResponse.json(
        { error: 'Usuario no pertenece a ningún equipo' },
        { status: 400 }
      );
    }

    const data = await req.json();
    
    if (!data.id) {
      return NextResponse.json(
        { error: 'Falta el ID del caso' },
        { status: 400 }
      );
    }

    const existingCase = await prisma.caseTracking.findUnique({
      where: { id: data.id },
      select: { teamId: true }
    });

    if (!existingCase || existingCase.teamId !== session.teamId) {
      return NextResponse.json(
        { error: 'No autorizado para modificar este caso' },
        { status: 403 }
      );
    }

    const result = await prisma.caseTracking.update({
      where: { id: data.id },
      data: { completed: !!data.completed },
    });
    
    revalidateTag('case-tracking');

    return NextResponse.json({
      message: 'Seguimiento actualizado exitosamente',
      data: result
    });
  } catch (error) {
    console.error('Error al actualizar caso:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el seguimiento' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}