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

interface StatsRaw {
  average_mood: string | number;
  average_work_environment: string | number;
  average_wellbeing: string | number;
  average_balance: string | number;
  average_stress: string | number;
  total_surveys: string | number;
  wellbeing_rate: string | number;
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

    revalidatePath('/dashboard/manager/bienestar');
    revalidatePath('/dashboard/team_leader/bienestar');

    return NextResponse.json({
      success: true,
      data: {
        ...survey,
        id: Number(survey.id),
        moodRating: Number(survey.moodRating),
        workEnvironment: Number(survey.workEnvironment),
        personalWellbeing: Number(survey.personalWellbeing),
        workLifeBalance: Number(survey.workLifeBalance),
        stressLevel: Number(survey.stressLevel)
      }
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

    if (!role || !['manager', 'team_leader'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Acceso no autorizado' },
        { status: 403 }
      );
    }

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

    const [surveys, statsRaw, alertConditions] = await Promise.all([
      prisma.survey.findMany({
        where: { 
          createdAt: { gte: startDate } 
        },
        orderBy: { 
          createdAt: 'desc' 
        },
        select: {
          id: true,
          createdAt: true,
          moodRating: true,
          workEnvironment: true,
          personalWellbeing: true,
          workLifeBalance: true,
          stressLevel: true,
          feedback: true
        }
      }),
      prisma.$queryRaw<StatsRaw[]>`
        SELECT 
          CAST(CAST(AVG(CAST("moodRating" AS DECIMAL(10,2))) AS DECIMAL(10,2)) AS FLOAT) as average_mood,
          CAST(CAST(AVG(CAST("workEnvironment" AS DECIMAL(10,2))) AS DECIMAL(10,2)) AS FLOAT) as average_work_environment,
          CAST(CAST(AVG(CAST("personalWellbeing" AS DECIMAL(10,2))) AS DECIMAL(10,2)) AS FLOAT) as average_wellbeing,
          CAST(CAST(AVG(CAST("workLifeBalance" AS DECIMAL(10,2))) AS DECIMAL(10,2)) AS FLOAT) as average_balance,
          CAST(CAST(AVG(CAST("stressLevel" AS DECIMAL(10,2))) AS DECIMAL(10,2)) AS FLOAT) as average_stress,
          CAST(COUNT(*) AS INTEGER) as total_surveys,
          CAST(
            CASE 
              WHEN COUNT(*) = 0 THEN 0
              ELSE (
                CAST(
                  COUNT(
                    CASE 
                      WHEN "moodRating" >= 4 AND 
                           "workEnvironment" >= 4 AND 
                           "personalWellbeing" >= 4 AND 
                           "workLifeBalance" >= 4 AND 
                           "stressLevel" <= 2
                      THEN 1 
                    END
                  ) * 100.0 / NULLIF(COUNT(*), 0) 
                AS DECIMAL(10,2))
              )
            END AS FLOAT
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
          workLifeBalance: true,
          feedback: true
        }
      })
    ]);

    if (!statsRaw?.[0]) {
      return NextResponse.json({
        success: true,
        data: {
          surveys: [],
          stats: {
            total_surveys: 0,
            average_mood: 0,
            average_work_environment: 0,
            average_wellbeing: 0,
            average_balance: 0,
            average_stress: 0,
            wellbeing_rate: 0
          },
          alerts: [],
          sentimentAnalysis: {
            counts: { Positivo: 0, Neutral: 0, Negativo: 0 },
            recent: [],
            trends: { daily: [], weekly: [] }
          }
        }
      });
    }

    const stats: SurveyStats = {
      total_surveys: Number(statsRaw[0].total_surveys || 0),
      average_mood: Number(statsRaw[0].average_mood || 0),
      average_work_environment: Number(statsRaw[0].average_work_environment || 0),
      average_wellbeing: Number(statsRaw[0].average_wellbeing || 0),
      average_balance: Number(statsRaw[0].average_balance || 0),
      average_stress: Number(statsRaw[0].average_stress || 0),
      wellbeing_rate: Number(statsRaw[0].wellbeing_rate || 0)
    };

    const sentimentAnalysis = surveys
      .filter(s => s.feedback)
      .map(survey => ({
        id: Number(survey.id),
        feedback: survey.feedback,
        date: survey.createdAt.toISOString(),
        ...analyzeSentiment(survey.feedback || '', {
          moodRating: Number(survey.moodRating),
          workEnvironment: Number(survey.workEnvironment),
          personalWellbeing: Number(survey.personalWellbeing),
          workLifeBalance: Number(survey.workLifeBalance),
          stressLevel: Number(survey.stressLevel)
        })
      }));

    const sentimentCounts = {
      Positivo: sentimentAnalysis.filter(s => s.sentiment === 'Positivo').length,
      Neutral: sentimentAnalysis.filter(s => s.sentiment === 'Neutral').length,
      Negativo: sentimentAnalysis.filter(s => s.sentiment === 'Negativo').length,
    };

    const trends: SurveyTrends = {
      daily: {},
      weekly: {}
    };

    surveys.forEach(survey => {
      const date = survey.createdAt.toISOString().split('T')[0];
      const week = `${survey.createdAt.getFullYear()}-W${getWeekNumber(survey.createdAt)}`;
      
      if (!trends.daily[date]) trends.daily[date] = [];
      if (!trends.weekly[week]) trends.weekly[week] = [];
      
      trends.daily[date].push(survey);
      trends.weekly[week].push(survey);
    });

    const processedTrends = {
      daily: Object.entries(trends.daily).map(([date, surveys]): ProcessedTrend => ({
        date,
        average: Number((surveys.reduce((sum, s) => sum + Number(s.moodRating), 0) / surveys.length).toFixed(2)),
        count: surveys.length
      })),
      weekly: Object.entries(trends.weekly).map(([week, surveys]): ProcessedTrend => ({
        week,
        average: Number((surveys.reduce((sum, s) => sum + Number(s.moodRating), 0) / surveys.length).toFixed(2)),
        count: surveys.length
      }))
    };

    return NextResponse.json({
      success: true,
      data: {
        surveys: surveys.map(s => ({
          ...s,
          id: Number(s.id),
          moodRating: Number(s.moodRating),
          workEnvironment: Number(s.workEnvironment),
          personalWellbeing: Number(s.personalWellbeing),
          workLifeBalance: Number(s.workLifeBalance),
          stressLevel: Number(s.stressLevel),
          createdAt: s.createdAt.toISOString()
        })),
        stats,
        alerts: alertConditions.map(a => ({
          ...a,
          id: Number(a.id),
          moodRating: Number(a.moodRating),
          workEnvironment: Number(a.workEnvironment),
          personalWellbeing: Number(a.personalWellbeing),
          workLifeBalance: Number(a.workLifeBalance),
          stressLevel: Number(a.stressLevel),
          createdAt: a.createdAt.toISOString()
        })),
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