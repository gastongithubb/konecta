// app/api/auth/check-email/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'  // Update the import path based on your project structure

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    if (!email.endsWith('@sancor.konecta.ar')) {
      return NextResponse.json(
        { error: 'Dominio de correo no válido' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { email: true }
    })

    return NextResponse.json({ exists: !!user })
  } catch (error) {
    console.error('Error checking email:', error)
    return NextResponse.json(
      { error: 'Error checking email' },
      { status: 500 }
    )
  } finally {
    // Optional: Disconnect from the database after the request
    // await prisma.$disconnect()
  }
}