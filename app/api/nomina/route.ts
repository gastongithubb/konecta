import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Obtener miembros
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('teamId');

  try {
    const whereCondition: any = {};

    if (teamId) {
      whereCondition.teamId = parseInt(teamId);
    }

    if (Object.keys(whereCondition).length === 0) {
      return NextResponse.json({ error: 'Se requiere al menos teamId' }, { status: 400 });
    }

    const members = await prisma.nomina.findMany({
      where: whereCondition,
      include: {
        team: true
      },
      orderBy: {
        createdAt: 'desc' // Add sorting by creation date
      }
    });
    return NextResponse.json(members, { status: 200 });
  } catch (error) {
    console.error('Error al obtener miembros:', error);
    return NextResponse.json({ error: 'Error al obtener miembros' }, { status: 500 });
  }
}

// POST - Crear nuevo miembro
export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    estadoActual,
    cuenta,
    servicio,
    cargo,
    provincia,
    site,
    lider,
    apellidoYNombre,
    usuarioOrion,
    usuarioSalesforce,
    modalidad,
    ingreso,
    egreso,
    box,
    teamId,
  } = body;

  // More comprehensive validation
  const requiredFields = [
    'estadoActual', 'cuenta', 'servicio', 'cargo', 'provincia', 
    'site', 'lider', 'apellidoYNombre', 'usuarioOrion', 
    'usuarioSalesforce', 'modalidad', 'ingreso', 'egreso', 'box'
  ];

  const missingFields = requiredFields.filter(field => !body[field]);
  
  if (missingFields.length > 0) {
    return NextResponse.json({ 
      error: `Campos requeridos faltantes: ${missingFields.join(', ')}` 
    }, { status: 400 });
  }

  if (!teamId) {
    return NextResponse.json({ error: 'teamId es requerido' }, { status: 400 });
  }

  try {
    const member = await prisma.nomina.create({
      data: {
        estadoActual,
        cuenta,
        servicio,
        cargo,
        provincia,
        site,
        lider,
        apellidoYNombre,
        usuarioOrion,
        usuarioSalesforce,
        modalidad,
        ingreso,
        egreso,
        box,
        teamId: parseInt(teamId, 10),
      },
      include: {
        team: true // Include team details in the response
      }
    });
    return NextResponse.json(member, { status: 201 }); // Use 201 for resource creation
  } catch (error) {
    console.error('Error al insertar miembro:', error);
    return NextResponse.json({ error: 'Error al insertar miembro' }, { status: 500 });
  }
}

// DELETE - Eliminar miembro
export async function DELETE(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);

  if (!id) {
    return NextResponse.json({ error: 'id es requerido' }, { status: 400 });
  }

  try {
    // First, check if the member exists
    const existingMember = await prisma.nomina.findUnique({
      where: { id },
    });

    if (!existingMember) {
      return NextResponse.json({ error: 'Miembro no encontrado' }, { status: 404 });
    }

    const member = await prisma.nomina.delete({
      where: { id },
    });
    return NextResponse.json(member, { status: 200 });
  } catch (error) {
    console.error('Error al eliminar miembro:', error);
    return NextResponse.json({ error: 'Error al eliminar miembro' }, { status: 500 });
  }
}
