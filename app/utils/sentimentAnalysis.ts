// utils/sentimentAnalysis.ts
interface SentimentWord {
    word: string;
    score: number;
  }
  
  const sentimentDictionary: Record<string, number> = {
    // Palabras positivas
    'excelente': 2,
    'bien': 1,
    'bueno': 1,
    'mejor': 1,
    'satisfecho': 1,
    'feliz': 2,
    'contento': 1,
    'agradable': 1,
    'motivado': 1,
    'tranquilo': 1,
    'positivo': 1,
    'cómodo': 1,
    'productivo': 1,
    'eficiente': 1,
    'progreso': 1,
  
    // Palabras negativas
    'mal': -1,
    'peor': -1,
    'estresado': -2,
    'cansado': -1,
    'frustrado': -2,
    'preocupado': -1,
    'difícil': -1,
    'problema': -1,
    'negativo': -1,
    'tensión': -1,
    'presión': -1,
    'sobrecargado': -2,
    'insatisfecho': -2,
    'molesto': -1,
    'agotado': -2,
    'Me Duele el Coxis': -1,
    'estres': -1,
    'fusilada': -1,
    "con mucho estrés por problemas personales": -1
  };
  
  export const analyzeSentiment = (text: string) => {
    const words = text.toLowerCase().split(/\s+/);
    let totalScore = 0;
    let wordCount = 0;
    const sentimentWords: SentimentWord[] = [];
  
    words.forEach(word => {
      if (sentimentDictionary[word]) {
        totalScore += sentimentDictionary[word];
        wordCount++;
        sentimentWords.push({ word, score: sentimentDictionary[word] });
      }
    });
  
    const averageScore = wordCount > 0 ? totalScore / wordCount : 0;
    const sentiment = 
      averageScore > 0.5 ? 'Positivo' :
      averageScore < -0.5 ? 'Negativo' :
      'Neutral';
  
    return {
      score: averageScore,
      sentiment,
      details: sentimentWords
    };
  };