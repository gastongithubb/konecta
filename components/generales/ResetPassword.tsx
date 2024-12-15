'use client'

import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { getApiUrl } from '@/app/lib/api';

interface ResetPasswordData {
  password: string;
  confirmPassword: string;
}

const ResetPassword = () => {
  const [formData, setFormData] = useState<ResetPasswordData>({
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Token no proporcionado');
        setIsValidToken(false);
        return;
      }

      try {
        const response = await fetch(getApiUrl('/api/auth/check-reset-token'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        setIsValidToken(data.valid);
        
        if (!data.valid) {
          setError(data.error || 'Token inválido o expirado');
        }
      } catch (error) {
        console.error('Error verificando token:', error);
        setError('Error al verificar el token');
        setIsValidToken(false);
      }
    };

    verifyToken();
  }, [token]);

  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Token no proporcionado');
      return;
    }

    if (!validatePassword(formData.password)) {
      setError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl('/api/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al restablecer la contraseña');
      }

      setSuccess('Contraseña restablecida exitosamente.');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al restablecer la contraseña');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isValidToken === null) {
    return (
      <div className="min-h-screen w-full relative flex flex-col items-center justify-center p-4">
        <div className="absolute inset-0 bg-[url('/bg-konecta.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#001933]/90 via-[#001933]/80 to-[#1a1b4b]/90" />
        <div className="relative">
          <div className="w-8 h-8 border-t-2 border-white rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Invalid token state
  if (isValidToken === false) {
    return (
      <div className="min-h-screen w-full relative flex flex-col items-center justify-center p-4">
        <div className="absolute inset-0 bg-[url('/bg-konecta.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#001933]/90 via-[#001933]/80 to-[#1a1b4b]/90" />
        
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative mb-12"
        >
          <div className="bg-[#001933] rounded-lg p-3">
            <div className="flex items-center space-x-1">
              <span className="text-white text-3xl font-bold">K</span>
              <span className="text-[#00bf9a] text-3xl font-bold">!</span>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl p-8 space-y-6"
        >
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          <Button
            onClick={() => router.push('/forgot-password')}
            className="w-full h-12 bg-[#00bf9a] hover:bg-[#00d9b0] text-white rounded-xl flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Solicitar nuevo enlace</span>
          </Button>
        </motion.div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('/bg-konecta.jpg')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#001933]/90 via-[#001933]/80 to-[#1a1b4b]/90" />

      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="relative mb-12"
      >
        <div className="bg-[#001933] rounded-lg p-3">
          <div className="flex items-center space-x-1">
            <span className="text-white text-3xl font-bold">K</span>
            <span className="text-[#00bf9a] text-3xl font-bold">!</span>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl p-8 space-y-6"
      >
        <div className="flex flex-col items-center space-y-2">
          <h1 className="text-2xl font-semibold text-white">
            Restablecer contraseña
          </h1>
          <p className="text-gray-300 text-sm text-center">
            Ingrese su nueva contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Nueva contraseña"
                value={formData.password}
                onChange={handleChange}
                className="pl-10 w-full bg-white/5 border-0 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#00bf9a] rounded-xl h-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirmar contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="pl-10 w-full bg-white/5 border-0 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#00bf9a] rounded-xl h-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#00bf9a] hover:bg-[#00d9b0] text-white rounded-xl flex items-center justify-center space-x-2 transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" />
                <span>Procesando...</span>
              </div>
            ) : (
              <>
                <span>Restablecer contraseña</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>
        </form>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert className="mt-4 bg-[#00bf9a]/20 text-[#00bf9a] border-[#00bf9a]/30">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        <div className="space-y-2">
          <p className="text-sm text-gray-400">La contraseña debe contener:</p>
          <ul className="text-sm text-gray-400 list-disc list-inside space-y-1">
            <li>Al menos 8 caracteres</li>
            <li>Al menos una letra mayúscula</li>
            <li>Al menos una letra minúscula</li>
            <li>Al menos un número</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;