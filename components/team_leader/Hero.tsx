'use client'
import React, { useState, useEffect } from 'react';
import { Users, Target, Lightbulb, TrendingUp, ArrowRight } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import Link from 'next/link';

const leadershipQuotes = [
  "Liderando con visión y empatía",
  "Inspirando equipos, alcanzando metas",
  "Transformando desafíos en oportunidades",
  "Cultivando el potencial de cada individuo",
  "Construyendo el futuro con liderazgo innovador"
];

const handleMetricsClick = () => {
  window.location.href = '/dashboard/team_leader/metricas';
};

const LeaderHero = () => {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    setQuote(leadershipQuotes[Math.floor(Math.random() * leadershipQuotes.length)]);
  }, []);

  const renderMetricCard = (
    icon: React.ReactNode,
    value: string,
    label: string,
    bgColor: string,
    darkBgColor: string,
    iconColor: string,
    darkIconColor: string
  ) => (
    <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`rounded-xl p-3 ${bgColor} dark:${darkBgColor}`}>
            {React.cloneElement(icon as React.ReactElement, {
              className: `h-6 w-6 ${iconColor} dark:${darkIconColor}`
            })}
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Content Section */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                {quote}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Impulsando el crecimiento a través del liderazgo efectivo y la innovación continua
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/news" passHref>
                <Button
                  variant="default"
                  size="lg"
                  className="group bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
                >
                  Ver Novedades
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                onClick={handleMetricsClick}
                className="group border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Explorar Métricas
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderMetricCard(
                <Users />,
                "500+",
                "Equipos liderados",
                "bg-blue-100",
                "bg-blue-900/20",
                "text-blue-600",
                "text-blue-400"
              )}
              {renderMetricCard(
                <Target />,
                "95%",
                "Objetivos alcanzados",
                "bg-green-100",
                "bg-green-900/20",
                "text-green-600",
                "text-green-400"
              )}
              {renderMetricCard(
                <Lightbulb />,
                "200+",
                "Proyectos innovadores",
                "bg-yellow-100",
                "bg-yellow-900/20",
                "text-yellow-600",
                "text-yellow-400"
              )}
              {renderMetricCard(
                <TrendingUp />,
                "30%",
                "Crecimiento anual",
                "bg-purple-100",
                "bg-purple-900/20",
                "text-purple-600",
                "text-purple-400"
              )}
            </div>
          </div>

          {/* Image Section */}
          <div className="relative">
            <div className="relative aspect-square w-full lg:h-[600px] rounded-2xl overflow-hidden">
              {/* Gradient Overlay */}
              <div className="absolute inset-0 z-10" />
              
              {/* Background Patterns */}
              <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-500/10 dark:bg-blue-400/10 rounded-full blur-3xl" />
              <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-purple-500/10 dark:bg-purple-400/10 rounded-full blur-3xl" />
              
              {/* Main Image */}
              <Image 
                src="/lider.jpg" 
                alt="Liderazgo Inspirador" 
                fill
                className="object-cover object-center"
                priority
              />
            </div>

            {/* Stats Overlay */}
            <Card className="absolute bottom-8 right-8 z-20 w-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2 bg-blue-100/80 dark:bg-blue-900/30 rounded-full">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Crecimiento Total
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    +127%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderHero;