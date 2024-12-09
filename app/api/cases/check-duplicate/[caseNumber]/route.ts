//app/api/cases/check-duplicate/[caseNumber]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { authenticateRequest } from '@/app/lib/auth.server';

export async function GET(
  request: NextRequest,
  { params }: { params: { caseNumber: string } }
) {
  try {
    // Verificar autenticación usando tu sistema personalizado
    const user = await authenticateRequest();
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { caseNumber } = params;

    if (!caseNumber) {
      return NextResponse.json(
        { error: 'Número de caso inválido' },
        { status: 400 }
      );
    }

    // Buscar caso existente
    const existingCase = await prisma.case.findFirst({
      where: {
        caseNumber: caseNumber,
        // Opcionalmente, puedes filtrar por teamId si quieres que solo vean casos de su equipo
        teamId: user.teamId || undefined,
      },
      select: {
        id: true,
        caseNumber: true,
        claimDate: true,
        authorizationType: true,
        customType: true,
        status: true,
        reiteratedFrom: true,
        reiterations: {
          select: {
            id: true,
            caseNumber: true,
            claimDate: true,
            status: true,
          }
        }
      }
    });

    // Si no existe caso, retornar null
    if (!existingCase) {
      return NextResponse.json({ duplicate: null });
    }

    // Si existe, retornar la información del caso
    return NextResponse.json({
      duplicate: {
        ...existingCase,
        isReiterated: existingCase.reiteratedFrom !== null,
        reiterationsCount: existingCase.reiterations.length,
      }
    });

  } catch (error) {
    console.error('Error checking duplicate case:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}