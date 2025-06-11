import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { code, clientId, userPoolDomain, redirectUri, region } = await request.json();

  const tokenResponse = await fetch(`https://${userPoolDomain}.auth.${region}.amazoncognito.com/oauth2/token`,  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      code,
      redirect_uri: redirectUri
    })
  });

  if (!tokenResponse.ok) throw new Error('Error obteniendo tokens');

  const tokens = await tokenResponse.json();

  const response = NextResponse.json(tokens);
  response.cookies.set('id_token', tokens.id_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 3600,
    path: '/'
  });

  return response;
}