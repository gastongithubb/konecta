import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT - Actualizar miembro
export async function PUT(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const id = parseInt(params.id);

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

  if (!id) {
    return NextResponse.json({ error: 'id es requerido' }, { status: 400 });
  }

  try {
    const member = await prisma.nomina.update({
      where: { id },
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
        ...(teamId && { teamId: parseInt(teamId) }),
      },
    });
    return NextResponse.json(member, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar miembro:', error);
    return NextResponse.json({ error: 'Error al actualizar miembro' }, { status: 500 });
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
    const member = await prisma.nomina.delete({
      where: { id },
    });
    return NextResponse.json(member, { status: 200 });
  } catch (error) {
    console.error('Error al eliminar miembro:', error);
    return NextResponse.json({ error: 'Error al eliminar miembro' }, { status: 500 });
  }
}