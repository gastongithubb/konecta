'use client'
import React, { useState, useEffect } from 'react';
import { Users, Target, Lightbulb, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const leadershipQuotes = [
  "Liderando con visión y empatía",
  "Inspirando equipos, alcanzando metas",
  "Transformando desafíos en oportunidades",
  "Cultivando el potencial de cada individuo",
  "Construyendo el futuro con liderazgo innovador"
];

const LeaderHero = () => {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    setQuote(leadershipQuotes[Math.floor(Math.random() * leadershipQuotes.length)]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto rounded-xl shadow-lg overflow-hidden">
        <div className="p-8 flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 pr-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">{quote}</h1>
            
            <Link href="/news" className="px-8 py-4 text-lg font-semibold text-center text-blue-400 transition duration-300 transform bg-transparent border-2 border-blue-400 rounded-lg shadow-lg hover:bg-blue-400 hover:text-white hover:shadow-xl hover:-translate-y-1">
                Novedades
              </Link>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-blue-100 p-4 rounded-lg flex items-center">
                <Users className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <div className="text-xl font-bold text-gray-800">500+</div>
                  <div className="text-sm text-gray-600">Equipos liderados</div>
                </div>
              </div>
              <div className="bg-green-100 p-4 rounded-lg flex items-center">
                <Target className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <div className="text-xl font-bold text-gray-800">95%</div>
                  <div className="text-sm text-gray-600">Objetivos alcanzados</div>
                </div>
              </div>
              <div className="bg-yellow-100 p-4 rounded-lg flex items-center">
                <Lightbulb className="h-8 w-8 text-yellow-500 mr-3" />
                <div>
                  <div className="text-xl font-bold text-gray-800">200+</div>
                  <div className="text-sm text-gray-600">Proyectos innovadores</div>
                </div>
              </div>
              <div className="bg-purple-100 p-4 rounded-lg flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <div className="text-xl font-bold text-gray-800">30%</div>
                  <div className="text-sm text-gray-600">Crecimiento anual</div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 mt-8 md:mt-0 relative">
            <div className="absolute top-0 right-0 bg-blue-400 rounded-full w-48 h-48 -mt-8 -mr-8 opacity-50"></div>
            <div className="absolute bottom-0 left-0 bg-green-200 rounded-full w-32 h-32 -mb-8 -ml-8 opacity-50"></div>
            <Image 
              src="/lider.jpg" 
              alt="Liderazgo Inspirador" 
              width={500}
              height={400}
              className="rounded-lg shadow-lg object-cover w-full h-auto" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderHero;