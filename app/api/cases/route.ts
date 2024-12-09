import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { authenticateRequest } from '@/app/lib/auth.server';
import { User } from '@/types/user';
import { Case } from '@/types/case';

export async function POST(request: NextRequest) {
  const user = await authenticateRequest() as User | null;
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const data = await request.json();
    console.log('Datos recibidos:', data);

    const { claimDate, startDate, withinSLA, caseNumber, authorizationType, details, reiteratedFrom } = data;

    if (!claimDate || !startDate || !caseNumber || !authorizationType || !details) {
      console.log('Faltan campos requeridos');
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    // Verificar si el caso ya existe
    const existingCase = await prisma.case.findUnique({
      where: { caseNumber },
      include: {
        reiterations: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    // Si es una reiteración, necesitamos generar un nuevo número de caso
    let newCaseNumber = caseNumber;
    if (reiteratedFrom) {
      // Contar las reiteraciones existentes para este caso
      const reiterationsCount = await prisma.case.count({
        where: {
          reiteratedFrom: parseInt(reiteratedFrom)
        }
      });
      
      // Generar el nuevo número de caso con un sufijo
      newCaseNumber = `${caseNumber}-R${reiterationsCount + 1}`;
    } else if (existingCase) {
      // Si no es una reiteración y el caso existe, retornar error de duplicado
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

    // Crear el nuevo caso con el número modificado si es una reiteración
    const newCase = await prisma.case.create({
      data: {
        claimDate: new Date(claimDate),
        startDate: new Date(startDate),
        withinSLA,
        caseNumber: newCaseNumber, // Usar el nuevo número de caso
        authorizationType,
        details,
        userId: user.id,
        teamId: user.teamId ?? null,
        status: 'pending',
        ...(reiteratedFrom && { reiteratedFrom: parseInt(reiteratedFrom) })
      },
    });

    console.log('Nuevo caso creado:', newCase);

    // Notificar al líder del equipo
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
            message: reiteratedFrom 
              ? `Nuevo caso reiterado creado: ${newCase.caseNumber}`
              : `Nuevo caso creado: ${newCase.caseNumber}`,
            userId: teamLeader.id,
          },
        });
      }
    }

    return NextResponse.json({ data: newCase });
  } catch (error) {
    console.error('Error creando caso:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
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