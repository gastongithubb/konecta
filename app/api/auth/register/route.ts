/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  const { name, email, password, role } = await request.json()

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'El correo electrónico ya está registrado' }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: { 
        name, 
        email, 
        password: hashedPassword, 
        role: role || 'user'
      }
    })

    // Usamos la sintaxis de rest para omitir la contraseña
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error('Error al registrar usuario:', error)
    return NextResponse.json({ error: 'Error al registrar usuario' }, { status: 500 })
  }
}