'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Trash, Plus, X, ExternalLink } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Spinner from '@/components/generales/Loading';
import { useTheme } from "next-themes";

interface News {
  id: string;
  name: string;
  url: string;
  date: string;
  status: 'active' | 'updated' | 'obsolete';
  createdAt: string;
  updatedAt: string;
  creatorId: number;
}

const formatDateForInput = (dateString: string) => {
  const date = new Date(dateString);
  return date.toISOString().slice(0, 16); // Formato YYYY-MM-DDThh:mm
};

const formatDateForDisplay = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

const NewsManagement: React.FC = () => {
  const { theme } = useTheme();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newNews, setNewNews] = useState({ name: '', url: '', date: '' });
  const [userRole, setUserRole] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});
  const [isAddingNews, setIsAddingNews] = useState(false);
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
        const newsData = {
          ...newNews,
          date: new Date(newNews.date).toISOString(),
          status: 'active'
        };

        const response = await fetchWithTokenRefresh('/api/news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newsData),
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
        setIsAddingNews(false);
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

  const handleExternalLink = (url: string) => {
    const secureUrl = url.startsWith('http://') || url.startsWith('https://')
      ? url
      : `https://${url}`;
    
    window.open(secureUrl, '_blank', 'noopener,noreferrer');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { 
        className: "bg-green-500 text-white dark:bg-green-500 dark:text-white border border-green-500/20", 
        label: "Activa" 
      },
      updated: { 
        className: "bg-yellow-500 text-white dark:bg-yellow-500/20 dark:text-white border border-yellow-500/20", 
        label: "Actualizada" 
      },
      obsolete: { 
        className: "bg-red-500 text-white dark:bg-white dark:text-red-400 border border-red-500/20", 
        label: "Sin Utilidad" 
      }
    };
  
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge variant="outline" className={`ml-2 ${config.className}`}>
        {config.label}
      </Badge>
    );
  };

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewNews({...newNews, date: e.target.value});
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
    <div className="container mx-auto p-4 space-y-6 dark:bg-gray-900 transition-colors duration-200">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Gestión de Novedades</h1>
      
      <div className="flex items-center space-x-4">
        <Input
          type="text"
          placeholder="Buscar novedades..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
        {userRole === 'team_leader' && (
          <Button onClick={() => setIsAddingNews(true)}>
            <Plus className="mr-2 h-4 w-4" /> Agregar Novedad
          </Button>
        )}
      </div>

      {isAddingNews && (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex justify-between items-center dark:text-white">
              Nueva Novedad
              <Button variant="ghost" onClick={() => setIsAddingNews(false)} 
                      className="dark:hover:bg-gray-700">
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Nombre de la novedad"
                value={newNews.name}
                onChange={(e) => setNewNews({...newNews, name: e.target.value})}
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              <Input
                type="url"
                placeholder="URL de la novedad"
                value={newNews.url}
                onChange={(e) => setNewNews({...newNews, url: e.target.value})}
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              <Input
                type="datetime-local"
                value={newNews.date}
                onChange={handleDateTimeChange}
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              <Button onClick={handleAddNews} disabled={loading} className="w-full">
                {loading ? <Spinner className="text-blue-500" /> : 'Agregar Novedad'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && <div className="flex justify-center"><Spinner className="text-blue-500" /></div>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {Object.entries(groupedNews).map(([month, monthNews]) => (
        <Card key={month} className="mb-4 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <Button
              variant="ghost"
              onClick={() => toggleMonth(month)}
              className="w-full flex justify-between items-center dark:text-white dark:hover:bg-gray-700"
            >
              <CardTitle className="dark:text-white">{month}</CardTitle>
              {expandedMonths[month] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </Button>
          </CardHeader>
          <CardContent className={`space-y-4 transition-all duration-300 ease-in-out ${expandedMonths[month] ? 'max-h-full opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            {monthNews.map((item) => (
              <div key={item.id} className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center mb-2">
                  <h3 className="font-semibold text-lg dark:text-white">{item.name}</h3>
                  {getStatusBadge(item.status)}
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="link"
                        className="p-0 h-auto font-normal text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        onClick={() => handleExternalLink(item.url)}
                      >
                        Ir a la Novedad <ExternalLink size={16} className="ml-1 inline" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Abrir en una nueva pestaña</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-4">
                  {formatDateForDisplay(item.date)}
                </p>
                <div className="flex items-center justify-between">
                  <Select
                    defaultValue={item.status}
                    onValueChange={(value: 'active' | 'updated' | 'obsolete') => handleUpdateStatus(item.id, value)}
                    disabled={userRole !== 'team_leader'}
                  >
                    <SelectTrigger className="w-[180px] dark:bg-gray-700 dark:text-white dark:border-gray-600">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="active">Activa</SelectItem>
                      <SelectItem value="updated">Actualizada</SelectItem>
                      <SelectItem value="obsolete">Sin Utilidad</SelectItem>
                    </SelectContent>
                  </Select>
                  {userRole === 'team_leader' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash size={16} className="mr-2" /> Eliminar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="dark:bg-gray-800 dark:text-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="dark:text-white">¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription className="dark:text-gray-400">
                            Esta acción no se puede deshacer. Esto eliminará permanentemente la novedad.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="dark:bg-gray-700 dark:text-white">Cancelar</AlertDialogCancel>
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NewsManagement;