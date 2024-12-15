'use client'

import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchApi, getApiUrl } from '@/app/lib/api';

interface EmailResponse {
  success: boolean;
  message: string;
}

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'confirmation'>('email');
  
  const router = useRouter();

  const validateEmail = (email: string): boolean => {
    const validDomains = ['@sancor.konecta.ar', '@konecta-group.com'];
    return validDomains.some(domain => email.endsWith(domain));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.includes('@')) {
      setError('Por favor, ingrese un correo electrónico válido.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Por favor, use un correo electrónico con dominio @sancor.konecta.ar o @konecta-group.com');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetchApi(getApiUrl('/api/auth/forgot-password'), {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setStep('confirmation');
      setSuccess('Se ha enviado un enlace de recuperación a su correo electrónico.');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al procesar la solicitud');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError('');
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-[url('/bg-konecta.jpg')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#001933]/90 via-[#001933]/80 to-[#1a1b4b]/90" />

      {/* Logo */}
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

      {/* Form Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl p-8 space-y-6"
      >
        <div className="flex flex-col items-center space-y-2">
          <h1 className="text-2xl font-semibold text-white">
            {step === 'email' ? 'Recuperar contraseña' : 'Revise su correo'}
          </h1>
          <p className="text-gray-300 text-sm text-center">
            {step === 'email' 
              ? 'Ingrese su correo electrónico para recibir instrucciones'
              : 'Siga las instrucciones enviadas a su correo para restablecer su contraseña'
            }
          </p>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="email"
                placeholder="correo@sancor.konecta.ar"
                value={email}
                onChange={handleChange}
                className="pl-10 w-full bg-white/5 border-0 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#00bf9a] rounded-xl h-12"
              />
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
                  <span>Enviar instrucciones</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-[#00bf9a]/20 rounded-xl p-4">
              <p className="text-[#00bf9a] text-sm">
                {success}
              </p>
            </div>
            
            <Button
              type="button"
              onClick={() => router.push('/login')}
              className="w-full h-12 bg-[#00bf9a] hover:bg-[#00d9b0] text-white rounded-xl flex items-center justify-center space-x-2 transition-colors"
            >
              <span>Volver al inicio de sesión</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        )}

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

        <div className="text-center">
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="text-sm text-gray-300 hover:text-white transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al inicio de sesión</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;