import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  const { email } = await request.json()

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { email: true }
    })

    if (user) {
      return NextResponse.json({ exists: true })
    } else {
      return NextResponse.json({ exists: false })
    }
  } catch (error) {
    console.error('Error checking email:', error)
    return NextResponse.json({ error: 'Error checking email' }, { status: 500 })
  }
}