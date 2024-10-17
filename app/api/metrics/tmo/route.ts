// app/api/metrics/tmo/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const metrics = await prisma.tMOMetrics.findMany({
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(metrics)
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener métricas TMO', error }, { status: 500 })
  }
}