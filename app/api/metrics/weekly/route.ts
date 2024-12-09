// /app/api/metrics/weekly/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { z } from 'zod';

const WeeklyMetricSchema = z.object({
  name: z.string(),
  week: z.string(),
  q: z.number(),
  nps: z.number(),
  csat: z.number(),
  teamLeaderId: z.number(),
  teamId: z.number(),
});

const WeeklyMetricsArraySchema = z.array(WeeklyMetricSchema);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = WeeklyMetricsArraySchema.parse(body);

    const createdMetrics = await prisma.$transaction(
      validatedData.map((metric) =>
        prisma.semanalMetrics.create({
          data: metric,
        })
      )
    );

    return NextResponse.json(createdMetrics, { status: 201 });
  } catch (error) {
    console.error('Error creating weekly metrics:', error);
    return NextResponse.json(
      { error: 'Error creating weekly metrics' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const teamLeaderId = searchParams.get('teamLeaderId');

    const metrics = await prisma.semanalMetrics.findMany({
      where: {
        ...(teamId && { teamId: parseInt(teamId) }),
        ...(teamLeaderId && { teamLeaderId: parseInt(teamLeaderId) }),
      },
      orderBy: {
        week: 'desc',
      },
    });

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching weekly metrics:', error);
    return NextResponse.json(
      { error: 'Error fetching weekly metrics' },
      { status: 500 }
    );
  }
}