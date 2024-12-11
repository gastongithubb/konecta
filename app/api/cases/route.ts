// app/api/cases/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/auth.server';
import { unstable_cache } from 'next/cache';
import { revalidateTag } from 'next/cache';
import type { Case } from '@/types/case';

// Cache para obtener casos
const getTeamCases = unstable_cache(
  async (teamId: number) => {
    return prisma.case.findMany({
      where: { teamId },
      include: {
        originalCase: {
          select: {
            caseNumber: true,
            claimDate: true,
          }
        },
        reiterations: {
          select: {
            id: true,
            caseNumber: true,
            claimDate: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  },
  ['cases'],
  { revalidate: 60, tags: ['cases'] }
);

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { claimDate, startDate, withinSLA, caseNumber, authorizationType, details, reiteratedFrom } = data;

    if (!claimDate || !startDate || !caseNumber || !authorizationType || !details) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const existingCase = await prisma.case.findUnique({
      where: { caseNumber },
      include: { reiterations: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });

    let newCaseNumber = caseNumber;
    if (reiteratedFrom) {
      const reiterationsCount = await prisma.case.count({
        where: { reiteratedFrom: parseInt(reiteratedFrom) }
      });
      newCaseNumber = `${caseNumber}-R${reiterationsCount + 1}`;
    } else if (existingCase) {
      return NextResponse.json({ 
        error: 'Caso duplicado', 
        duplicate: true,
        existingCase: {
          id: existingCase.id,
          caseNumber: existingCase.caseNumber,
          claimDate: existingCase.claimDate,
          authorizationType: existingCase.authorizationType,
          reiterationsCount: existingCase.reiterations.length
        }
      }, { status: 409 });
    }

    const newCase = await prisma.case.create({
      data: {
        claimDate: new Date(claimDate),
        startDate: new Date(startDate),
        withinSLA,
        caseNumber: newCaseNumber,
        authorizationType,
        details,
        userId: session.id,
        teamId: session.teamId,
        status: 'pending',
        ...(reiteratedFrom && { reiteratedFrom: parseInt(reiteratedFrom) })
      },
    });

    if (session.teamId) {
      const teamLeader = await prisma.user.findFirst({
        where: {
          leadTeams: { some: { id: session.teamId } },
        },
      });

      if (teamLeader) {
        await prisma.notification.create({
          data: {
            message: reiteratedFrom 
              ? `Nuevo caso reiterado creado: ${newCase.caseNumber}`
              : `Nuevo caso creado: ${newCase.caseNumber}`,
            userId: teamLeader.id,
          },
        });
      }
    }

    revalidateTag('cases');
    return NextResponse.json({ data: newCase });
  } catch (error) {
    console.error('Error creando caso:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const cases = session.teamId 
      ? await getTeamCases(session.teamId)
      : [];
    
    return NextResponse.json({ data: cases });
  } catch (error) {
    console.error('Error obteniendo casos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}