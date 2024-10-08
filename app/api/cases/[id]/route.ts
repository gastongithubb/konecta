import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { authenticateRequest } from '@/app/lib/auth.server';
import { User } from '@/types/user';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await authenticateRequest() as User | null;
  if (!user || (user.role !== 'manager' && user.role !== 'team_leader')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    await prisma.case.delete({
      where: { id: parseInt(params.id, 10) },
    });

    return NextResponse.json({ message: 'Caso eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando caso:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await authenticateRequest() as User | null;
  if (!user || (user.role !== 'manager' && user.role !== 'team_leader')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { status } = await request.json();

    const updatedCase = await prisma.case.update({
      where: { id: parseInt(params.id, 10) },
      data: { status },
    });

    return NextResponse.json({ data: updatedCase });
  } catch (error) {
    console.error('Error actualizando caso:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}