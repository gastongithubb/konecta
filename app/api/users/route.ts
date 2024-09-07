import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API route hit:', req.method, req.url);
  
  if (req.method === 'POST') {
    console.log('Received POST request with body:', req.body);
    
    const { name, email, password, role } = req.body

    const hashedPassword = bcrypt.hashSync(password, 10)

    try {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
        },
      })

      console.log('User created successfully:', user.id);
      res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role })
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(400).json({ error: 'Failed to create user' })
    }
  } else {
    console.log('Method not allowed:', req.method);
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}