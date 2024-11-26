import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

/**
 * Genera un token de acceso JWT
 */
export async function generateAccessToken(payload: TokenPayload): Promise<string> {
  const secret = process.env.SECRET_KEY;
  if (!secret) {
    throw new Error('SECRET_KEY no está configurado en las variables de entorno');
  }

  return jwt.sign(payload, secret, {
    expiresIn: '9h' // El token expira en 9 horas
  });
}

/**
 * Genera un token de actualización (refresh token)
 */
export async function generateRefreshToken(userId: string): Promise<string> {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) {
    throw new Error('REFRESH_TOKEN_SECRET no está configurado en las variables de entorno');
  }

  return jwt.sign({ userId }, secret, {
    expiresIn: '7d' // El refresh token expira en 7 días
  });
}

/**
 * Verifica un token JWT
 */
export function verifyToken(token: string): TokenPayload {
  const secret = process.env.SECRET_KEY;
  if (!secret) {
    throw new Error('SECRET_KEY no está configurado en las variables de entorno');
  }

  try {
    return jwt.verify(token, secret) as TokenPayload;
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
}

/**
 * Verifica un refresh token
 */
export function verifyRefreshToken(token: string): { userId: string } {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) {
    throw new Error('REFRESH_TOKEN_SECRET no está configurado en las variables de entorno');
  }

  try {
    return jwt.verify(token, secret) as { userId: string };
  } catch (error) {
    throw new Error('Refresh token inválido o expirado');
  }
}

/**
 * Extrae el token del header de autorización
 */
export function extractTokenFromHeader(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
}