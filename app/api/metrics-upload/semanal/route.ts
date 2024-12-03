// app/api/metrics-upload/semanal/route.ts
import { NextRequest } from 'next/server';
import { handleMetricUpload } from '../base';
import prisma from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  return handleMetricUpload(
    request,
    (data, userId, teamId) => {
      const weeks = ['Semana Vernes 09', 'Data Viernes 16', 'Data Viernes 20', 'Data Viernes 30'];
      return data.flatMap(row => 
        weeks.map(week => ({
          name: row['EQUIPO'] || '',
          week,
          q: parseInt(row[`${week}.Q`] || '0'),
          nps: parseInt(row[`${week}.NPS`] || '0'),
          csat: parseFloat(row[`${week}.CSAT`]?.replace('%', '') || '0') / 100,
          teamLeaderId: userId,
          teamId
        }))
      ).filter(item => item.name);
    },
    prisma.semanalMetrics
  );
}