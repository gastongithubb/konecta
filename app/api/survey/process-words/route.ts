// app/api/survey/process-words/route.ts
import { NextResponse } from 'next/server';

// Utility function for processing text
const processText = (text: string): Map<string, number> => {
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

// POST handler for the API route
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { text } = data;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const wordCount = processText(text);
    
    // Convert Map to a plain object for JSON serialization
    const result = Object.fromEntries(wordCount);

    return NextResponse.json({ wordCount: result });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process text' },
      { status: 500 }
    );
  }
}