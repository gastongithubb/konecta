import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  const { email, name, password, role } = await request.json()

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
  }

  const hashedPassword = await hashPassword(password)
  const user = await prisma.user.create({
    data: { email, name, password: hashedPassword, role }
  })

  return NextResponse.json(user, { status: 201 })
}

export async function GET() {
  const users = await prisma.user.findMany()
  return NextResponse.json(users)
}