import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { authenticateRequest } from '@/app/lib/auth.server';
import { User } from '@/types/user';
import { Case } from '@/types/case';

export async function POST(request: NextRequest) {
  const user = await authenticateRequest() as User | null;
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { claimDate, startDate, withinSLA, caseNumber, authorizationType, details } = await request.json();

    console.log('Datos recibidos:', { claimDate, startDate, withinSLA, caseNumber, authorizationType, details });

    if (!claimDate || !startDate || !caseNumber || !authorizationType || !details) {
      console.log('Faltan campos requeridos');
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    // Permitir crear un caso sin `teamId`
    const newCase = await prisma.case.create({
      data: {
        claimDate: new Date(claimDate),
        startDate: new Date(startDate),
        withinSLA,
        caseNumber,
        authorizationType,
        details,
        userId: user.id,
        teamId: user.teamId ?? null, // Asignar `null` si no hay `teamId`
        status: 'pending',
      },
    });

    console.log('Nuevo caso creado:', newCase);

    // Notificar solo si hay un `teamId`
    if (user.teamId) {
      const teamLeader = await prisma.user.findFirst({
        where: {
          leadTeams: {
            some: {
              id: user.teamId,
            },
          },
        },
      });

      if (teamLeader) {
        await prisma.notification.create({
          data: {
            message: `Nuevo caso creado: ${newCase.caseNumber}`,
            userId: teamLeader.id,
          },
        });
      }
    }

    return NextResponse.json({ data: newCase });
  } catch (error) {
    console.error('Error creando caso:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}


export async function GET(request: NextRequest) {
  const user = await authenticateRequest() as User | null;
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const cases = await prisma.case.findMany({
      where: {
        teamId: user.teamId ?? undefined,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ data: cases });
  } catch (error) {
    console.error('Error obteniendo casos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}