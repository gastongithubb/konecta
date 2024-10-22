// app/api/survey/constants.ts
export const POSITIVE_WORDS = new Set([
    'excelente', 'bien', 'bueno', 'mejor', 'satisfecho', 'feliz', 'contento',
    'agradable', 'motivado', 'tranquilo', 'positivo', 'cómodo', 'productivo',
    'eficiente', 'progreso', 'apoyo', 'equilibrado', 'organizado', 'éxito',
    'logro', 'aprendizaje', 'crecimiento', 'colaboración', 'equipo'
  ]);
  
  export const NEGATIVE_WORDS = new Set([
    'mal', 'peor', 'estresado', 'cansado', 'frustrado', 'preocupado', 'difícil',
    'problema', 'negativo', 'tensión', 'presión', 'sobrecargado', 'insatisfecho',
    'molesto', 'agotado', 'conflicto', 'desorganizado', 'confuso', 'desmotivado',
    'abrumado', 'saturado', 'complicado', 'desbalanceado'
  ]);