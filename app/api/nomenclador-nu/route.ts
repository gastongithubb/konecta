// app/api/nomenclador-nu/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  try {
    const practices = await prisma.nomencladorNU.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        {
          codigo: 'asc'
        },
        {
          nucodigo: 'asc'
        }
      ]
    })
    return NextResponse.json(practices)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener las prácticas' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Verificar si ya existe una práctica con la misma combinación de códigos
    const existingPractice = await prisma.nomencladorNU.findFirst({
      where: {
        codigo: body.codigo,
        nucodigo: body.nucodigo,
      },
    })

    if (existingPractice) {
      return NextResponse.json(
        { message: 'Ya existe una práctica con esta combinación de códigos' },
        { status: 400 }
      )
    }

    const practice = await prisma.nomencladorNU.create({
      data: {
        codigo: body.codigo,
        nucodigo: body.nucodigo,
        descripcion: body.descripcion,
        comoPedirse: body.comoPedirse || '',
        observaciones: body.observaciones || '',
        isActive: true,
      }
    })
    return NextResponse.json(practice)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear la práctica' },
      { status: 500 }
    )
  }
}