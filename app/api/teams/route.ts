import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const teams = await prisma.team.findMany()
  return NextResponse.json(teams)
}

export async function POST(request: Request) {
  const { name, managerId, teamLeaderId } = await request.json()

  const team = await prisma.team.create({
    data: { name, managerId, teamLeaderId }
  })

  return NextResponse.json(team, { status: 201 })
}