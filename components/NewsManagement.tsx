'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Trash } from 'lucide-react';
import Loading from '@/components/Loading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

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
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});
  const router = useRouter();

  const refreshAccessToken = async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      setAccessToken(data.accessToken);
      return data.accessToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  };

  const fetchWithTokenRefresh = useCallback(async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (response.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) {
        router.push('/login');
        return null;
      }

      headers.set('Authorization', `Bearer ${newToken}`);
      return fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });
    }

    return response;
  }, [accessToken, router]);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchWithTokenRefresh('/api/news');
      if (!response || !response.ok) {
        throw new Error('Failed to fetch news');
      }
      const data = await response.json();
      setNews(data);
    } catch (err) {
      setError('Error fetching news');
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchWithTokenRefresh]);

  const fetchUserRole = useCallback(async () => {
    try {
      const response = await fetchWithTokenRefresh('/api/user-role');
      if (!response || !response.ok) {
        throw new Error('Failed to fetch user role');
      }
      const data = await response.json();
      setUserRole(data.role);
    } catch (err) {
      console.error('Error fetching user role:', err);
    }
  }, [fetchWithTokenRefresh]);

  useEffect(() => {
    fetchNews();
    fetchUserRole();
  }, [fetchNews, fetchUserRole]);

  const handleAddNews = async () => {
    if (newNews.name.trim() && newNews.url.trim() && newNews.date) {
      try {
        setLoading(true);
        const response = await fetchWithTokenRefresh('/api/news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...newNews, status: 'active' }),
        });
        if (!response) {
          throw new Error('Failed to add news: No response received');
        }
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add news');
        }
        const addedNews = await response.json();
        setNews(prevNews => [...prevNews, addedNews]);
        setNewNews({ name: '', url: '', date: '' });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error adding news');
        console.error('Error adding news:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setError('Por favor, complete todos los campos requeridos');
    }
  };

  const handleUpdateStatus = async (id: string, status: 'active' | 'updated' | 'obsolete') => {
    try {
      setLoading(true);
      const response = await fetchWithTokenRefresh(`/api/news/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response || !response.ok) {
        throw new Error('Failed to update news status');
      }
      const updatedNews = await response.json();
      setNews(prevNews => prevNews.map(item => item.id === id ? updatedNews : item));
    } catch (err) {
      setError('Error updating news status');
      console.error('Error updating news status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNews = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetchWithTokenRefresh(`/api/news/${id}`, {
        method: 'DELETE',
      });
      if (!response || !response.ok) {
        throw new Error('Failed to delete news');
      }
      setNews(prevNews => prevNews.filter(item => item.id !== id));
    } catch (err) {
      setError('Error deleting news');
      console.error('Error deleting news:', err);
    } finally {
      setLoading(false);
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

  const toggleMonth = (month: string) => {
    setExpandedMonths(prev => ({ ...prev, [month]: !prev[month] }));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Novedades</h1>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar novedades..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded transition duration-300 ease-in-out focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {userRole === 'team_leader' && (
        <div className="mb-4 space-y-2">
          <input
            type="text"
            placeholder="Nombre de la novedad"
            value={newNews.name}
            onChange={(e) => setNewNews({...newNews, name: e.target.value})}
            className="w-full p-2 border rounded transition duration-300 ease-in-out focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          <input
            type="url"
            placeholder="URL de la novedad"
            value={newNews.url}
            onChange={(e) => setNewNews({...newNews, url: e.target.value})}
            className="w-full p-2 border rounded transition duration-300 ease-in-out focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          <input
            type="date"
            value={newNews.date}
            onChange={(e) => setNewNews({...newNews, date: e.target.value})}
            className="w-full p-2 border rounded transition duration-300 ease-in-out focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          <button
            onClick={handleAddNews}
            disabled={loading}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded transition duration-300 ease-in-out hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            {loading ? <Loading /> : 'Agregar Novedad'}
          </button>
        </div>
      )}

      {loading && <div className="flex justify-center"><Loading /></div>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {Object.entries(groupedNews).map(([month, monthNews]) => (
        <div key={month} className="mb-4">
          <button
            onClick={() => toggleMonth(month)}
            className="flex justify-between items-center w-full bg-gray-200 p-2 rounded transition duration-300 ease-in-out hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <h2 className="text-xl font-semibold">{month}</h2>
            {expandedMonths[month] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          <div className={`mt-2 space-y-2 overflow-hidden transition-all duration-300 ease-in-out ${expandedMonths[month] ? 'max-h-full opacity-100' : 'max-h-0 opacity-0'}`}>
            {monthNews.map((item) => (
              <div key={item.id} className="bg-gray-100 p-4 rounded transition duration-300 ease-in-out hover:bg-gray-200">
                <h3 className="font-semibold">{item.name}</h3>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline transition duration-300 ease-in-out">
                  Ir a la Novedad
                </a>
                <p className="text-sm text-gray-500">
                  {new Date(item.date).toLocaleDateString()}
                </p>
                <div className="mt-2 flex items-center">
                  <Select
                    defaultValue={item.status}
                    onValueChange={(value: 'active' | 'updated' | 'obsolete') => handleUpdateStatus(item.id, value)}
                    disabled={userRole !== 'team_leader'}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activa</SelectItem>
                      <SelectItem value="updated">Actualizada</SelectItem>
                      <SelectItem value="obsolete">Sin Utilidad</SelectItem>
                    </SelectContent>
                  </Select>
                  {userRole === 'team_leader' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="ml-2 text-red-500 hover:text-red-700 transition duration-300 ease-in-out">
                          <Trash size={20} />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente la novedad.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteNews(item.id)}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NewsManagement;