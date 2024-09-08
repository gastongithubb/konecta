import { PrismaClient } from '@prisma/client'
import { compare, hash } from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'

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
  return { id: user.id, email: user.email, role: user.role, isPasswordChanged: user.isPasswordChanged }
}

export async function createAccessToken(data: { sub: string; role: string; isPasswordChanged: boolean }, expiresIn: string = '15m') {
  const secret = new TextEncoder().encode(process.env.SECRET_KEY!)
  return await new SignJWT(data)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresIn)
    .sign(secret)
}

export async function verifyAccessToken(token: string): Promise<{ sub: string; role: string; isPasswordChanged: boolean } | null> {
  try {
    const secret = new TextEncoder().encode(process.env.SECRET_KEY!)
    const { payload } = await jwtVerify(token, secret)
    return payload as { sub: string; role: string; isPasswordChanged: boolean }
  } catch (error) {
    console.error('Error verifying token:', error)
    return null
  }
}

export async function getUserData(userId: string) {
  if (!userId) {
    throw new Error('User ID is required')
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId, 10) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isPasswordChanged: true,
        teamId: true,
      },
    })
    if (!user) {
      throw new Error('User not found')
    }
    return user
  } catch (error) {
    console.error('Error fetching user data:', error)
    throw error
  }
}