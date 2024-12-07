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

export async function getUser(): Promise<UserResponse> {
  const response = await fetch('/api/auth/user', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get user data');
  }

  return response.json();
}

export function isAuthenticated(): boolean {
  try {
    return document.cookie.includes('auth_token=');
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}