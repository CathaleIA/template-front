import { redirect } from 'next/navigation';

async function getAuthStatus() {
  try {
    const response = await fetch(`/api/tenantget`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Esto envía las cookies HttpOnly
      cache: 'no-store', // Para evitar caché en esta verificación crítica
    });

    if (!response.ok) {
      return { isAuthenticated: false, hasTenantConfig: false };
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking auth:', error);
    return { isAuthenticated: false, hasTenantConfig: false };
  }
}

export default async function RootPage() {
  const { isAuthenticated, hasTenantConfig } = await getAuthStatus();

  if (isAuthenticated && hasTenantConfig) {
    redirect('/dashboard');
  } else if (isAuthenticated) {
    redirect('/select-tenant');
  } else {
    redirect('/select-tenant');
    // O podrías redirigir a '/login' si tienes una ruta específica para login
  }
}