// Funciones de utilidad para el cliente

export function isAuthenticated() {
  return document.cookie.includes('auth_token=');
}

export function logout() {
  document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
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

// Puedes agregar más funciones relacionadas con la autenticación del lado del cliente aquí