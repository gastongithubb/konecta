import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import { Sun, Cloud, CloudRain, Search, Coffee, Lightbulb, Trophy, Target } from 'lucide-react';
import Image from 'next/image';
import TeamLeaderButton from './TeamLeaderButton';

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

  const fetchClima = useCallback(async (location: string) => {
    const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
    if (!apiKey) {
      console.error("API key for weather is not set");
      return;
    }

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
    }
  }, []);

  const getUserLocation = useCallback(() => {
    if ("geolocation" in navigator) {
      if (confirm("¿Nos permites usar tu ubicación para mostrarte el clima local? Esto mejorará tu experiencia en el dashboard.")) {
        navigator.geolocation.getCurrentPosition(
          position => {
            const { latitude, longitude } = position.coords;
            fetchClima(`${latitude},${longitude}`);
          },
          error => {
            console.error("Error obteniendo la ubicación:", error);
            alert("No pudimos obtener tu ubicación. Usaremos una ubicación aproximada basada en tu IP.");
            fetchClima('auto:ip');
          }
        );
      } else {
        alert("Entendido. Usaremos una ubicación aproximada basada en tu IP para mostrarte el clima.");
        fetchClima('auto:ip');
      }
    } else {
      console.log("Geolocalización no disponible");
      alert("Tu navegador no soporta geolocalización. Usaremos una ubicación aproximada basada en tu IP.");
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
      return <Sun className="h-6 w-6 text-yellow-400" />;
    } else if (clima.condicion.includes('nub')) {
      return <Cloud className="h-6 w-6 text-gray-400" />;
    } else if (clima.condicion.includes('lluv')) {
      return <CloudRain className="h-6 w-6 text-blue-400" />;
    }
    return <Sun className="h-6 w-6 text-yellow-400" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8 flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 pr-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">{frase}</h1>
            
            <TeamLeaderButton />

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-blue-100 p-4 rounded-lg flex items-center">
                <Coffee className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <div className="text-xl font-bold text-gray-800">1,234</div>
                  <div className="text-sm text-gray-600">Tazas de café</div>
                </div>
              </div>
              <div className="bg-green-100 p-4 rounded-lg flex items-center">
                <Lightbulb className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <div className="text-xl font-bold text-gray-800">42</div>
                  <div className="text-sm text-gray-600">Ideas innovadoras</div>
                </div>
              </div>
              <div className="bg-yellow-100 p-4 rounded-lg flex items-center">
                <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
                <div>
                  <div className="text-xl font-bold text-gray-800">99%</div>
                  <div className="text-sm text-gray-600">Tasa de éxito</div>
                </div>
              </div>
              <div className="bg-purple-100 p-4 rounded-lg flex items-center">
                <Target className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <div className="text-xl font-bold text-gray-800">3.14</div>
                  <div className="text-sm text-gray-600">Objetivos superados</div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 mt-8 md:mt-0 relative">
            <div className="absolute top-0 right-0 bg-blue-400 rounded-full w-48 h-48 -mt-8 -mr-8 opacity-50"></div>
            <div className="absolute bottom-0 left-0 bg-green-200 rounded-full w-32 h-32 -mb-8 -ml-8 opacity-50"></div>
            <Image 
              src="/gerenciahero.jpg" 
              alt="Liderazgo y Gestión" 
              width={500}
              height={400}
              className="rounded-lg shadow-lg object-cover w-full h-auto" 
            />
          </div>
        </div>

        <div className="bg-gray-100 p-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 mb-4 md:mb-0">
            {fecha.toLocaleString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
          <div className="flex items-center">
            <form onSubmit={handleUbicacionSubmit} className="flex items-center mr-4">
              <input
                type="text"
                value={ubicacion}
                onChange={handleUbicacionChange}
                placeholder="Ingrese ubicación"
                className="border rounded px-2 py-1 text-sm mr-2"
              />
              <button type="submit" className="bg-blue-500 text-white rounded p-1">
                <Search className="h-4 w-4" />
              </button>
            </form>
            <div className="flex items-center">
              {getClimaIcon()}
              <div className="ml-2">
                <div className="font-semibold">{clima.temp}°C</div>
                <div className="text-sm text-gray-600">{clima.ciudad}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardGerencia;