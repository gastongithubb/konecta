import { PrismaClient } from '@prisma/client'
import { compare, hash } from 'bcryptjs'
import { sign, verify, JwtPayload } from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function verifyPassword(plainPassword: string, hashedPassword: string) {
  return await compare(plainPassword, hashedPassword)
}

export async function hashPassword(password: string) {
  return await hash(password, 10)
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !(await verifyPassword(password, user.password))) {
    return null
  }
  return user
}

interface TokenData extends JwtPayload {
  sub: string;
}

export function createAccessToken(data: TokenData, expiresIn: string = '15m') {
  return sign(data, process.env.SECRET_KEY!, { expiresIn })
}

export function verifyAccessToken(token: string): TokenData | null {
  try {
    return verify(token, process.env.SECRET_KEY!) as TokenData
  } catch {
    return null
  }
}

// New function to get user data
export async function getUserData(userId: string) {
  if (!userId) {
    throw new Error('User ID is required')
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId, 10) }, // Convert string to number
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        // Add any other fields you want to include
      },
    })
    if (!user) {
      throw new Error('User not found')
    }
    return user
  } catch (error) {
    console.error('Error fetching user data:', error)
    throw error // Re-throw the error to be handled by the caller
  }
}