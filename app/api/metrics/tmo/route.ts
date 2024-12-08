// En la API (app/api/metrics/tmo/route.ts)
import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { z } from 'zod';

function timeToSeconds(timeStr: string): number {
  if (!timeStr || timeStr === '0:00:00') return 0;
  
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  return (hours * 3600) + (minutes * 60) + seconds;
}

const TMOMetricSchema = z.object({
  name: z.string(),
  qLlAtendidas: z.number().int().nullable(),
  tiempoACD: z.string()
    .transform((val) => timeToSeconds(val)),
  acw: z.string()
    .transform((val) => timeToSeconds(val)),
  hold: z.string()
    .transform((val) => timeToSeconds(val)),
  ring: z.string()
    .transform((val) => timeToSeconds(val)),
  tmo: z.string()
    .transform((val) => timeToSeconds(val)),
  teamLeaderId: z.number().int(),
  teamId: z.number().int()
});

const TMOMetricsArraySchema = z.array(TMOMetricSchema);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    console.log('Received data:', JSON.stringify(body[0], null, 2));

    if (!body?.[0]?.teamId || !body?.[0]?.teamLeaderId) {
      return NextResponse.json(
        { error: 'Missing required fields: teamId or teamLeaderId' },
        { status: 400 }
      );
    }

    const validatedData = TMOMetricsArraySchema.parse(body);

    const createdMetrics = await prisma.$transaction(
      validatedData.map((metric) => 
        prisma.tMOMetrics.create({
          data: {
            name: metric.name,
            qLlAtendidas: metric.qLlAtendidas,
            tiempoACD: metric.tiempoACD,
            acw: metric.acw,
            hold: metric.hold,
            ring: metric.ring,
            tmo: metric.tmo,
            teamLeaderId: metric.teamLeaderId,
            teamId: metric.teamId
          }
        })
      )
    );

    return NextResponse.json(createdMetrics, { status: 201 });
  } catch (error) {
    console.error('Error details:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error',
          details: error.errors.map(e => ({
            path: e.path,
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error creating TMO metrics' },
      { status: 500 }
    );
  }
}
