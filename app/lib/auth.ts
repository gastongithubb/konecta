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

  // Redirigir al usuario a la página de login después de cerrar sesión
  window.location.href = '/login';
}

export function isAuthenticated() {
  return document.cookie.includes('auth_token=');
}

export async function getUser() {
  const response = await fetch('/api/auth/user', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get user data');
  }

  return response.json();
}