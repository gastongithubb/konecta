// components/Login.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Login = () => {
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
  
      // En Next.js 13+, esto es lo recomendado
      router.refresh();
      
      const dashboardPath = `/dashboard/${data.user.role.toLowerCase()}`;
      router.replace(dashboardPath);
  
    } catch (error) {
      setError('Ocurrió un error durante el inicio de sesión. Por favor, inténtelo de nuevo.');
      console.error('Error de inicio de sesión:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-w-full min-h-screen bg-cover bg-center dark:bg-gray-900" 
         style={{ backgroundImage: 'url("/telefonica.jpeg")' }}>
      <div className="absolute inset-0 bg-black/30 dark:bg-black/50"></div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-md p-8 rounded-xl shadow-lg max-w-md w-full transition-colors">
          <h2 className="text-3xl font-extrabold text-white text-center mb-8">
            Iniciar sesión en su cuenta
          </h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="pl-10 appearance-none block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white/70 dark:bg-gray-700/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Dirección de correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="pl-10 appearance-none block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white/70 dark:bg-gray-700/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded transition-colors"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-white">
                  Recordarme
                </label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar sesión'
              )}
            </Button>
          </form>
          
          {error && (
            <Alert variant="destructive" className="mt-4 bg-red-100/90 dark:bg-red-900/90">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mt-6 text-center">
            <Link 
              href="/register" 
              className="text-sm text-white hover:text-blue-200 dark:hover:text-blue-300 transition-colors"
            >
              ¿No tienes una cuenta? Regístrate aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;