import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { verifyAccessToken } from '@/lib/auth';

const prisma = new PrismaClient();

const UpdateTeamLeaderSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
});

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyAccessToken(token);
    if (!decoded || (decoded.role !== 'manager' && decoded.sub !== params.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const teamLeader = await prisma.user.findUnique({
      where: { id: parseInt(params.id) },
      select: { id: true, name: true, email: true },
    });

    if (!teamLeader) {
      return NextResponse.json({ error: 'Team Leader not found' }, { status: 404 });
    }

    return NextResponse.json(teamLeader);
  } catch (error) {
    console.error('Error fetching team leader:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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
    const validatedData = UpdateTeamLeaderSchema.parse(body);

    const updatedTeamLeader = await prisma.user.update({
      where: { id: parseInt(params.id) },
      data: validatedData,
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json(updatedTeamLeader);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error updating team leader:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyAccessToken(token);
    if (!decoded || decoded.role !== 'manager') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.user.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ message: 'Team Leader deleted successfully' });
  } catch (error) {
    console.error('Error deleting team leader:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}