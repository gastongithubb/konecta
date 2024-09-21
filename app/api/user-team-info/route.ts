// app/api/user-team-info/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateRequest } from '@/app/lib/auth.server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const user = await authenticateRequest();
    if (!user) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const userWithTeam = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        team: {
          include: {
            teamLeader: true
          }
        }
      }
    });

    if (!userWithTeam) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      name: userWithTeam.name,
      team: userWithTeam.team ? {
        name: userWithTeam.team.name,
        teamLeader: userWithTeam.team.teamLeader.name
      } : null
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}