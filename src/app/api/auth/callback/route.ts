// app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {

    const cookiesStore = await cookies();
    const code = request.nextUrl.searchParams.get('code');
    const clientId = cookiesStore.get('appClientId')?.value;
    const redirectUri = 'https://localhost:3000/api/auth/callback';
    const region = cookiesStore.get('userPoolId')?.value.split('_')[0] || 'us-east-1';
    const domain = cookiesStore.get('userPoolDomain')?.value;

    if (!code || !clientId || !domain) {
        return new Response('Faltan parámetros', { status: 400 });
    }

    try {
        const tokenResponse = await fetch(`https://${domain}.auth.${region}.amazoncognito.com/oauth2/token`, {
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
            const error = await tokenResponse.text();
            throw new Error(error);
        }

        const tokens = await tokenResponse.json();

        // ✅ Guardar tokens en cookies seguras
        const response = NextResponse.redirect('/dashboard');

        response.cookies.set('id_token', tokens.id_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600,
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Error obteniendo tokens:', error);
        return new Response('Error interno del servidor', { status: 500 });
    }
}