import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const team = await prisma.team.findUnique({
    where: { id: parseInt(params.id) }
  })

  if (!team) {
    return NextResponse.json({ error: 'Team not found' }, { status: 404 })
  }

  return NextResponse.json(team)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { name, managerId, teamLeaderId } = await request.json()

  const team = await prisma.team.update({
    where: { id: parseInt(params.id) },
    data: { name, managerId, teamLeaderId }
  })

  return NextResponse.json(team)
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await prisma.team.delete({
    where: { id: parseInt(params.id) }
  })

  return NextResponse.json({ message: 'Team deleted' })
}