// app/api/metrics-upload/tmo/route.ts
import { NextRequest } from 'next/server';
import { handleMetricUpload } from '../base';
import prisma from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  return handleMetricUpload(
    request,
    (data, userId, teamId) => data.map(row => ({
      name: row['TMO AL 30']?.replace('KN - ', '') || '',
      qLlAtendidas: parseInt(row['Q Ll atendidas'] || '0'),
      tiempoACD: row['Tiempo ACD'] || '',
      acw: row['ACW'] || '',
      hold: row['HOLD'] || '',
      ring: row['RING'] || '',
      tmo: row['TMO'] || '',
      teamLeaderId: userId,
      teamId
    })).filter(item => item.name),
    prisma.tMOMetrics
  );
}