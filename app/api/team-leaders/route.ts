// app/api/team-leaders/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { verifyAccessToken } from '@/lib/auth';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

const TeamLeaderSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Dirección de correo electrónico inválida"),
  role: z.literal('team_leader'),
});

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyAccessToken(token);
    if (!decoded || decoded.role !== 'manager') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const teamLeaders = await prisma.user.findMany({
      where: { role: 'team_leader' },
      select: { id: true, name: true, email: true },
    });
    return NextResponse.json(teamLeaders);
  } catch (error) {
    console.error('Error fetching team leaders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyAccessToken(token);
    if (!decoded || decoded.role !== 'manager') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = TeamLeaderSchema.parse(body);

    // Generate a secure random password
    const password = generateSecurePassword();
    const hashedPassword = await bcrypt.hash(password, 12);

    const newTeamLeader = await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword,
      },
      select: { id: true, name: true, email: true },
    });

    // Send welcome email to the new team leader
    await sendWelcomeEmail(newTeamLeader.email, newTeamLeader.name, password);

    return NextResponse.json(newTeamLeader, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error creating team leader:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function generateSecurePassword(length: number = 16): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function sendWelcomeEmail(email: string, name: string, password: string) {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  
    const info = await transporter.sendMail({
      from: '"Konecta" <gaston.alvarez@sancor.konecta.ar>',
      to: email,
      subject: "Bienvenido a Konecta - Detalles de tu cuenta",
      text: `Hola ${name},
  
  ¡Bienvenido\a a Konecta! Tu cuenta en la web ha sido creada exitosamente.
  
  Aquí están los detalles de tu cuenta:
  Correo electrónico: ${email}
  Contraseña temporal: ${password}
  
  Por razones de seguridad, por favor cambia tu contraseña después de tu primer inicio de sesión.
  
  Si tienes alguna pregunta, no dudes en contactar a nuestro equipo de soporte.
  
  Saludos cordiales,
  El equipo de Konecta`,
      html: `<h1>¡Bienvenido a Konecta, ${name}!</h1>
  <p>Tu cuenta ha sido creada exitosamente.</p>
  <h2>Detalles de tu cuenta:</h2>
  <ul>
    <li><strong>Correo electrónico:</strong> ${email}</li>
    <li><strong>Contraseña temporal:</strong> ${password}</li>
  </ul>
  <p><strong>Por razones de seguridad, por favor cambia tu contraseña después de tu primer inicio de sesión.</strong></p>
  <p>Si tienes alguna pregunta, no dudes en contactar a nuestro equipo de soporte.</p>
  <p>Saludos cordiales,<br>El equipo de Konecta</p>`,
    });
  
    console.log("Mensaje enviado: %s", info.messageId);
  }