import { redirect } from 'next/navigation';


async function getAuthStatus() {
  try {
    // En Next.js Server Components, las URLs deben ser absolutas.
    const { headers } = await import('next/headers');
    const host = (await headers()).get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    const response = await fetch(`${baseUrl}/api/auth/tenantget`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      cache: 'no-store',
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