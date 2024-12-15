// app/lib/api.ts

const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      return process.env.NEXT_PUBLIC_BASE_URL;
    }
    if (process.env.NEXT_PUBLIC_VERCEL_URL) {
      return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
    }
    return 'http://localhost:3000';
  };
  
  export const getApiUrl = (path: string) => {
    const baseUrl = getBaseUrl();
    const apiPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${apiPath}`;
  };