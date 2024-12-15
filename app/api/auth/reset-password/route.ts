// app/api/auth/reset-password/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifyAccessToken, hashPassword } from '@/app/lib/auth.server';
import { z } from 'zod';

const ResetPasswordSchema = z.object({
  token: z.string(),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = ResetPasswordSchema.parse(body);

    // Verificar el token de acceso
    const payload = await verifyAccessToken(token);
    if (!payload || !payload.sub) {
      console.error('Token inválido o sin sub:', payload);
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 400 }
      );
    }

    // Buscar usuario y verificar token
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
      console.error('Usuario no encontrado:', payload.sub);
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (!user.resetToken || !user.resetTokenExpiry) {
      console.error('Token de reset no encontrado para usuario:', user.email);
      return NextResponse.json(
        { error: 'No hay una solicitud de restablecimiento de contraseña activa' },
        { status: 400 }
      );
    }

    // Verificar expiración del token
    if (user.resetTokenExpiry < new Date()) {
      console.error('Token expirado para usuario:', user.email);
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
        { status: 400 }
      );
    }

    // Verificar intentos
    if (user.resetTokenAttempts >= 3) {
      console.error('Máximo de intentos alcanzado para usuario:', user.email);
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
        { status: 400 }
      );
    }

    try {
      // Hashear y actualizar contraseña
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

      console.log('Contraseña actualizada exitosamente para:', user.email);
      return NextResponse.json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      // Incrementar contador de intentos
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
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al restablecer la contraseña. Por favor, inténtelo de nuevo.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}