// /app/api/metrics/daily/route.ts
import { NextResponse } from 'next/server';
import  prisma  from '@/app/lib/prisma';
import { z } from 'zod';

const DailyMetricSchema = z.object({
  date: z.string().transform((str) => new Date(str)),
  name: z.string(),
  q: z.number(),
  nps: z.number(),
  csat: z.number(),
  ces: z.number(),
  rd: z.number(),
  userId: z.number(),
  teamId: z.number(),
});

const DailyMetricsArraySchema = z.array(DailyMetricSchema);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = DailyMetricsArraySchema.parse(body);

    const createdMetrics = await prisma.$transaction(
      validatedData.map((metric) =>
        prisma.dailyMetrics.create({
          data: metric,
        })
      )
    );

    return NextResponse.json(createdMetrics, { status: 201 });
  } catch (error) {
    console.error('Error creating daily metrics:', error);
    return NextResponse.json(
      { error: 'Error creating daily metrics' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const userId = searchParams.get('userId');

    const metrics = await prisma.dailyMetrics.findMany({
      where: {
        ...(teamId && { teamId: parseInt(teamId) }),
        ...(userId && { userId: parseInt(userId) }),
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching daily metrics:', error);
    return NextResponse.json(
      { error: 'Error fetching daily metrics' },
      { status: 500 }
    );
  }
}