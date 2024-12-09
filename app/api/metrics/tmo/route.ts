// app/api/metrics/tmo/route.ts
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/app/lib/auth.server';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const user = await authenticateRequest();
    if (!user || user.role !== 'team_leader') {
      return new NextResponse(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
      });
    }

    // Obtener datos del cuerpo de la petición
    const metrics = await request.json();

    // Verificar que los datos son un array
    if (!Array.isArray(metrics)) {
      return new NextResponse(JSON.stringify({ error: 'Formato inválido' }), {
        status: 400,
      });
    }

    // Insertar los datos en la base de datos
    const result = await prisma.tMOMetrics.createMany({
      data: metrics.map(metric => ({
        name: metric.name,
        qLlAtendidas: metric.qLlAtendidas,
        tiempoACD: metric.tiempoACD,
        acw: metric.acw,
        hold: metric.hold,
        ring: metric.ring,
        tmo: metric.tmo,
        teamId: metric.teamId,
        teamLeaderId: metric.teamLeaderId,
      })),
    });

    return NextResponse.json({
      message: 'Métricas guardadas correctamente',
      count: result.count,
    });

  } catch (error) {
    console.error('Error al guardar las métricas:', error);
    return new NextResponse(JSON.stringify({ error: 'Error al procesar la solicitud' }), {
      status: 500,
    });
  }
}

export async function GET(request: Request) {
    try {
      // Verificar autenticación
      const user = await authenticateRequest();
      if (!user) {
        return new NextResponse(JSON.stringify({ error: 'No autorizado' }), {
          status: 401,
        });
      }
  
      // Obtener parámetros de búsqueda
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const search = searchParams.get('search') || '';
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
  
      // Construir el where clause basado en el rol del usuario
      const whereClause: any = {};
  
      if (user.role === 'team_leader') {
        // Team leader solo ve las métricas de su equipo
        const team = await prisma.team.findFirst({
          where: {
            teamLeaderId: user.id,
          },
        });
  
        if (!team) {
          return new NextResponse(JSON.stringify({ error: 'Equipo no encontrado' }), {
            status: 404,
          });
        }
  
        whereClause.teamId = team.id;
      } else if (user.role === 'agent') {
        // Agente solo ve sus propias métricas
        whereClause.name = user.name;
        whereClause.teamId = user.teamId;
      } else if (user.role === 'admin') {
        // Admin puede ver todo
        // No agregamos restricciones al whereClause
      } else {
        return new NextResponse(JSON.stringify({ error: 'Rol no autorizado' }), {
          status: 403,
        });
      }
  
      // Agregar filtros de búsqueda
      if (search) {
        whereClause.name = {
          contains: search,
          mode: 'insensitive',
        };
      }
  
      if (startDate && endDate) {
        whereClause.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }
  
      // Obtener el total de registros para la paginación
      const total = await prisma.tMOMetrics.count({
        where: whereClause,
      });
  
      // Obtener los registros
      const metrics = await prisma.tMOMetrics.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          team: {
            select: {
              name: true,
            },
          },
        },
      });
  
      return NextResponse.json({
        metrics,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: page,
          limit,
        },
      });
  
    } catch (error) {
      console.error('Error al obtener las métricas:', error);
      return new NextResponse(JSON.stringify({ error: 'Error al procesar la solicitud' }), {
        status: 500,
      });
    }
  }