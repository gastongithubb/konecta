// app/api/cases/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/auth.server';
import { unstable_cache } from 'next/cache';
import { revalidateTag } from 'next/cache';
import type { Case } from '@/types/case';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || !['manager', 'team_leader'].includes(session.role)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    await prisma.case.delete({
      where: { id: parseInt(params.id, 10) },
    });

    revalidateTag('cases');
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
  const session = await getSession();
  if (!session || !['manager', 'team_leader'].includes(session.role)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { status } = await request.json();
    
    const updatedCase = await prisma.case.update({
      where: { id: parseInt(params.id, 10) },
      data: { status },
    });

    revalidateTag('cases');
    return NextResponse.json({ data: updatedCase });
  } catch (error) {
    console.error('Error actualizando caso:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}