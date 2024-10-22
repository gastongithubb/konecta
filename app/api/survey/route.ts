// app/api/survey/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { analyzeSentiment, getWeekNumber } from './utils';

interface SurveyData {
  moodRating: number;
  workEnvironment: number;
  personalWellbeing: number;
  workLifeBalance: number;
  stressLevel: number;
  feedback: string | null;
}

interface SurveyStats {
  average_mood: number;
  average_work_environment: number;
  average_wellbeing: number;
  average_balance: number;
  average_stress: number;
  total_surveys: number;
  wellbeing_rate: number;
}

interface Survey extends SurveyData {
  id: number;
  createdAt: Date;
}

interface SurveyTrends {
  daily: Record<string, Survey[]>;
  weekly: Record<string, Survey[]>;
}

interface ProcessedTrend {
  date?: string;
  week?: string;
  average: number;
  count: number;
}

interface SentimentAnalysis {
  id: number;
  feedback: string | null;
  date: string;
  sentiment: string;
  score: number;
  details: {
    positiveWords: number;
    negativeWords: number;
    textScore: number;
    numericalScore: number;
  };
}

export async function POST(request: Request) {
  noStore();
  try {
    const body = await request.json();
    const {
      moodRating,
      workEnvironment,
      personalWellbeing,
      workLifeBalance,
      stressLevel,
      feedback
    } = body as SurveyData;

    // Validación de datos
    const ratings = [moodRating, workEnvironment, personalWellbeing, workLifeBalance, stressLevel];
    const isValidRating = (rating: number) => typeof rating === 'number' && rating >= 1 && rating <= 5;
    
    if (!ratings.every(isValidRating)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Todas las calificaciones deben ser números entre 1 y 5' 
        },
        { status: 400 }
      );
    }

    // Guardar la encuesta
    const survey = await prisma.survey.create({
      data: {
        moodRating,
        workEnvironment,
        personalWellbeing,
        workLifeBalance,
        stressLevel,
        feedback: feedback || null,
      },
    });

    // Revalidar rutas
    revalidatePath('/dashboard/manager/bienestar');
    revalidatePath('/dashboard/team_leader/bienestar');

    return NextResponse.json({
      success: true,
      data: survey
    });

  } catch (error) {
    console.error('Error al procesar la encuesta:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al procesar la encuesta' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  noStore();
  try {
    const headersList = headers();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    const role = headersList.get('x-user-role');

    // Validar acceso
    if (!role || !['manager', 'team_leader'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Acceso no autorizado' },
        { status: 403 }
      );
    }

    // Calcular fecha inicial
    const startDate = new Date();
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }

    // Obtener datos en paralelo
    const [surveys, stats, alertConditions] = await Promise.all([
      prisma.survey.findMany({
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.$queryRaw<SurveyStats[]>`
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
        WHERE "createdAt" >= ${startDate}
      `,
      prisma.survey.findMany({
        where: {
          AND: [
            { createdAt: { gte: startDate } },
            {
              OR: [
                { moodRating: { lte: 2 } },
                { workEnvironment: { lte: 2 } },
                { personalWellbeing: { lte: 2 } },
                { stressLevel: { gte: 4 } }
              ]
            }
          ]
        },
        select: {
          id: true,
          createdAt: true,
          moodRating: true,
          workEnvironment: true,
          personalWellbeing: true,
          stressLevel: true,
          feedback: true
        }
      })
    ]);

    // Procesar sentimientos
    const sentimentAnalysis: SentimentAnalysis[] = surveys
      .filter(s => s.feedback)
      .map(survey => ({
        id: survey.id,
        feedback: survey.feedback,
        date: survey.createdAt.toISOString(),
        ...analyzeSentiment(survey.feedback || '', {
          moodRating: survey.moodRating,
          workEnvironment: survey.workEnvironment,
          personalWellbeing: survey.personalWellbeing,
          workLifeBalance: survey.workLifeBalance,
          stressLevel: survey.stressLevel
        })
      }));

    // Agrupar por sentimiento
    const sentimentCounts = {
      Positivo: sentimentAnalysis.filter(s => s.sentiment === 'Positivo').length,
      Neutral: sentimentAnalysis.filter(s => s.sentiment === 'Neutral').length,
      Negativo: sentimentAnalysis.filter(s => s.sentiment === 'Negativo').length,
    };

    // Procesar tendencias
    const trends: SurveyTrends = {
      daily: {},
      weekly: {}
    };

    surveys.forEach(survey => {
      const date = survey.createdAt.toISOString().split('T')[0];
      const week = `${survey.createdAt.getFullYear()}-W${getWeekNumber(survey.createdAt)}`;
      
      if (!trends.daily[date]) {
        trends.daily[date] = [];
      }
      if (!trends.weekly[week]) {
        trends.weekly[week] = [];
      }
      
      trends.daily[date].push(survey);
      trends.weekly[week].push(survey);
    });

    const processedTrends = {
      daily: Object.entries(trends.daily).map(([date, surveys]): ProcessedTrend => ({
        date,
        average: surveys.reduce((sum, s) => sum + s.moodRating, 0) / surveys.length,
        count: surveys.length
      })),
      weekly: Object.entries(trends.weekly).map(([week, surveys]): ProcessedTrend => ({
        week,
        average: surveys.reduce((sum, s) => sum + s.moodRating, 0) / surveys.length,
        count: surveys.length
      }))
    };

    return NextResponse.json({
      success: true,
      data: {
        surveys: surveys.map(s => ({
          ...s,
          createdAt: s.createdAt.toISOString()
        })),
        stats: stats[0],
        alerts: alertConditions,
        sentimentAnalysis: {
          counts: sentimentCounts,
          recent: sentimentAnalysis.slice(0, 5),
          trends: processedTrends
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener datos:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener datos' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  noStore();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const headersList = headers();
    const role = headersList.get('x-user-role');

    if (!role || role !== 'manager') {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 403 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID no proporcionado' },
        { status: 400 }
      );
    }

    await prisma.survey.delete({
      where: { id: parseInt(id) }
    });

    revalidatePath('/dashboard/manager/bienestar');
    revalidatePath('/dashboard/team_leader/bienestar');

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error al eliminar encuesta:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al eliminar encuesta' 
      },
      { status: 500 }
    );
  }
}