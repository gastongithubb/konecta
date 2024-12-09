import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/app/lib/prisma'
import { authenticateRequest } from '@/app/lib/auth.server'

export async function POST(request: Request) {
  try {
    // Verificar autenticación y rol
    const user = await authenticateRequest()
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar rol
    if (user.role !== 'team_leader' && user.role !== 'manager') {
      return NextResponse.json(
        { error: 'No tiene permisos para realizar esta acción' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { system, startTime, ticketNumber, description } = body

    // Validaciones
    if (!system) {
      return NextResponse.json({ error: 'El sistema es requerido' }, { status: 400 })
    }
    if (!startTime) {
      return NextResponse.json({ error: 'La fecha de inicio es requerida' }, { status: 400 })
    }
    if (!ticketNumber) {
      return NextResponse.json({ error: 'El número de ticket es requerido' }, { status: 400 })
    }

    const validSystems = ['Orion', 'Xlite', 'Salesforce', 'Fluir']
    if (!validSystems.includes(system)) {
      return NextResponse.json(
        { error: 'Sistema no válido. Debe ser: Orion, Xlite, Salesforce o Fluir' },
        { status: 400 }
      )
    }

    // Verificar si el ticket ya existe
    const existingTicket = await prisma.incident.findUnique({
      where: {
        ticketNumber: ticketNumber
      }
    });

    if (existingTicket) {
      return NextResponse.json(
        { error: 'El número de ticket ya existe' },
        { status: 400 }
      );
    }

    // Crear el incidente
    const incident = await prisma.incident.create({
      data: {
        system,
        startTime: new Date(startTime),
        ticketNumber,
        description: description || null,
        status: 'active'
      },
    })

    return NextResponse.json(incident)
  } catch (error) {
    console.error('Error al crear incidencia:', error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'El número de ticket ya existe' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const incidents = await prisma.incident.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100  // Limitar a los últimos 100 registros
    })
    return NextResponse.json(incidents)
  } catch (error) {
    console.error('Error al obtener incidencias:', error)
    return NextResponse.json(
      { error: 'Error al obtener incidencias' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
    try {
      const user = await authenticateRequest()
      if (!user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
      }
  
      if (user.role !== 'team_leader' && user.role !== 'manager') {
        return NextResponse.json(
          { error: 'No tiene permisos para realizar esta acción' },
          { status: 403 }
        )
      }
  
      const body = await request.json()
      const { id, system, startTime, ticketNumber, description } = body
  
      if (!id) {
        return NextResponse.json({ error: 'ID de incidente requerido' }, { status: 400 })
      }
  
      // Verificar si el ticket existe (excluyendo el actual)
      const existingTicket = await prisma.incident.findFirst({
        where: {
          ticketNumber: ticketNumber,
          NOT: {
            id: id
          }
        }
      });
  
      if (existingTicket) {
        return NextResponse.json(
          { error: 'El número de ticket ya existe' },
          { status: 400 }
        );
      }
  
      const updatedIncident = await prisma.incident.update({
        where: { id: id },
        data: {
          system,
          startTime: new Date(startTime),
          ticketNumber,
          description: description || null,
        },
      })
  
      return NextResponse.json(updatedIncident)
    } catch (error) {
      console.error('Error al actualizar incidencia:', error)
      return NextResponse.json(
        { error: 'Error al actualizar la incidencia' },
        { status: 500 }
      )
    }
  }
  
  // Agregar endpoint DELETE para eliminar
  export async function DELETE(request: Request) {
    try {
      const user = await authenticateRequest()
      if (!user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
      }
  
      if (user.role !== 'team_leader' && user.role !== 'manager') {
        return NextResponse.json(
          { error: 'No tiene permisos para realizar esta acción' },
          { status: 403 }
        )
      }
  
      const { searchParams } = new URL(request.url)
      const id = searchParams.get('id')
  
      if (!id) {
        return NextResponse.json({ error: 'ID de incidente requerido' }, { status: 400 })
      }
  
      await prisma.incident.delete({
        where: { id: parseInt(id) },
      })
  
      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Error al eliminar incidencia:', error)
      return NextResponse.json(
        { error: 'Error al eliminar la incidencia' },
        { status: 500 }
      )
    }
  }