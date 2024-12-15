import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { createAccessToken } from '@/app/lib/auth.server';
import { sendPasswordResetEmail } from '@/app/lib/forgot-password';
import { z } from 'zod';
import crypto from 'crypto';
import { UserRole } from '@/types/auth';

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

const validDomains = ['@sancor.konecta.ar', '@konecta-group.com'];

const EmailSchema = z.object({
  email: z.string()
    .email('Formato de correo electrónico inválido')
    .refine(
      email => validDomains.some(domain => email.endsWith(domain)),
      {
        message: 'El correo electrónico debe ser de @sancor.konecta.ar o @konecta-group.com'
      }
    )
});

function isValidUserRole(role: string): role is UserRole {
  return ['user', 'manager', 'team_leader', 'agent', 'leader'].includes(role as UserRole);
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  
  try {
    const body = await request.json();
    const { email } = EmailSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isPasswordChanged: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No existe una cuenta con este correo electrónico' },
        { status: 404, headers: corsHeaders(origin) }
      );
    }

    if (!isValidUserRole(user.role)) {
      return NextResponse.json(
        { error: 'Role de usuario inválido' },
        { status: 400, headers: corsHeaders(origin) }
      );
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry: new Date(Date.now() + 30 * 60 * 1000),
        resetTokenAttempts: 0
      }
    });

    const verificationToken = await createAccessToken({
      sub: user.id.toString(),
      email: user.email,
      role: user.role,
      isPasswordChanged: user.isPasswordChanged
    }, '30m');

    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://sancor-konectagroup.vercel.app'
      : 'http://localhost:3000';

    const resetLink = `${baseUrl}/reset-password?token=${verificationToken}`;
    
    await sendPasswordResetEmail(user.email, user.name, resetLink);

    return NextResponse.json(
      {
        success: true,
        message: 'Se ha enviado un enlace de recuperación a su correo electrónico'
      },
      { headers: corsHeaders(origin) }
    );
  } catch (error) {
    console.error('Error en solicitud de restablecimiento:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400, headers: corsHeaders(origin) }
      );
    }

    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500, headers: corsHeaders(origin) }
    );
  }
}