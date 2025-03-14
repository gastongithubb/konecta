'use client'

import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'email') {
      setIsEmailValid(false);
      setError('');
      if (value) {
        try {
          const response = await fetch('/api/auth/check-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: value }),
          });
          const data = await response.json();
          setIsEmailValid(data.exists);
          if (!data.exists) {
            setError('El correo electrónico no está autorizado para registrarse.');
          }
        } catch (err) {
          console.error('Error checking email:', err);
          setError('Error al verificar el correo electrónico.');
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailValid) {
      setError('Por favor, use un correo electrónico autorizado.');
      return;
    }
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'user' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al registrarse');
      }

      setSuccess('Registro exitoso. Por favor, inicia sesión.');
      setFormData({ name: '', email: '', password: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
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
            Registro de Usuario
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white">Nombre</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="name"
                className="bg-white/50 text-gray-900 placeholder-gray-500"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-white">Correo electrónico</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className={`bg-white/50 text-gray-900 placeholder-gray-500 ${
                  isEmailValid ? 'border-green-500' : formData.email ? 'border-red-500' : ''
                }`}
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-white">Contraseña</Label>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="bg-white/50 text-gray-900 placeholder-gray-500"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={isLoading || !isEmailValid}
            >
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </Button>
          </form>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert variant="default" className="mt-4 bg-green-100 text-green-800 border-green-300">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;