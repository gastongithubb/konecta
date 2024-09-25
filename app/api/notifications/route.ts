// app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { authenticateRequest } from '@/app/lib/auth.server';

export async function GET(request: NextRequest) {
  const user = await authenticateRequest();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
        read: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ data: notifications });
  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await authenticateRequest();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { message, userId } = await request.json();

    const notification = await prisma.notification.create({
      data: {
        message,
        userId,
      },
    });

    return NextResponse.json({ data: notification });
  } catch (error) {
    console.error('Error creando notificación:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const user = await authenticateRequest();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { id } = await request.json();

    const notification = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return NextResponse.json({ data: notification });
  } catch (error) {
    console.error('Error actualizando notificación:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}