'use client'

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FormData {
  name: string;
  email: string;
  password: string;
}

interface UserResponse {
  user: {
    role: string;
  };
}

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();

  const validateEmail = (email: string): boolean => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'email' && !isLogin) {
      setIsEmailValid(false);
      setError('');
      if (value.endsWith('@sancor.konecta.ar')) {
        try {
          const response = await fetch('/api/auth/check-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: value }),
          });
          const data: { exists: boolean } = await response.json();
          setIsEmailValid(!data.exists);
          if (data.exists) {
            setError('Este correo electrónico ya está registrado.');
          }
        } catch (err) {
          console.error('Error checking email:', err);
          setError('Error al verificar el correo electrónico.');
        }
      } else {
        setError('Por favor, use un correo electrónico con dominio @sancor.konecta.a');
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (isLogin) {
      // Login logic
      if (!validateEmail(formData.email) || !formData.password) {
        setError('Por favor, complete todos los campos correctamente.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: formData.email, 
            password: formData.password 
          }),
        });

        const data: UserResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.user?.role || 'Error en el inicio de sesión');
        }

        router.refresh();
        router.replace(`/dashboard/${data.user.role.toLowerCase()}`);
      } catch (error) {
        setError('Ocurrió un error durante el inicio de sesión. Por favor, inténtelo de nuevo.');
        console.error('Error de inicio de sesión:', error);
      }
    } else {
      // Register logic
      if (!isEmailValid) {
        setError('Por favor, use un correo electrónico válido y no registrado.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, role: 'user' }),
        });

        if (!response.ok) {
          const errorData: { error: string } = await response.json();
          throw new Error(errorData.error || 'Error al registrarse');
        }

        setSuccess('Registro exitoso. Ya puede iniciar sesión.');
        setFormData({ name: '', email: '', password: '' });
        setIsLogin(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al registrarse');
      }
    }
    setIsLoading(false);
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setFormData({ name: '', email: '', password: '' });
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
            {isLogin ? 'Bienvenido de nuevo' : 'Crear cuenta'}
          </h1>
          <p className="text-gray-300 text-sm">
            {isLogin 
              ? 'Ingrese sus credenciales para acceder a su cuenta'
              : 'Complete el formulario para registrarse'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            {/* Name field - only show for register */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative"
                >
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Nombre y Apellido"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10 w-full bg-white/5 border-0 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#00bf9a] rounded-xl h-12"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="email"
                name="email"
                placeholder={isLogin ? "nombre@sancor.konecta.a" : "correo@sancor.konecta.a"}
                value={formData.email}
                onChange={handleChange}
                className={`pl-10 w-full bg-white/5 border-0 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#00bf9a] rounded-xl h-12 ${
                  !isLogin && isEmailValid ? 'border-[#00bf9a]' : ''
                }`}
              />
            </div>

            {/* Password field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••••"
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
          </div>

          {/* Forgot password link - only show for login */}
          {isLogin && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => router.push('/forgot-password')}
                className="text-sm text-[#00bf9a] hover:text-[#00d9b0] transition-colors"
              >
                ¿Olvidó su contraseña?
              </button>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || (!isLogin && !isEmailValid)}
            className="w-full h-12 bg-[#00bf9a] hover:bg-[#00d9b0] text-white rounded-xl flex items-center justify-center space-x-2 transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" />
                <span>{isLogin ? 'Iniciando sesión...' : 'Registrando...'}</span>
              </div>
            ) : (
              <>
                <span>{isLogin ? 'Iniciar sesión' : 'Crear cuenta'}</span>
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
            <Alert variant="destructive" className="mt-4">
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

        <div className="text-center">
          <button
            type="button"
            onClick={toggleForm}
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            {isLogin ? (
              <>¿No tiene una cuenta? <span className="text-[#00bf9a] hover:text-[#00d9b0]">Regístrese aquí</span></>
            ) : (
              <>¿Ya tiene una cuenta? <span className="text-[#00bf9a] hover:text-[#00d9b0]">Inicie sesión aquí</span></>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthForm;