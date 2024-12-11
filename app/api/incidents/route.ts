
// app/api/incidents/route.ts
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/auth.server';
import { revalidateTag, unstable_cache } from 'next/cache';

const VALID_SYSTEMS = ['Orion', 'Xlite', 'Salesforce', 'Fluir'] as const;

export interface Incident {
  id: number;
  system: 'Orion' | 'Xlite' | 'Salesforce' | 'Fluir';
  startTime: Date;
  ticketNumber: string;
  description?: string | null;
  status: 'active' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}


// Cache para obtener incidentes
const getIncidents = unstable_cache(
  async () => {
    return prisma.incident.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });
  },
  ['incidents'],
  { revalidate: 60, tags: ['incidents'] }
);

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    if (!['team_leader', 'manager'].includes(session.role)) {
      return NextResponse.json(
        { error: 'No tiene permisos para realizar esta acción' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { system, startTime, ticketNumber, description } = body;

    // Validaciones
    if (!system || !startTime || !ticketNumber) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    if (!VALID_SYSTEMS.includes(system)) {
      return NextResponse.json(
        { error: 'Sistema no válido. Debe ser: Orion, Xlite, Salesforce o Fluir' },
        { status: 400 }
      );
    }

    // Verificar duplicado
    const existingTicket = await prisma.incident.findUnique({
      where: { ticketNumber }
    });

    if (existingTicket) {
      return NextResponse.json(
        { error: 'El número de ticket ya existe' },
        { status: 400 }
      );
    }

    const incident = await prisma.incident.create({
      data: {
        system,
        startTime: new Date(startTime),
        ticketNumber,
        description: description || null,
        status: 'active'
      },
    });

    // Invalidar cache
    await revalidateTag('incidents');

    return NextResponse.json(incident);
  } catch (error) {
    console.error('Error al crear incidencia:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'El número de ticket ya existe' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  try {
    const incidents = await getIncidents();
    return NextResponse.json(incidents);
  } catch (error) {
    console.error('Error al obtener incidencias:', error);
    return NextResponse.json(
      { error: 'Error al obtener incidencias' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!['team_leader', 'manager'].includes(session.role)) {
      return NextResponse.json(
        { error: 'No tiene permisos para realizar esta acción' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, system, startTime, ticketNumber, description } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de incidente requerido' },
        { status: 400 }
      );
    }

    // Verificar duplicado excluyendo el actual
    const existingTicket = await prisma.incident.findFirst({
      where: {
        ticketNumber,
        NOT: { id }
      }
    });

    if (existingTicket) {
      return NextResponse.json(
        { error: 'El número de ticket ya existe' },
        { status: 400 }
      );
    }

    const updatedIncident = await prisma.incident.update({
      where: { id },
      data: {
        system,
        startTime: new Date(startTime),
        ticketNumber,
        description: description || null,
      },
    });

    // Invalidar cache
    await revalidateTag('incidents');

    return NextResponse.json(updatedIncident);
  } catch (error) {
    console.error('Error al actualizar incidencia:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la incidencia' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!['team_leader', 'manager'].includes(session.role)) {
      return NextResponse.json(
        { error: 'No tiene permisos para realizar esta acción' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID de incidente requerido' },
        { status: 400 }
      );
    }

    await prisma.incident.delete({
      where: { id: parseInt(id) }
    });

    // Invalidar cache
    await revalidateTag('incidents');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar incidencia:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la incidencia' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}