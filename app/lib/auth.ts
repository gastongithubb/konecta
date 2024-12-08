// app/lib/auth.ts

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  teamId: number;
}

export interface UserResponse {
  user: User;
}

export async function login(email: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  return response.json();
}

export async function logoutClient() {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Logout failed');
  }

  window.location.href = '/login';
}

export function isAuthenticated(): boolean {
  try {
    const cookies = document.cookie.split(';');
    const authToken = cookies.find(cookie => 
      cookie.trim().startsWith('auth_token=')
    );
    const token = authToken?.split('=')?.[1];
    return !!token && token !== 'undefined' && token !== 'null';
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

export async function getUser(): Promise<UserResponse> {
  try {
    const response = await fetch('/api/auth/user', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to get user data');
    }

    return response.json();
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
}