import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email.endsWith('@sancor.konecta.ar')) {
    return NextResponse.json({ error: 'Dominio de correo no válido' }, { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { email: true }
    })

    return NextResponse.json({ exists: !!user })
  } catch (error) {
    console.error('Error checking email:', error)
    return NextResponse.json({ error: 'Error checking email' }, { status: 500 })
  }
}