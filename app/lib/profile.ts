// app/lib/profile.ts
import { User } from './auth';

export interface UpdateProfileData {
  name: string;
}

interface ProfileResponse {
  user: User;
}

class ProfileServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProfileServiceError';
  }
}

export const profileService = {
  updateProfile: async (data: UpdateProfileData): Promise<ProfileResponse> => {
    try {
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ProfileServiceError(
          errorData.error || 'Error actualizando el perfil'
        );
      }

      const profileData = await response.json();
      return profileData;
    } catch (error) {
      if (error instanceof ProfileServiceError) {
        throw error;
      }
      throw new ProfileServiceError('Error en el servicio de perfil');
    }
  },

  // Si necesitas obtener el perfil específicamente (aunque ya tienes getUser en auth.ts)
  getProfile: async (): Promise<ProfileResponse> => {
    try {
      const response = await fetch('/api/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ProfileServiceError(
          errorData.error || 'Error obteniendo el perfil'
        );
      }

      const profileData = await response.json();
      return profileData;
    } catch (error) {
      if (error instanceof ProfileServiceError) {
        throw error;
      }
      throw new ProfileServiceError('Error en el servicio de perfil');
    }
  }
};

// Exportamos también los tipos para uso en otros componentes
export type { ProfileResponse };