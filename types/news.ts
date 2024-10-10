// app/types/news.ts
export interface News {
    id: string;
    content: string;
    date: string;
    status: 'active' | 'updated' | 'obsolete';
  }