// app/login/page.tsx
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Obtener code desde URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (!code) {
      console.warn('No se recibió el código de autenticación');
      router.push('/select-tenant');
      return;
    }

    // Obtener datos del tenant desde localStorage
    const clientId = localStorage.getItem('appClientId');
    const userPoolDomain = localStorage.getItem('userPoolDomain');
    const userPoolId = localStorage.getItem('userPoolId');
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_SIGN_IN || 'https://appui.d1ajb21hsxi2dm.amplifyapp.com/'; 
    const region = userPoolId?.split('_')[0] || 'us-east-1';

    if (!clientId || !userPoolDomain || !region) {
      console.warn('Faltan datos del tenant', { clientId, userPoolDomain, region });
      router.push('/select-tenant');
      return;
    }

    // Enviar datos al endpoint para intercambiar code por tokens
    fetch('/api/auth/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code,
        clientId,
        userPoolDomain,
        redirectUri,
        region
      })
    })
      .then(res => res.json())
      .then(tokens => {
        // ✅ Guarda token en localStorage (temporal hasta que puedas usar cookies)
        localStorage.setItem('id_token', tokens.id_token);
        // ✅ Redirige al dashboard
        router.push('/dashboard');
      })
      .catch(err => {
        console.error('Error obteniendo tokens:', err);
        router.push('/select-tenant');
      });

  }, [router]);

  // No hay UI – solo proceso automático
  return null;
}