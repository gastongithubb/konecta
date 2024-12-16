'use client'

import React, { useState, useEffect } from 'react';
import { Camera, User, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import imageLoader from '@/app/lib/image-loader';
import { profileService } from '@/app/lib/profile';
import { getUser } from '@/app/lib/auth';
import { toast } from 'react-hot-toast';
import ChangePasswordForm from './ChangePasswordForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateSession } from '@/app/SessionProvider';

interface ProfileState {
  name: string;
  email: string;
  role: string;
  teamId: number;
  avatarUrl?: string | null;
}

const PerfilUsuario: React.FC = () => {
  const router = useRouter();
  const updateSession = useUpdateSession();
  const [profile, setProfile] = useState<ProfileState>({
    name: '',
    email: '',
    role: '',
    teamId: 0,
    avatarUrl: null
  });
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState('');
  const [updatingAvatar, setUpdatingAvatar] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { user } = await getUser();
        setProfile({
          name: user.name,
          email: user.email,
          role: user.role,
          teamId: user.teamId,
          avatarUrl: user.avatarUrl
        });
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        toast.error('Error al cargar datos del usuario');
      }
    };

    loadUserData();
  }, []);

  const handleAvatarClick = () => {
    setIsAvatarDialogOpen(true);
    setPreviewError(false);
    setNewAvatarUrl('');
  };

  const validateImageUrl = (url: string): boolean => {
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    try {
      const urlObj = new URL(url);
      return validExtensions.some(ext => urlObj.pathname.toLowerCase().endsWith(ext));
    } catch {
      return false;
    }
  };

  const handleAvatarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAvatarUrl) return;
  
    try {
      setUpdatingAvatar(true);
      const response = await fetch('/api/profile/update-avatar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ avatarUrl: newAvatarUrl }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el avatar');
      }
  
      const data = await response.json();
      
      setProfile(prev => ({ ...prev, avatarUrl: data.avatarUrl }));
      setIsAvatarDialogOpen(false);
      setNewAvatarUrl('');
      setPreviewError(false);
      
      await updateSession();
      
      window.dispatchEvent(new Event('storage'));
      
      toast.success('Avatar actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar avatar:', error);
      toast.error(error instanceof Error ? error.message : 'Error al actualizar avatar');
    } finally {
      setUpdatingAvatar(false);
    }
  };

  const handleNewAvatarUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAvatarUrl(e.target.value);
    setPreviewError(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Perfil de Usuario
          </h1>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6 space-y-6">
            <div className="space-y-8">
              {/* Sección Avatar */}
              <div className="flex flex-col items-center space-y-4">
                <div 
                  className="relative group cursor-pointer"
                  onClick={handleAvatarClick}
                >
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    {profile.avatarUrl ? (
                      <Image 
                        loader={imageLoader}
                        src={profile.avatarUrl} 
                        alt="Perfil"
                        width={128}
                        height={128}
                        className="object-cover"
                        priority
                        onError={(e: any) => {
                          e.currentTarget.src = '/api/placeholder/128/128';
                        }}
                      />
                    ) : (
                      <User className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Haz clic para cambiar el avatar
                </p>
              </div>

              {/* Campos del Formulario */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nombre
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={profile.name}
                    disabled
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-gray-50 dark:bg-gray-600 dark:text-gray-300 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-gray-50 dark:bg-gray-600 dark:text-gray-300 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Rol
                  </label>
                  <input
                    id="role"
                    type="text"
                    value={profile.role}
                    disabled
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-gray-50 dark:bg-gray-600 dark:text-gray-300 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección Cambio de Contraseña */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
              Cambiar Contraseña
            </h2>
            <ChangePasswordForm />
          </div>
        </div>

        {/* Diálogo de URL del Avatar */}
        <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Actualizar Avatar</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAvatarSubmit} className="space-y-6">
              {/* Sección Avatar Actual */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  URL del Avatar Actual
                </label>
                <Input
                  type="text"
                  value={profile.avatarUrl || ''}
                  disabled
                  className="bg-gray-50 dark:bg-gray-700"
                />
              </div>

              {/* Sección Nuevo Avatar */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    URL del Nuevo Avatar
                  </label>
                  <Input
                    type="url"
                    placeholder="Ingresa la URL de la nueva imagen"
                    value={newAvatarUrl}
                    onChange={handleNewAvatarUrlChange}
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Ingresa una URL directa de imagen (.jpg, .jpeg, .png, .gif, .webp)
                  </p>
                </div>

                {/* Sección Vista Previa */}
                {newAvatarUrl && !previewError && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Vista Previa
                    </label>
                    <div className="flex justify-center">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center relative">
                        <Image
                          loader={imageLoader}
                          src={newAvatarUrl}
                          alt="Vista Previa del Avatar"
                          width={128}
                          height={128}
                          className="object-cover"
                          onError={() => {
                            setPreviewError(true);
                            toast.error('Error al cargar la vista previa. Por favor verifica la URL');
                          }}
                          priority
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsAvatarDialogOpen(false);
                    setNewAvatarUrl('');
                    setPreviewError(false);
                  }}
                  disabled={updatingAvatar}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={updatingAvatar || !newAvatarUrl || previewError}
                >
                  {updatingAvatar ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Actualizando...</span>
                    </div>
                  ) : (
                    'Actualizar Avatar'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PerfilUsuario;