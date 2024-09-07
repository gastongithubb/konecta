import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  console.log('API route hit:', request.method, request.url);
  
  try {
    const body = await request.json()
    console.log('Received POST request with body:', body);
    
    const { name, email, password, role } = body

    const hashedPassword = bcrypt.hashSync(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    })

    console.log('User created successfully:', user.id);
    return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 400 })
  }
}