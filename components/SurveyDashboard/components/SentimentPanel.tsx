// components/SurveyDashboard/components/SentimentPanel.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { processSentimentData } from '../utils/sentimentHelpers';
import type { SentimentData } from '../types';

interface SentimentPanelProps {
  data: SentimentData;
}

export const SentimentPanel = ({ data }: SentimentPanelProps) => {
  const { percentages, recentSentiments } = processSentimentData(data);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análisis de Sentimientos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {percentages.positive}%
            </div>
            <div className="text-sm text-green-800">Positivo</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-600">
              {percentages.neutral}%
            </div>
            <div className="text-sm text-gray-800">Neutral</div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">
              {percentages.negative}%
            </div>
            <div className="text-sm text-red-800">Negativo</div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-semibold">Comentarios Recientes</h3>
          {recentSentiments.map((item, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                item.sentiment === 'Positivo' ? 'bg-green-50' :
                item.sentiment === 'Negativo' ? 'bg-red-50' :
                'bg-gray-50'
              }`}
            >
              <p className="text-sm">{item.feedback}</p>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>{item.sentiment}</span>
                <span>{new Date(item.date).toLocaleDateString('es-ES')}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};