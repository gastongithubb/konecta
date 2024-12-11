// app/api/cases/check-duplicate/[caseNumber]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/auth.server';
import { unstable_cache } from 'next/cache';

const getCaseByNumber = unstable_cache(
  async (caseNumber: string, teamId: number | null) => {
    return prisma.case.findFirst({
      where: {
        caseNumber,
        teamId: teamId ?? undefined,
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
  },
  ['case-by-number'],
  { revalidate: 60, tags: ['case-duplicate'] }
);

export async function GET(
  request: NextRequest,
  { params }: { params: { caseNumber: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
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

    const existingCase = await getCaseByNumber(caseNumber, session.teamId);

    if (!existingCase) {
      return NextResponse.json({ duplicate: null });
    }

    return NextResponse.json({
      duplicate: {
        ...existingCase,
        isReiterated: existingCase.reiteratedFrom !== null,
        reiterationsCount: existingCase.reiterations.length,
      }
    });

  } catch (error) {
    console.error('Error verificando caso duplicado:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}