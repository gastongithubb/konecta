// components/NewsManagement.tsx
'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { refreshAccessToken } from '@/app/utils/auth';
import { useRouter } from 'next/navigation';

interface News {
  id: string;
  name: string;
  url: string;
  date: string;
  status: 'active' | 'updated' | 'obsolete';
}

const NewsManagement: React.FC = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newNews, setNewNews] = useState({ name: '', url: '', date: '' });
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  const fetchWithTokenRefresh = useCallback(async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Incluye las cookies en la solicitud
    });

    if (response.status === 401) {
      // Token expirado, intentar refrescar
      const newToken = await refreshAccessToken();
      if (!newToken) {
        router.push('/login');
        return null;
      }

      // Reintentar la solicitud con el nuevo token
      return fetch(url, {
        ...options,
        credentials: 'include',
      });
    }

    return response;
  }, [router]);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchWithTokenRefresh('/api/news');
      if (!response) {
        throw new Error('Failed to refresh token');
      }
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      const data = await response.json();
      setNews(data);
    } catch (err) {
      if (err instanceof Error && err.message === 'Failed to refresh token') {
        router.push('/login');
      } else {
        setError('Error fetching news');
        console.error('Error fetching news:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchWithTokenRefresh, router]);

  const fetchUserRole = useCallback(async () => {
    try {
      const response = await fetchWithTokenRefresh('/api/user-role');
      if (!response) {
        throw new Error('Failed to refresh token');
      }
      if (!response.ok) {
        throw new Error('Failed to fetch user role');
      }
      const data = await response.json();
      setUserRole(data.role);
    } catch (err) {
      if (err instanceof Error && err.message === 'Failed to refresh token') {
        router.push('/login');
      } else {
        console.error('Error fetching user role:', err);
      }
    }
  }, [fetchWithTokenRefresh, router]);

  useEffect(() => {
    fetchNews();
    fetchUserRole();
  }, [fetchNews, fetchUserRole]);

  const handleAddNews = async () => {
    if (newNews.name.trim() && newNews.url.trim() && newNews.date) {
      try {
        const response = await fetchWithTokenRefresh('/api/news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newNews),
        });
        if (!response) {
          throw new Error('Failed to refresh token');
        }
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add news');
        }
        const addedNews = await response.json();
        setNews(prevNews => [...prevNews, addedNews]);
        setNewNews({ name: '', url: '', date: '' });
      } catch (err) {
        if (err instanceof Error && err.message === 'Failed to refresh token') {
          router.push('/login');
        } else {
          setError(err instanceof Error ? err.message : 'Error adding news');
          console.error('Error adding news:', err);
        }
      }
    } else {
      setError('Por favor, complete todos los campos requeridos');
    }
  };

  const handleUpdateStatus = async (id: string, status: 'active' | 'updated' | 'obsolete') => {
    try {
      const response = await fetchWithTokenRefresh(`/api/news/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response) {
        throw new Error('Failed to refresh token');
      }
      if (!response.ok) {
        throw new Error('Failed to update news status');
      }
      const updatedNews = await response.json();
      setNews(prevNews => prevNews.map(item => item.id === id ? updatedNews : item));
    } catch (err) {
      if (err instanceof Error && err.message === 'Failed to refresh token') {
        router.push('/login');
      } else {
        setError('Error updating news status');
        console.error('Error updating news status:', err);
      }
    }
  };

  const filteredNews = news.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedNews = filteredNews.reduce((acc, item) => {
    const month = new Date(item.date).toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(item);
    return acc;
  }, {} as Record<string, News[]>);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Novedades</h1>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar novedades..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Nombre de la novedad"
          value={newNews.name}
          onChange={(e) => setNewNews({...newNews, name: e.target.value})}
          className="w-full p-2 border rounded"
        />
        <input
          type="url"
          placeholder="URL de la novedad"
          value={newNews.url}
          onChange={(e) => setNewNews({...newNews, url: e.target.value})}
          className="w-full p-2 border rounded"
        />
        <input
          type="date"
          value={newNews.date}
          onChange={(e) => setNewNews({...newNews, date: e.target.value})}
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handleAddNews}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded"
        >
          Agregar Novedad
        </button>
      </div>

      {loading && <p>Cargando...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {Object.entries(groupedNews).map(([month, monthNews]) => (
        <div key={month} className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{month}</h2>
          {monthNews.map((item) => (
            <div key={item.id} className="bg-gray-100 p-4 rounded mb-2">
              <h3 className="font-semibold">{item.name}</h3>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                Ver más
              </a>
              <p className="text-sm text-gray-500">
                {new Date(item.date).toLocaleDateString()}
              </p>
              {userRole === 'team_leader' && (
                <div className="mt-2">
                  <button
                    onClick={() => handleUpdateStatus(item.id, 'active')}
                    className="mr-2 bg-green-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Activa
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(item.id, 'updated')}
                    className="mr-2 bg-yellow-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Actualizada
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(item.id, 'obsolete')}
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Sin Utilidad
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default NewsManagement;