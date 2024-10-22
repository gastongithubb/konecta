// app/api/survey/word-cloud/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';
import { processText } from '../process-words/route';
import { SurveyStats } from '@/types/survey';

export async function GET() {
  noStore();
  try {
    const surveys = await prisma.survey.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    // Procesar la nube de palabras
    const allFeedback = surveys
      .map(s => s.feedback)
      .filter(Boolean)
      .join(' ');
    
    const wordCount = processText(allFeedback);
    const wordCloudData = Array.from(wordCount.entries())
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 50);

    // Calcular estadísticas
    const stats = await prisma.$queryRaw<SurveyStats[]>`
      SELECT 
        ROUND(AVG(CAST("moodRating" AS FLOAT)), 2) as average_mood,
        ROUND(AVG(CAST("workEnvironment" AS FLOAT)), 2) as average_work_environment,
        ROUND(AVG(CAST("personalWellbeing" AS FLOAT)), 2) as average_wellbeing,
        ROUND(AVG(CAST("workLifeBalance" AS FLOAT)), 2) as average_balance,
        ROUND(AVG(CAST("stressLevel" AS FLOAT)), 2) as average_stress,
        COUNT(*) as total_surveys,
        ROUND(
          COUNT(CASE 
            WHEN "moodRating" >= 4 AND 
                 "workEnvironment" >= 4 AND 
                 "personalWellbeing" >= 4 AND 
                 "workLifeBalance" >= 4 AND 
                 "stressLevel" <= 2
            THEN 1 
          END)::FLOAT / COUNT(*)::FLOAT * 100,
          2
        ) as wellbeing_rate
      FROM "Survey"
    `;

    // Preparar datos para el gráfico
    const chartData = surveys.map(survey => ({
      date: survey.createdAt.toISOString().split('T')[0],
      moodRating: survey.moodRating,
      workEnvironment: survey.workEnvironment,
      personalWellbeing: survey.personalWellbeing,
      workLifeBalance: survey.workLifeBalance,
      stressLevel: survey.stressLevel
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats: stats[0],
        wordCloud: wordCloudData,
        chartData
      }
    });

  } catch (error) {
    console.error('Error al obtener datos:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener datos' },
      { status: 500 }
    );
  }
}