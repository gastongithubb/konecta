import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import {
  Sun, Cloud, CloudRain, Search, Coffee, Lightbulb, Trophy,
  Target, TrendingUp, Users, FileText, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from 'next/image';

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

const DashboardGerencia: React.FC = () => {
  const [fecha, setFecha] = useState<Date>(new Date());
  const [clima, setClima] = useState<ClimaState>({ temp: 0, condicion: 'soleado', ciudad: '' });
  const [frase, setFrase] = useState<string>('');
  const [ubicacion, setUbicacion] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const handleTeamLeadersClick = () => {
    window.location.href = '/dashboard/team-leaders';
  };

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

    setTimeout(() => {
      setIsLoading(false);
    }, 1000);

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

  const handleNewsClick = () => {
    window.location.href = '/news';
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
    <Card className={`transform transition-all duration-300 hover:scale-105 hover:shadow-lg ${delay}`}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="rounded-xl p-2 bg-gray-100 transition-colors duration-300 hover:bg-gray-200">
            {icon}
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{label}</p>
              <p className={`text-sm ${trendColor} flex items-center gap-1 transition-all duration-300 hover:translate-x-1`}>
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
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between animate-fadeIn">
            <div>
              <h1 className="text-xl font-semibold text-foreground animate-slideDown">
                Dashboard Ejecutivo
              </h1>
              <p className="text-sm text-muted-foreground animate-slideRight">
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
                  className="border rounded-l-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                />
                <button type="submit" className="bg-primary text-primary-foreground rounded-r-lg px-3 py-1 hover:bg-primary/90 transition-colors duration-300">
                  <Search className="h-4 w-4" />
                </button>
              </form>
              <div className={`flex items-center gap-2 bg-muted rounded-lg px-3 py-1 transition-all duration-300 hover:shadow-md ${isLoading ? 'animate-pulse' : 'animate-slideLeft'}`}>
                {getClimaIcon()}
                <span className="font-medium">{clima.temp}°C</span>
                <span className="text-sm text-muted-foreground">{clima.ciudad}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6 animate-slideDown">
            {frase}
          </h2>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex items-center gap-4 hover:bg-muted transition-all duration-300 transform hover:scale-105 hover:shadow-md animate-slideRight"
              onClick={handleTeamLeadersClick}
            >
              <div className="rounded-full p-2 bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-foreground">Ver Líderes</h3>
                <p className="text-sm text-muted-foreground">Gestiona y conecta con tu equipo de liderazgo</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex items-center gap-4 hover:bg-muted transition-all duration-300 transform hover:scale-105 hover:shadow-md animate-slideLeft"
              onClick={handleNewsClick}
            >
              <div className="rounded-full p-2 bg-secondary/10">
                <FileText className="h-5 w-5 text-secondary" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-foreground">Novedades</h3>
                <p className="text-sm text-muted-foreground">Últimas actualizaciones y noticias importantes</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Metrics Section */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Métricas Clave</h3>
                <TabsList className="transition-all duration-300 hover:shadow-md">
                  <TabsTrigger value="overview">General</TabsTrigger>
                  <TabsTrigger value="details">Detalles</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderMetricCard(
                    <Coffee className="h-5 w-5 text-primary" />,
                    "1,234",
                    "Tazas de café",
                    "+12.5%",
                    "text-green-600",
                    "animate-fadeIn"
                  )}
                  {renderMetricCard(
                    <Lightbulb className="h-5 w-5 text-yellow-600" />,
                    "42",
                    "Ideas innovadoras",
                    "+8.3%",
                    "text-green-600",
                    "animate-fadeIn delay-100"
                  )}
                  {renderMetricCard(
                    <Trophy className="h-5 w-5 text-orange-600" />,
                    "99%",
                    "Tasa de éxito",
                    "+2.1%",
                    "text-green-600",
                    "animate-fadeIn delay-200"
                  )}
                  {renderMetricCard(
                    <Target className="h-5 w-5 text-purple-600" />,
                    "3.14",
                    "Objetivos superados",
                    "+5.7%",
                    "text-green-600",
                    "animate-fadeIn delay-300"
                  )}
                </div>
              </TabsContent>

              <TabsContent value="details" className="animate-fadeIn">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground">Análisis Detallado</h4>
                      <p className="text-muted-foreground">
                        Visualización detallada de métricas y KPIs empresariales.
                        Este panel muestra información más específica sobre el rendimiento.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Side Content - Image */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden transform transition-all duration-500 hover:shadow-xl animate-fadeIn">
              <div className="relative w-full h-full aspect-[4/3] group">
                <Image
                  src="/gerenciahero.jpg"
                  alt="Liderazgo y Gestión"
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-500 group-hover:scale-110"
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