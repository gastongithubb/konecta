// app/api/metrics/semanal/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const metrics = await prisma.semanalMetrics.findMany({
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(metrics)
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener métricas semanales', error }, { status: 500 })
  }
}