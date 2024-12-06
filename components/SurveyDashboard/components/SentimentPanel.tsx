import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { processSentimentData } from '../utils/sentimentHelpers';
import { useTheme } from "next-themes";
import type { SentimentData } from '../types';

interface SentimentPanelProps {
  data: SentimentData;
}

export const SentimentPanel = ({ data }: SentimentPanelProps) => {
  const { theme } = useTheme();
  const { percentages, recentSentiments } = processSentimentData(data);
  
  const isDark = theme === 'dark';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análisis de Sentimientos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg text-center ${
            isDark ? 'bg-green-950 text-green-200' : 'bg-green-50 text-green-600'
          }`}>
            <div className="text-2xl font-bold">
              {percentages.positive}%
            </div>
            <div className={`text-sm ${
              isDark ? 'text-green-300' : 'text-green-800'
            }`}>Positivo</div>
          </div>
          
          <div className={`p-4 rounded-lg text-center ${
            isDark ? 'bg-gray-500 text-gray-200' : 'bg-gray-50 text-gray-600'
          }`}>
            <div className="text-2xl font-bold">
              {percentages.neutral}%
            </div>
            <div className={`text-sm ${
              isDark ? 'text-gray-300' : 'text-gray-800'
            }`}>Neutral</div>
          </div>
          
          <div className={`p-4 rounded-lg text-center ${
            isDark ? 'bg-red-950 text-red-200' : 'bg-red-50 text-red-600'
          }`}>
            <div className="text-2xl font-bold">
              {percentages.negative}%
            </div>
            <div className={`text-sm ${
              isDark ? 'text-red-300' : 'text-red-800'
            }`}>Negativo</div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-semibold">Comentarios Recientes</h3>
          {recentSentiments.map((item, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                item.sentiment === 'Positivo' 
                  ? isDark ? 'bg-green-950' : 'bg-green-50'
                : item.sentiment === 'Negativo'
                  ? isDark ? 'bg-red-950' : 'bg-red-50'
                : isDark ? 'bg-gray-800' : 'bg-gray-50'
              }`}
            >
              <p className="text-sm">{item.feedback}</p>
              <div className={`flex justify-between mt-2 text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
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