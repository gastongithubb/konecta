// app/api/survey/process-words.ts
export const processText = (text: string): Map<string, number> => {
    const stopWords = new Set([
      'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'o', 'pero', 'porque',
      'que', 'qué', 'quien', 'como', 'cómo', 'cuando', 'cuándo', 'donde', 'dónde',
      'por', 'para', 'con', 'sin', 'sobre', 'entre', 'detrás', 'después', 'del', 'al',
      'es', 'son', 'está', 'están', 'fue', 'fueron', 'ser', 'estar', 'hay'
    ]);
  
    const words = text.toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .split(/\s+/)
      .filter(word => 
        word.length > 2 && 
        !stopWords.has(word) &&
        !/^\d+$/.test(word)
      );
  
    const wordCount = new Map<string, number>();
    
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });
  
    return wordCount;
  };