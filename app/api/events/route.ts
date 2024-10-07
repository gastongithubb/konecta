// app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { message: 'Error fetching events', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, start, end, creatorId } = await request.json();
    const newEvent = await prisma.event.create({
      data: {
        title,
        start,
        end,
        creator: {
          connect: { id: creatorId },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { message: 'Error creating event', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}