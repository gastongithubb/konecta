// components/SurveyDashboard/SentimentAnalysis.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SentimentData {
  positive: number;
  negative: number;
  neutral: number;
  recentSentiments: Array<{
    feedback: string;
    sentiment: string;
    date: string;
  }>;
}

interface SentimentAnalysisProps {
  data: SentimentData;
}

export const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({ data }) => {
  const total = data.positive + data.negative + data.neutral;
  const positivePercentage = ((data.positive / total) * 100).toFixed(1);
  const negativePercentage = ((data.negative / total) * 100).toFixed(1);
  const neutralPercentage = ((data.neutral / total) * 100).toFixed(1);

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Análisis de Sentimientos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-100 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{positivePercentage}%</div>
              <div className="text-sm text-green-800">Positivo</div>
            </div>
            <div className="text-center p-4 bg-gray-100 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{neutralPercentage}%</div>
              <div className="text-sm text-gray-800">Neutral</div>
            </div>
            <div className="text-center p-4 bg-red-100 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{negativePercentage}%</div>
              <div className="text-sm text-red-800">Negativo</div>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Comentarios Recientes</h3>
            <div className="space-y-3">
              {data.recentSentiments.map((item, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg ${
                    item.sentiment === 'Positivo' ? 'bg-green-50' :
                    item.sentiment === 'Negativo' ? 'bg-red-50' :
                    'bg-gray-50'
                  }`}
                >
                  <p className="text-sm">{item.feedback}</p>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>{item.sentiment}</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};