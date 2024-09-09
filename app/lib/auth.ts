import { compare, hash } from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'

export async function verifyPassword(plainPassword: string, hashedPassword: string) {
  return await compare(plainPassword, hashedPassword)
}

export async function hashPassword(password: string) {
  return await hash(password, 10)
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