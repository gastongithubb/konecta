import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import { verifyAccessToken } from '@/app/lib/auth';

const prisma = new PrismaClient();

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('Recibida solicitud DELETE a /api/team-leaders/', params.id);
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

    await prisma.user.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ message: 'Team leader deleted successfully' });
  } catch (error) {
    console.error('Error en DELETE /api/team-leaders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}