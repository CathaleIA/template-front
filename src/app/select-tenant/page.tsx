// app/select-tenant/page.tsx
'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { setTenantConfig } from '@/utils/save-tenant';

export default function SelectTenantPage() {
  const router = useRouter();
  const [tenant, setTenant] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Si ya tenemos los datos del tenant → redirige directamente a Cognito
  useEffect(() => {
    const userPoolDomain = localStorage.getItem('userPoolDomain');
    const clientId = localStorage.getItem('appClientId');

    if (userPoolDomain && clientId) {
      const region = localStorage.getItem('userPoolId')?.split('_')[0] || 'us-east-1';
      const redirectUri = 'https://appui.d1ajb21hsxi2dm.amplifyapp.com/dashboard';
      // const redirectUri = 'localhost:3000/api/auth/callback/'; // Cambia esto al URL de tu aplicación
      const scope = 'email+openid+profile';

      const cognitoLoginUrl = `https://${userPoolDomain}.auth.${region}.amazoncognito.com/login?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;

      window.location.href = cognitoLoginUrl;
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!tenant.trim()) {
      setError('Por favor ingresa el nombre de tu empresa');
      setLoading(false);
      return;
    }

    try {
      await setTenantConfig(tenant.trim());

      // ✅ En lugar de redirigir a /login, vamos directo a Cognito
      const userPoolDomain = localStorage.getItem('userPoolDomain');
      const clientId = localStorage.getItem('appClientId');

      if (!userPoolDomain || !clientId) {
        throw new Error('Faltan datos después de configurar el tenant');
      }

      const region = localStorage.getItem('userPoolId')?.split('_')[0] || 'us-east-1';
      const redirectUri = 'https://appui.d1ajb21hsxi2dm.amplifyapp.com/dashboard'; // Cambia esto al URL de tu aplicación
      // const redirectUri = 'localhost:3000/api/auth/callback/'; // Cambia esto al URL de tu aplicación
      const scope = 'email+openid+profile';

      const cognitoLoginUrl = `https://${userPoolDomain}.auth.${region}.amazoncognito.com/login?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;

      window.location.href = cognitoLoginUrl;

    } catch (err: any) {
      console.error('Error seleccionando empresa:', err);
      setError('Empresa no encontrada. Verifica el nombre e inténtalo nuevamente.');
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="w-full max-w-md p-6 rounded-lg shadow-lg bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] animate-accordion-down">
        <h2 className="text-2xl font-bold mb-4 text-center">Selecciona tu empresa</h2>
        <p className="mb-6 text-sm text-center text-[hsl(var(--muted-foreground)]">
          Ingresa el nombre de tu organización para continuar
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tenant" className="block text-sm font-medium mb-1">Nombre de la Empresa</label>
            <input
              id="tenant"
              type="text"
              value={tenant}
              onChange={(e) => setTenant(e.target.value)}
              placeholder="Ej: Copower"
              className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !tenant.trim()}
            className={`w-full py-2 px-4 rounded-md text-white font-semibold transition-colors ${loading || !tenant.trim()
                ? 'bg-[hsl(var(--secondary))] cursor-not-allowed'
                : 'bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/90%)]'
              }`}
          >
            {loading ? 'Cargando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}