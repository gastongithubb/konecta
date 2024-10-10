// app/utils/auth.ts
export async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      // Si no hay refresh token, redirigir al login
      window.location.href = '/login';
      return null;
    }
  
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }
  
      const { accessToken } = await response.json();
      return accessToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Si falla la renovación, redirigir al login
      window.location.href = '/login';
      return null;
    }
  }