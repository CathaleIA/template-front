// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('cognito_refresh_token')?.value;
    const userPoolDomain = request.cookies.get('userPoolDomain')?.value;
    const clientId = request.cookies.get('appClientId')?.value;
    const userPoolId = request.cookies.get('userPoolId')?.value;

    if (!refreshToken || !userPoolDomain || !clientId || !userPoolId) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    const region = userPoolId.split('_')[0] || 'us-east-1';
    const cognitoTokenEndpoint = `https://${userPoolDomain}.auth.${region}.amazoncognito.com/oauth2/token`;

    const response = await fetch(cognitoTokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Token refresh failed: ${errorText}` },
        { status: 400 }
      );
    }

    const tokens = await response.json();
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    const nextResponse = NextResponse.json({ success: true });

    // Actualizar cookies con nuevos tokens
    nextResponse.cookies.set('cognito_access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    if (tokens.id_token) {
      nextResponse.cookies.set('cognito_id_token', tokens.id_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresAt,
        path: '/',
      });
    }

    nextResponse.cookies.set('cognito_expires_at', expiresAt.getTime().toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    return nextResponse;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}