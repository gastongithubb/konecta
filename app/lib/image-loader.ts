// app/lib/image-loader.ts
export default function imageLoader({ src, width, quality }: { src: string, width?: number, quality?: number }) {
  // Si es una URL externa, retornarla directamente
  if (src.startsWith('http')) {
    return src;
  }
  
  // Si es una URL interna, construirla con la URL base
  const baseUrl = process.env.NEXT_PUBLIC_URL || '';
  const params = new URLSearchParams();
  
  if (width) {
    params.append('w', width.toString());
  }
  if (quality) {
    params.append('q', quality.toString());
  }
  
  const queryString = params.toString();
  return `${baseUrl}${src}${queryString ? `?${queryString}` : ''}`;
}