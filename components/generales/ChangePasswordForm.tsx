'use client'
import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PasswordInput: React.FC<{
  id: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  label: string;
}> = ({ id, value, onChange, placeholder, label }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </Label>
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className="pr-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
};

const ChangePasswordForm: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (newPassword !== confirmPassword) {
      setError('Las nuevas contraseñas no coinciden');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
        credentials: 'include',
      });

      if (response.ok) {
        setSuccess('Contraseña cambiada exitosamente');
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        const data = await response.json();
        setError(data.error || 'Error al cambiar la contraseña');
      }
    } catch (error) {
      setError('Error de red al intentar cambiar la contraseña');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
  };

  return (
    <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
          <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Cambiar Contraseña
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <PasswordInput
          id="currentPassword"
          value={currentPassword}
          onChange={handleInputChange(setCurrentPassword)}
          placeholder="Ingrese su contraseña actual"
          label="Contraseña actual"
        />
        
        <PasswordInput
          id="newPassword"
          value={newPassword}
          onChange={handleInputChange(setNewPassword)}
          placeholder="Ingrese su nueva contraseña"
          label="Nueva contraseña"
        />
        
        <PasswordInput
          id="confirmPassword"
          value={confirmPassword}
          onChange={handleInputChange(setConfirmPassword)}
          placeholder="Confirme su nueva contraseña"
          label="Confirmar nueva contraseña"
        />

        {error && (
          <div className="p-3 rounded bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="p-3 rounded bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Cambiando contraseña...' : 'Cambiar contraseña'}
        </Button>
      </form>
    </Card>
  );
};

export default ChangePasswordForm;