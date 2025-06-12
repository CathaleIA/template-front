// src/app/api/auth/callback/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Necesario para APIs en Next.js

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Manejo de errores
  if (error) {
    return NextResponse.redirect(
      new URL(`/select-tenant?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/select-tenant?error=missing_auth_parameters', request.url)
    );
  }

  try {
    // 1. Parsear el state para obtener la configuración del tenant
    const tenantConfig = JSON.parse(decodeURIComponent(state));
    const { userPoolDomain, clientId, userPoolId } = tenantConfig;
    const region = userPoolId.split('_')[0];

    // 2. Canjear el código por tokens
    const tokenEndpoint = `https://${userPoolDomain}.auth.${region}.amazoncognito.com/oauth2/token`;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;

    const tokenResponse = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${errorText}`);
    }

    const { id_token, access_token, refresh_token, expires_in } = await tokenResponse.json();

    // 3. Crear respuesta de redirección con cookies seguras
    const dashboardUrl = new URL('/dashboard', request.url);
    const response = NextResponse.redirect(dashboardUrl);

    // Configurar cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: expires_in,
      sameSite: 'lax' as const,
    };

    response.cookies.set('id_token', id_token, cookieOptions);
    response.cookies.set('access_token', access_token, cookieOptions);
    
    if (refresh_token) {
      response.cookies.set('refresh_token', refresh_token, {
        ...cookieOptions,
        maxAge: 60 * 60 * 24 * 30, // 30 días para refresh token
      });
    }

    return response;

  } catch (error) {
    console.error('Error en callback:', error);
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    return NextResponse.redirect(
      new URL(`/select-tenant?error=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}