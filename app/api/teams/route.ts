import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/app/lib/auth.server';
import prisma from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (user.role !== 'team_leader') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    // Primero buscamos el equipo donde el usuario es team leader
    const team = await prisma.team.findFirst({
      where: {
        teamLeaderId: user.id
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        teamLeader: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        _count: {
          select: {
            cases: true,
            dailyMetrics: true,
            semanalMetrics: true,
            tmoMetrics: true,
            trimestralMetrics: true
          }
        }
      }
    });

    if (!team) {
      return NextResponse.json({ error: 'No se encontró el equipo' }, { status: 404 });
    }

    // Transformar los datos para incluir estadísticas
    const transformedTeam = {
      ...team,
      stats: {
        totalCases: team._count.cases,
        hasMetrics: {
          daily: team._count.dailyMetrics > 0,
          weekly: team._count.semanalMetrics > 0,
          tmo: team._count.tmoMetrics > 0,
          quarterly: team._count.trimestralMetrics > 0
        }
      },
      _count: undefined // Removemos el _count del resultado final
    };

    return NextResponse.json({ data: transformedTeam });
  } catch (error) {
    console.error('Error obteniendo equipo:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}