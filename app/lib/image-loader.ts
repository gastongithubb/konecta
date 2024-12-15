export default function imageLoader({ src, width, quality }: { src: string, width?: number, quality?: number }) {
    if (src.startsWith('http')) {
      return src;
    }
    return `${process.env.NEXT_PUBLIC_URL || ''}${src}`;
  }