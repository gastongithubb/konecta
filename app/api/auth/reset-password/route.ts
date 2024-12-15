import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifyAccessToken, hashPassword } from '@/app/lib/auth.server';
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

const ResetPasswordSchema = z.object({
  token: z.string(),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
});

export async function POST(request: Request) {
  const origin = request.headers.get('origin');

  try {
    const body = await request.json();
    const { token, password } = ResetPasswordSchema.parse(body);

    const payload = await verifyAccessToken(token);
    if (!payload || !payload.sub) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 400, headers: corsHeaders(origin) }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(payload.sub) },
      select: {
        id: true,
        email: true,
        resetToken: true,
        resetTokenExpiry: true,
        resetTokenAttempts: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404, headers: corsHeaders(origin) }
      );
    }

    if (!user.resetToken || !user.resetTokenExpiry) {
      return NextResponse.json(
        { error: 'No hay una solicitud de restablecimiento de contraseña activa' },
        { status: 400, headers: corsHeaders(origin) }
      );
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
      return NextResponse.json(
        { error: 'El enlace ha expirado. Por favor, solicite uno nuevo.' },
        { status: 400, headers: corsHeaders(origin) }
      );
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
      return NextResponse.json(
        { error: 'Demasiados intentos. Por favor, solicite un nuevo enlace de recuperación' },
        { status: 400, headers: corsHeaders(origin) }
      );
    }

    try {
      const hashedPassword = await hashPassword(password);
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
          resetTokenAttempts: 0,
          isPasswordChanged: true
        }
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Contraseña actualizada exitosamente'
        },
        { headers: corsHeaders(origin) }
      );
    } catch (error) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetTokenAttempts: {
            increment: 1
          }
        }
      });
      throw error;
    }
  } catch (error) {
    console.error('Error en restablecimiento de contraseña:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'La contraseña no cumple con los requisitos mínimos de seguridad',
          details: error.errors.map(e => e.message)
        },
        { status: 400, headers: corsHeaders(origin) }
      );
    }
  }
}