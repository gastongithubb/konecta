// app/api/metrics-upload/trimestral/route.ts
import { NextRequest } from 'next/server';
import { handleMetricUpload } from '../base';
import prisma from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  return handleMetricUpload(
    request,
    (data, userId, teamId) => data.map(row => ({
      name: row['Nombre'] || '',
      month: row['Mes'] || 'septiembre',
      qResp: parseInt(row['Q de resp'] || '0'),
      nps: parseInt(row['NPS'] || '0'),
      sat: parseFloat(row['SAT']?.replace('%', '') || '0') / 100,
      rd: parseFloat(row['RD']?.replace('%', '') || '0') / 100,
      teamLeaderId: userId,
      teamId
    })).filter(item => item.name),
    prisma.trimestralMetrics
  );
}