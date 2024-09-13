import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '@/app/lib/auth.server'
import { sendWelcomeEmail } from '@/app/lib/email' // Asegúrate de tener esta función implementada

const prisma = new PrismaClient()

export async function POST(request: Request) {
  const { name, email, password, role } = await request.json()

  if (!email.endsWith('@sancor.konecta.ar')) {
    return NextResponse.json({ error: 'Dominio de correo no válido' }, { status: 400 })
  }

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

    // Enviar email de bienvenida
    await sendWelcomeEmail(email, name, password)

    // Usamos la sintaxis de rest para omitir la contraseña
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error('Error al registrar usuario:', error)
    return NextResponse.json({ error: 'Error al registrar usuario' }, { status: 500 })
  }
}