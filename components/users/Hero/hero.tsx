'use client';

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import Link from 'next/link';
import ButtonComponent from '../Herramientas/ButtonComponent';

const Banner: React.FC = () => {
  const [userInfo, setUserInfo] = useState<{ name: string; team?: { name: string; teamLeader: string } } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/user-team-info');
        if (response.ok) {
          const data = await response.json();
          setUserInfo(data);
        } else if (response.status === 401) {
          // User is not authenticated
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
      return <p>Cargando...</p>;
    }

    if (!userInfo) {
      return (
        <>
          <h1 className="text-4xl font-bold leading-tight text-[#1e1e1e] md:text-5xl lg:text-6xl">
            Bienvenido <br />
            <span className="text-blue-600">Visitante</span>
          </h1>
          <p className="text-xl font-medium leading-relaxed text-[#1e1e1e]">
            Inicia sesión para ver tu información de equipo
          </p>
        </>
      );
    }

    if (userInfo.team) {
      return (
        <>
          <h1 className="text-4xl font-bold leading-tight text-[#1e1e1e] md:text-5xl lg:text-6xl">
            {userInfo.team.teamLeader} <br />
            <span className="text-blue-600">Team Work</span>
          </h1>
          <p className="text-xl font-medium leading-relaxed text-[#1e1e1e]">
           {userInfo.team.name} - Sancor Salud - Konecta
          </p>
        </>
      );
    } else {
      return (
        <>
          <h1 className="text-4xl font-bold leading-tight text-[#1e1e1e] md:text-5xl lg:text-6xl">
            Bienvenido {userInfo.name} <br />
            <span className="text-blue-600">Futuro Miembro</span>
          </h1>
          <p className="text-xl font-medium leading-relaxed text-[#1e1e1e]">
            Pronto se te agregará a un equipo
          </p>
        </>
      );
    }
  };

  return (
    <div className="container px-4 py-12 mx-auto lg:py-24">
      <div className="relative flex flex-col-reverse items-center md:flex-row" id="hero">
        <div className="md:w-1/2 lg:pr-12">
          <div className="space-y-8 text-left">
            {renderTeamInfo()}
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <Link href="/programacion" className="px-8 py-4 text-lg font-semibold text-center text-white transition duration-300 transform bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl hover:-translate-y-1">
                Programación
              </Link>
              <Link href="/news" className="px-8 py-4 text-lg font-semibold text-center text-blue-400 transition duration-300 transform bg-transparent border-2 border-blue-400 rounded-lg shadow-lg hover:bg-blue-400 hover:text-white hover:shadow-xl hover:-translate-y-1">
                Novedades
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 md:w-1/2 md:mt-0">
          <div className="relative">
            <Image
              src="/Hero.svg"
              width={500}
              height={400}
              alt="Hero"
              className="transition-all duration-300 rounded-lg shadow-2xl filter brightness-110 hover:brightness-125"
            />
            <div className="absolute inset-0 rounded-lg"></div>
          </div>
        </div>
      </div>
      <ButtonComponent />
    </div>
  );
};

export default Banner;