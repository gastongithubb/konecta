import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifyAccessToken } from '@/app/lib/auth.server';
import { z } from 'zod';

const allowedOrigins = [
  'http://localhost:3000',
  'https://sancor-konectagroup.vercel.app'
];

const corsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
});

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  return NextResponse.json({}, { headers: corsHeaders(origin) });
}

const TokenSchema = z.object({
  token: z.string()
});

export async function POST(request: Request) {
  const origin = request.headers.get('origin');

  try {
    const body = await request.json();
    const { token } = TokenSchema.parse(body);

    const payload = await verifyAccessToken(token);
    if (!payload || !payload.sub) {
      return NextResponse.json({
        valid: false,
        error: 'Token inválido o expirado'
      }, { headers: corsHeaders(origin) });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(payload.sub) },
      select: {
        id: true,
        resetToken: true,
        resetTokenExpiry: true,
        resetTokenAttempts: true
      }
    });

    if (!user) {
      return NextResponse.json({
        valid: false,
        error: 'Usuario no encontrado'
      }, { headers: corsHeaders(origin) });
    }

    if (!user.resetToken || !user.resetTokenExpiry) {
      return NextResponse.json({
        valid: false,
        error: 'No hay una solicitud de restablecimiento de contraseña activa'
      }, { headers: corsHeaders(origin) });
    }

    if (user.resetTokenExpiry < new Date()) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: null,
          resetTokenExpiry: null,
          resetTokenAttempts: 0
        }
      });
      return NextResponse.json({
        valid: false,
        error: 'El enlace ha expirado. Por favor, solicite uno nuevo.'
      }, { headers: corsHeaders(origin) });
    }

    if (user.resetTokenAttempts >= 3) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: null,
          resetTokenExpiry: null,
          resetTokenAttempts: 0
        }
      });
      return NextResponse.json({
        valid: false,
        error: 'Demasiados intentos. Por favor, solicite un nuevo enlace de recuperación'
      }, { headers: corsHeaders(origin) });
    }

    return NextResponse.json({ valid: true }, { headers: corsHeaders(origin) });
  } catch (error) {
    console.error('Error al verificar token:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        valid: false,
        error: 'Token inválido'
      }, { headers: corsHeaders(origin) });
    }

    return NextResponse.json({
      valid: false,
      error: 'Error al verificar el token'
    }, { headers: corsHeaders(origin) });
  } finally {
    await prisma.$disconnect();
  }
}