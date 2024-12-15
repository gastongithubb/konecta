// app/lib/api.ts

const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://sancor-konectagroup.vercel.app';
  }
  return 'http://localhost:3000';
};

export const getApiUrl = (path: string) => {
  const baseUrl = getBaseUrl();
  const apiPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${apiPath}`;
};

export const fetchApi = async (url: string, options: RequestInit = {}) => {
  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  const response = await fetch(url, mergedOptions);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error en la solicitud');
  }

  return response;
};