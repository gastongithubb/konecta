// app/components/Login.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const validateForm = () => {
    if (!email || !password) {
      setError('Por favor, complete todos los campos.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor, ingrese un correo electrónico válido.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
  
    if (!validateForm()) return;
  
    setIsLoading(true);
  
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Error en el inicio de sesión');
      }
  
      // Guardamos el refresh token en localStorage
      localStorage.setItem('refreshToken', data.refreshToken);
  
      // Redirige basado en el rol
      switch (data.user.role) {
        case 'manager':
          router.push('/dashboard/manager');
          break;
        case 'team_leader':
          router.push('/dashboard/team_leader');
          break;
        case 'user':
          router.push('/dashboard/user');
          break;
        default:
          setError('Rol de usuario no reconocido');
      }
    } catch (error) {
      setError('Ocurrió un error durante el inicio de sesión. Por favor, inténtelo de nuevo.');
      console.error('Error de inicio de sesión:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-w-full min-h-screen bg-cover bg-center" style={{ backgroundImage: 'url("/telefonica.jpeg")' }}>
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="bg-white/30 backdrop-blur-md p-8 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-3xl font-extrabold text-white text-center mb-6">
            Iniciar sesión en su cuenta
          </h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm">
              <div className="mb-4">
                <label htmlFor="email-address" className="sr-only">
                  Dirección de correo electrónico
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Dirección de correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-white">
                  Recordarme
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </div>
          </form>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="mt-6 text-center">
            <Link href="/register" className="text-sm text-white hover:text-indigo-200">
              ¿No tienes una cuenta? Regístrate aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;