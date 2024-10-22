// components/SurveyDashboard/WordCloud.tsx
'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WordCloudData } from './types';

interface WordCloudProps {
  words: WordCloudData[];
}

export const WordCloud: React.FC<WordCloudProps> = ({ words }) => {
  const maxFontSize = 48;
  const minFontSize = 12;
  
  const maxValue = Math.max(...words.map(w => w.value));
  
  const getSize = (value: number) => {
    return Math.max(
      minFontSize,
      Math.floor((value / maxValue) * maxFontSize)
    );
  };

  const getColor = (value: number) => {
    const hue = Math.floor((value / maxValue) * 200); // 200 es azul en HSL
    return `hsl(${hue}, 70%, 50%)`;
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Términos más mencionados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 justify-center p-4">
          {words.map((word, index) => (
            <span
              key={index}
              style={{
                fontSize: `${getSize(word.value)}px`,
                color: getColor(word.value),
                transition: 'all 0.3s ease'
              }}
              className="hover:scale-110 cursor-pointer"
              title={`Mencionado ${word.value} veces`}
            >
              {word.text}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};