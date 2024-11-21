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
    iconColor: string
  ) => (
    <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`rounded-xl p-3 ${bgColor}`}>
            {icon}
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Content Section */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
                {quote}
              </h1>
              <p className="text-xl text-muted-foreground">
                Impulsando el crecimiento a través del liderazgo efectivo y la innovación continua
              </p>
            </div>

            <div className="flex items-center gap-4">
  <Link href="/news" passHref>
    <Button
      variant="default"
      size="lg"
      className="group"
    >
      Ver Novedades
      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
    </Button>
  </Link>
  <Button
    variant="outline"
    size="lg"
    onClick={handleMetricsClick}
    className="group"
  >
    Explorar Métricas
    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
  </Button>
</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderMetricCard(
                <Users className="h-6 w-6 text-blue-600" />,
                "500+",
                "Equipos liderados",
                "bg-blue-100",
                "text-blue-600"
              )}
              {renderMetricCard(
                <Target className="h-6 w-6 text-green-600" />,
                "95%",
                "Objetivos alcanzados",
                "bg-green-100",
                "text-green-600"
              )}
              {renderMetricCard(
                <Lightbulb className="h-6 w-6 text-yellow-600" />,
                "200+",
                "Proyectos innovadores",
                "bg-yellow-100",
                "text-yellow-600"
              )}
              {renderMetricCard(
                <TrendingUp className="h-6 w-6 text-purple-600" />,
                "30%",
                "Crecimiento anual",
                "bg-purple-100",
                "text-purple-600"
              )}
            </div>
          </div>

          {/* Image Section */}
          <div className="relative">
            <div className="relative aspect-square w-full lg:h-[600px] rounded-2xl overflow-hidden">
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-background/80 via-background/50 to-background/0 z-10" />
              
              {/* Background Patterns */}
              <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
              
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
            <Card className="absolute bottom-8 right-8 z-20 w-auto">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Crecimiento Total
                  </p>
                  <p className="text-2xl font-bold text-foreground">
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