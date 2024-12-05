'use client';

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import Link from 'next/link';
import ButtonComponent from '../Herramientas/ButtonComponent';
import { useTheme } from "next-themes"

const Banner: React.FC = () => {
  const [userInfo, setUserInfo] = useState<{ name: string; team?: { name: string; teamLeader: string } } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/user-team-info');
        if (response.ok) {
          const data = await response.json();
          setUserInfo(data);
        } else if (response.status === 401) {
          setUserInfo(null);
        } else {
          throw new Error('Failed to fetch user info');
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        setUserInfo(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const renderTeamInfo = () => {
    if (isLoading) {
      return <p className="text-gray-600 dark:text-gray-400 animate-pulse">Cargando...</p>;
    }

    if (!userInfo) {
      return (
        <>
          <h1 className="text-4xl font-bold leading-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl transition-colors">
            Bienvenido <br />
            <span className="text-blue-600 dark:text-blue-400 transition-colors">Visitante</span>
          </h1>
          <p className="text-xl font-medium leading-relaxed text-gray-700 dark:text-gray-300 transition-colors">
            Inicia sesión para ver tu información de equipo
          </p>
        </>
      );
    }

    if (userInfo.team) {
      return (
        <>
          <h1 className="text-4xl font-bold leading-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl transition-colors">
            {userInfo.team.teamLeader} <br />
            <span className="text-blue-600 dark:text-blue-400 transition-colors">Team Work</span>
          </h1>
          <p className="text-xl font-medium leading-relaxed text-gray-700 dark:text-gray-300 transition-colors">
            {userInfo.team.name} - Sancor Salud - Konecta
          </p>
        </>
      );
    } else {
      return (
        <>
          <h1 className="text-4xl font-bold leading-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl transition-colors">
            Bienvenido {userInfo.name} <br />
          </h1>
          <p className="text-xl font-medium leading-relaxed text-gray-700 dark:text-gray-300 transition-colors">
            Pronto se te agregará a un equipo
          </p>
        </>
      );
    }
  };

  return (
    <div className="container px-4 py-12 mx-auto lg:py-24 bg-white dark:bg-[#020817] transition-colors">
      <div className="relative flex flex-col-reverse items-center md:flex-row" id="hero">
        <div className="md:w-1/2 lg:pr-12">
          <div className="space-y-8 text-left">
            {renderTeamInfo()}
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <Link 
                href="/news" 
                className="px-8 py-4 text-lg font-semibold text-center 
                  transition-all duration-300 transform 
                  bg-transparent border-2 rounded-lg
                  text-blue-600 dark:text-blue-400 
                  border-blue-600 dark:border-blue-400 
                  hover:bg-blue-600 dark:hover:bg-blue-500 
                  hover:text-white dark:hover:text-white
                  shadow-md dark:shadow-none
                  hover:shadow-lg dark:hover:shadow-blue-500/25 
                  hover:-translate-y-1
                  active:transform active:translate-y-0
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Novedades
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 md:w-1/2 md:mt-0">
          <div className="relative">
            <Image
              src="/Hero.svg"
              width={800}
              height={450}
              alt="Hero"
              className={`transition-all duration-300 rounded-lg
                hover:brightness-110 dark:hover:opacity-100
                shadow-lg dark:shadow-blue-500/10`}
              priority
            />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-transparent to-transparent dark:from-gray-900/10 dark:to-transparent"></div>
          </div>
        </div>
      </div>
      <div className="mt-12 transition-all">
        <ButtonComponent />
      </div>
    </div>
  );
};

export default Banner;