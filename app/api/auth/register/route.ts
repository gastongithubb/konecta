import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@/app/lib/auth.server';
import { sendWelcomeEmail } from '@/app/lib/email';
import { generateAccessToken } from '@/app/lib/jwt';

const prisma = new PrismaClient();

interface RegistrationData {
  name: string;
  email: string;
  password: string;
  role: string;
}

export async function POST(request: Request) {
  try {
    const data: RegistrationData = await request.json();

    // Validar el dominio del correo
    if (!data.email?.endsWith('@sancor.konecta.ar')) {
      return NextResponse.json(
        { error: 'Dominio de correo no válido' },
        { status: 400 }
      );
    }

    // Verificar usuario existente
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'El correo electrónico ya está registrado' },
        { status: 400 }
      );
    }

    // Hash de la contraseña
    const hashedPassword = await hashPassword(data.password);
    
    // Crear usuario con una transacción para asegurar la atomicidad
    const user = await prisma.$transaction(async (prisma) => {
      // Crear el usuario
      const newUser = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          role: data.role || 'user',
          isPasswordChanged: false
        }
      });

      // Enviar email de bienvenida
      try {
        await sendWelcomeEmail(
          data.email,
          data.name,
          data.password // Enviamos la contraseña original, no la hasheada
        );
      } catch (emailError: any) {
        console.error('Error al enviar email de bienvenida:', emailError);
        // Si el error está relacionado con la autenticación de Gmail, lo propagamos
        if (emailError.message?.includes('Failed to create access token')) {
          throw new Error('Error de autenticación al enviar el email');
        }
        // Otros errores de email no detienen el registro
      }

      return newUser;
    });

    // Generar token de acceso
    const accessToken = await generateAccessToken({
      userId: user.id.toString(),
      email: user.email,
      role: user.role
    });

    // Excluir la contraseña de la respuesta
    const { password, ...safeUserData } = user;

    return NextResponse.json({
      user: safeUserData,
      accessToken,
      message: 'Registro exitoso. Se ha enviado un correo de bienvenida.'
    }, { status: 201 });

  } catch (error) {
    console.error('Error en el registro:', error);
    
    if (error instanceof Error) {
      // Error de autenticación de Gmail
      if (error.message.includes('Error de autenticación al enviar el email')) {
        return NextResponse.json(
          { 
            error: 'Error al enviar el email de bienvenida. Por favor, contacte al administrador.' 
          },
          { status: 500 }
        );
      }
      
      // Error de email duplicado
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'El correo electrónico ya está registrado' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Error al procesar el registro' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}