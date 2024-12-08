// /app/api/metrics/trimestral/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { z } from 'zod';

const TrimestralMetricSchema = z.object({
  name: z.string(),
  month: z.string(),
  qResp: z.number(),
  nps: z.number(),
  sat: z.number(),
  rd: z.number(),
  teamLeaderId: z.number(),
  teamId: z.number(),
});

const TrimestralMetricsArraySchema = z.array(TrimestralMetricSchema);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = TrimestralMetricsArraySchema.parse(body);

    const createdMetrics = await prisma.$transaction(
      validatedData.map((metric) =>
        prisma.trimestralMetrics.create({
          data: metric,
        })
      )
    );

    return NextResponse.json(createdMetrics, { status: 201 });
  } catch (error) {
    console.error('Error creating trimestral metrics:', error);
    return NextResponse.json(
      { error: 'Error creating trimestral metrics' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const teamLeaderId = searchParams.get('teamLeaderId');

    const metrics = await prisma.trimestralMetrics.findMany({
      where: {
        ...(teamId && { teamId: parseInt(teamId) }),
        ...(teamLeaderId && { teamLeaderId: parseInt(teamLeaderId) }),
      },
      orderBy: {
        month: 'desc',
      },
    });

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching trimestral metrics:', error);
    return NextResponse.json(
      { error: 'Error fetching trimestral metrics' },
      { status: 500 }
    );
  }
}