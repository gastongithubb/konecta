// app/api/survey/utils.ts
import { POSITIVE_WORDS, NEGATIVE_WORDS } from './constants';
import type { SentimentAnalysis } from './types';

export function analyzeSentiment(
  text: string,
  scores: {
    moodRating: number;
    workEnvironment: number;
    personalWellbeing: number;
    workLifeBalance: number;
    stressLevel: number;
  }
): SentimentAnalysis {
  const words = text.toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .split(/\s+/);

  let positiveCount = 0;
  let negativeCount = 0;

  words.forEach(word => {
    if (POSITIVE_WORDS.has(word)) positiveCount++;
    if (NEGATIVE_WORDS.has(word)) negativeCount++;
  });

  const textScore = (positiveCount - negativeCount) / (positiveCount + negativeCount + 1);
  const numericalScore = (
    scores.moodRating / 5 +
    scores.workEnvironment / 5 +
    scores.personalWellbeing / 5 +
    scores.workLifeBalance / 5 -
    scores.stressLevel / 5
  ) / 4;

  const finalScore = (textScore + numericalScore) / 2;

  return {
    score: finalScore,
    sentiment: finalScore > 0.2 ? 'Positivo' : finalScore < -0.2 ? 'Negativo' : 'Neutral',
    details: {
      positiveWords: positiveCount,
      negativeWords: negativeCount,
      textScore,
      numericalScore
    }
  };
}

export function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}