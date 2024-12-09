'use client'

import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import { useTheme } from "next-themes";
import {
  Sun,
  Cloud,
  CloudRain,
  Search,
  Coffee,
  Lightbulb,
  Trophy,
  Target,
  TrendingUp,
  Users,
  FileText,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from 'next/image';
import Link from 'next/link';

const frases = [
  "Liderando con visión y propósito",
  "Transformando desafíos en oportunidades",
  "Innovación en cada decisión",
  "Construyendo el futuro, hoy",
  "Excelencia en la gestión empresarial"
];

interface ClimaState {
  temp: number;
  condicion: string;
  ciudad: string;
}

interface DashboardGerenciaProps {
  userRole: string;
}

const DashboardGerencia: React.FC<DashboardGerenciaProps> = ({ userRole }) => {
  const { theme } = useTheme();
  const [fecha, setFecha] = useState<Date>(new Date());
  const [clima, setClima] = useState<ClimaState>({ temp: 0, condicion: 'soleado', ciudad: '' });
  const [frase, setFrase] = useState<string>('');
  const [ubicacion, setUbicacion] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchClima = useCallback(async (location: string) => {
    const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
    if (!apiKey) {
      console.error("API key for weather is not set");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}&lang=es`);
      const data = await response.json();
      setClima({
        temp: data.current.temp_c,
        condicion: data.current.condition.text.toLowerCase(),
        ciudad: data.location.name
      });
    } catch (error) {
      console.error("Error fetching weather data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserLocation = useCallback(() => {
    if (typeof window === 'undefined') return;

    const locationPermission = localStorage.getItem('locationPermission');

    if (locationPermission === 'granted') {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          fetchClima(`${latitude},${longitude}`);
        },
        error => {
          console.error("Error obteniendo la ubicación:", error);
          fetchClima('auto:ip');
        }
      );
    } else if (locationPermission === 'denied') {
      fetchClima('auto:ip');
    } else if ("geolocation" in navigator) {
      const permission = confirm("¿Nos permites usar tu ubicación para mostrarte el clima local?");

      if (permission) {
        localStorage.setItem('locationPermission', 'granted');
        navigator.geolocation.getCurrentPosition(
          position => {
            const { latitude, longitude } = position.coords;
            fetchClima(`${latitude},${longitude}`);
          },
          error => {
            console.error("Error obteniendo la ubicación:", error);
            localStorage.setItem('locationPermission', 'denied');
            fetchClima('auto:ip');
          }
        );
      } else {
        localStorage.setItem('locationPermission', 'denied');
        fetchClima('auto:ip');
      }
    } else {
      console.log("Geolocalización no disponible");
      fetchClima('auto:ip');
    }
  }, [fetchClima]);

  useEffect(() => {
    const timer = setInterval(() => setFecha(new Date()), 1000);
    setFrase(frases[Math.floor(Math.random() * frases.length)]);
    getUserLocation();

    return () => clearInterval(timer);
  }, [getUserLocation]);

  const handleUbicacionChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUbicacion(e.target.value);
  };

  const handleUbicacionSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (ubicacion.trim()) {
      fetchClima(ubicacion);
    }
  };

  const getClimaIcon = () => {
    if (clima.condicion.includes('sol') || clima.condicion.includes('despejado')) {
      return <Sun className="h-5 w-5 text-yellow-400 animate-spin-slow" />;
    } else if (clima.condicion.includes('nub')) {
      return <Cloud className="h-5 w-5 text-gray-400 animate-pulse" />;
    } else if (clima.condicion.includes('lluv')) {
      return <CloudRain className="h-5 w-5 text-blue-400 animate-bounce" />;
    }
    return <Sun className="h-5 w-5 text-yellow-400 animate-spin-slow" />;
  };

  const renderMetricCard = (
    icon: React.ReactNode,
    value: string | number,
    label: string,
    trend: string,
    trendColor: string,
    delay: string
  ) => (
    <Card className={`transform transition-all duration-300 hover:scale-105 hover:shadow-lg ${delay} dark:bg-gray-800 dark:border-gray-700`}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="rounded-xl p-2 bg-gray-100 dark:bg-gray-700 transition-colors duration-300 hover:bg-gray-200 dark:hover:bg-gray-600">
            {icon}
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
              <p className={`text-sm ${trendColor} dark:text-green-400 flex items-center gap-1 transition-all duration-300 hover:translate-x-1`}>
                <TrendingUp className="h-4 w-4" />
                {trend}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <div className="border-b dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between animate-fadeIn">
            <div>
              <h1 className="text-xl font-semibold text-foreground dark:text-gray-100 animate-slideDown">
                Dashboard Ejecutivo
              </h1>
              <p className="text-sm text-muted-foreground dark:text-gray-400 animate-slideRight">
                {fecha.toLocaleString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <form onSubmit={handleUbicacionSubmit} className="flex items-center animate-slideLeft">
                <input
                  type="text"
                  value={ubicacion}
                  onChange={handleUbicacionChange}
                  placeholder="Buscar ubicación"
                  className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-l-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                />
                <button 
                  type="submit" 
                  className="bg-primary text-primary-foreground dark:bg-primary/90 rounded-r-lg px-3 py-1 hover:bg-primary/90 dark:hover:bg-primary/80 transition-colors duration-300"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
              <div className={`flex items-center gap-2 bg-muted dark:bg-gray-800 rounded-lg px-3 py-1 transition-all duration-300 hover:shadow-md ${isLoading ? 'animate-pulse' : 'animate-slideLeft'}`}>
                {getClimaIcon()}
                <span className="font-medium dark:text-gray-100">{clima.temp}°C</span>
                <span className="text-sm text-muted-foreground dark:text-gray-400">{clima.ciudad}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground dark:text-gray-100 mb-6 animate-slideDown">
            {frase}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              asChild
              className="w-full h-auto p-4 flex items-center gap-4 hover:bg-muted dark:hover:bg-gray-800 dark:border-gray-700 transition-all duration-300 transform hover:scale-105 hover:shadow-md animate-slideRight"
            >
              <Link href="/team-leaders">
                <div className="rounded-full p-2 bg-primary/10 dark:bg-primary/20">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-foreground dark:text-gray-100">Ver Líderes</h3>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Gestiona y conecta con tu equipo de liderazgo</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground dark:text-gray-400 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>

            <Link href="/news" className="block">
              <Button
                variant="outline"
                className="w-full h-auto p-4 flex items-center gap-4 hover:bg-muted dark:hover:bg-gray-800 dark:border-gray-700 transition-all duration-300 transform hover:scale-105 hover:shadow-md animate-slideLeft"
              >
                <div className="rounded-full p-2 bg-primary/10 dark:bg-primary/20">
                  <FileText className="h-5 w-5 text-secundary" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-foreground dark:text-gray-100">Novedades</h3>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Últimas actualizaciones y noticias importantes</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground dark:text-gray-400 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground dark:text-gray-100">Métricas Clave</h3>
                <TabsList className="transition-all duration-300 hover:shadow-md dark:bg-gray-800">
                  <TabsTrigger value="overview" className="data-[state=active]:dark:bg-gray-700">General</TabsTrigger>
                  <TabsTrigger value="details" className="data-[state=active]:dark:bg-gray-700">Detalles</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderMetricCard(
                    <Coffee className="h-5 w-5 text-primary dark:text-primary/90" />,
                    "1,234",
                    "Tazas de café",
                    "+12.5%",
                    "text-green-600",
                    "animate-fadeIn"
                  )}
                  {renderMetricCard(
                    <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />,
                    "42",
                    "Ideas innovadoras",
                    "+8.3%",
                    "text-green-600",
                    "animate-fadeIn delay-100"
                  )}
                  {renderMetricCard(
                    <Trophy className="h-5 w-5 text-orange-600 dark:text-orange-500" />,
                    "99%",
                    "Tasa de éxito",
                    "+2.1%",
                    "text-green-600",
                    "animate-fadeIn delay-200"
                  )}
                  {renderMetricCard(
                    <Target className="h-5 w-5 text-purple-600 dark:text-purple-500" />,
                    "3.14",
                    "Objetivos superados",
                    "+5.7%",
                    "text-green-600",
                    "animate-fadeIn delay-300"
                  )}
                </div>
              </TabsContent>

              <TabsContent value="details" className="animate-fadeIn">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground dark:text-gray-100">Análisis Detallado</h4>
                      <p className="text-muted-foreground dark:text-gray-400">
                      Visualización detallada de métricas y KPIs empresariales.
                        Este panel muestra información más específica sobre el rendimiento.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <Card className="overflow-hidden transform transition-all duration-500 hover:shadow-xl animate-fadeIn dark:bg-gray-800 dark:border-gray-700">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src="/gerenciahero.jpg"
                  alt="Liderazgo y Gestión"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                  className="transition-transform duration-500 group-hover:scale-110 dark:opacity-90"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardGerencia;