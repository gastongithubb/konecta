import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifyAccessToken } from '@/app/lib/auth.server';
import { z } from 'zod';

const TokenSchema = z.object({
  token: z.string()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = TokenSchema.parse(body);

    // Verificar el token de acceso
    const payload = await verifyAccessToken(token);
    if (!payload || !payload.sub) {
      return NextResponse.json({
        valid: false,
        error: 'Token inválido o expirado'
      });
    }

    // Buscar usuario y verificar token
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
      });
    }

    if (!user.resetToken || !user.resetTokenExpiry) {
      return NextResponse.json({
        valid: false,
        error: 'No hay una solicitud de restablecimiento de contraseña activa'
      });
    }

    // Verificar expiración del token
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
      });
    }

    // Verificar intentos
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
      });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Error al verificar token:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        valid: false,
        error: 'Token inválido'
      });
    }

    return NextResponse.json({
      valid: false,
      error: 'Error al verificar el token'
    });
  } finally {
    await prisma.$disconnect();
  }
}