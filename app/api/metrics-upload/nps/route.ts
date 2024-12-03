// app/api/metrics-upload/nps/route.ts
import { NextRequest } from 'next/server';
import { handleMetricUpload } from '../base';
import prisma from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  return handleMetricUpload(
    request,
    (data, userId, teamId) => data.map(row => ({
      date: new Date(row.date),
      nsp: parseInt(row.nsp || '0'),
      q: parseInt(row.q || '0'),
      nps: parseInt(row.nps || '0'),
      csat: parseFloat(row.csat || '0'),
      ces: parseFloat(row.ces || '0'),
      rd: parseFloat(row.rd || '0'),
      teamLeaderId: userId,
      teamId,
      userId
    })).filter(item => !isNaN(item.date.getTime())),
    prisma.dailyMetrics
  );
}