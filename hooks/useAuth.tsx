// hooks/useAuth.ts
import { useEffect, useState } from 'react';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session');

        if (!res.ok) throw new Error('No autorizado');

        const data = await res.json();
        setIsAuthenticated(data.authenticated);
      } catch (error) {
        console.error('Error verificando sesión:', error);
        setIsAuthenticated(false);
      }
    };

    checkSession();
  }, []);

  return { isAuthenticated, isLoading: isAuthenticated === null };
};