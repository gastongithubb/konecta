// app/api/nomenclador-nm/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  try {
    const practices = await prisma.nomencladorNM.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        codigo: 'asc'
      }
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
    const practice = await prisma.nomencladorNM.create({
      data: {
        codigo: body.codigo,
        descripcion: body.descripcion,
        comoPedirse: body.comoPedirse || '',
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