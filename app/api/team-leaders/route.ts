import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { verifyAccessToken, hashPassword } from '@/app/lib/auth.server';
import { sendWelcomeEmail } from '@/app/lib/email';

const prisma = new PrismaClient();

const TeamLeaderSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Dirección de correo electrónico inválida"),
  role: z.literal('team_leader'),
});

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

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
  console.log('Recibida solicitud POST a /api/team-leaders');
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    console.log('Auth Token from cookie:', token);

    if (!token) {
      console.log('No se proporcionó token');
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decodedToken = await verifyAccessToken(token);
    console.log('Decoded Token:', decodedToken);

    if (!decodedToken) {
      console.log('Token inválido');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (decodedToken.role !== 'manager') {
      console.log('Rol incorrecto:', decodedToken.role);
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    console.log('Received body:', body);

    const validatedData = TeamLeaderSchema.parse(body);
    console.log('Validated data:', validatedData);

    const password = generateSecurePassword();
    const hashedPassword = await hashPassword(password);

    console.log('Intentando crear nuevo usuario en la base de datos');
    const newTeamLeader = await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword,
      },
      select: { id: true, name: true, email: true },
    });
    console.log('Nuevo líder de equipo creado:', newTeamLeader);

    console.log('Intentando enviar email de bienvenida');
    await sendWelcomeEmail(newTeamLeader.email, newTeamLeader.name, password);
    console.log('Email de bienvenida enviado');

    return NextResponse.json(newTeamLeader, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/team-leaders:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function generateSecurePassword(length: number = 16): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}