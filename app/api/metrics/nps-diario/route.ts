// app/api/metrics/nps-diario/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const metrics = await prisma.dailyMetrics.findMany({
      orderBy: { date: 'asc' },
    })
    return NextResponse.json(metrics)
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener métricas NPS diarias', error }, { status: 500 })
  }
}