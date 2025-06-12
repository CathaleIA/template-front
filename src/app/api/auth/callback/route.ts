import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const appDomain = 'https://appui.d1ajb21hsxi2dm.amplifyapp.com';  // Dominio seguro

  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');

  if (error) {
    return NextResponse.redirect(`${appDomain}/select-tenant?error=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${appDomain}/select-tenant?error=missing_auth_parameters`);
  }

  try {
    // Parsear state
    const decodedState = JSON.parse(decodeURIComponent(state));
    const { userPoolDomain, clientId, userPoolId } = decodedState;
    const region = userPoolId.split('_')[0];

    // Construir redirect_uri
    const redirectUri = `${appDomain}/api/auth/callback`;

    // Intercambiar code por tokens
    const tokenEndpoint = `https://${userPoolDomain}.auth.${region}.amazoncognito.com/oauth2/token`; 

    const response = await fetch(tokenEndpoint, {
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

    if (!response.ok) {
      const text = await response.text();
      console.error('Error obteniendo tokens:', text); // Loguea detalles del error
      throw new Error(`Token exchange failed: ${text}`);
    }

    const tokens = await response.json();

    // Redirigir al dashboard con tokens en cookies
    const nextResponse = NextResponse.redirect(`${appDomain}/dashboard`);

    nextResponse.cookies.set('id_token', tokens.id_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 semana
    });

    nextResponse.cookies.set('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return nextResponse;

  } catch (err) {
    console.error('Error en callback:', err);
    return NextResponse.redirect(`${appDomain}/select-tenant?error=auth_failed`);
  }
}