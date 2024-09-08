// app/api/team-leaders/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { verifyAccessToken, hashPassword } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';  // Asumiendo que has movido la función sendWelcomeEmail a un archivo separado

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
  console.log('Recibida solicitud POST a /api/team-leaders');
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      console.log('No se proporcionó encabezado de autorización');
      return NextResponse.json({ error: 'Unauthorized - No authorization header' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('No se proporcionó token');
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    const decodedToken = await verifyAccessToken(token);
    if (!decodedToken) {
      console.log('Token inválido');
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    if (decodedToken.role !== 'manager') {
      console.log('Rol incorrecto');
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = TeamLeaderSchema.parse(body);

    // Generate a secure random password
    const password = generateSecurePassword();
    const hashedPassword = await hashPassword(password);

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
    console.error('Error en POST /api/team-leaders:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function generateSecurePassword(length: number = 16): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}