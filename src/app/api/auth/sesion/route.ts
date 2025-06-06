// app/api/auth/session/route.ts
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const idToken = request.cookies.get('id_token')?.value;

  if (!idToken) {
    return Response.json({ authenticated: false });
  }

  try {
    const region = request.cookies.get('userPoolId')?.value.split('_')[0];
    const domain = request.cookies.get('userPoolDomain')?.value;

    const userInfoRes = await fetch(`https://${domain}.auth.${region}.amazoncognito.com/oauth2/userInfo`,  {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!userInfoRes.ok) {
      return Response.json({ authenticated: false });
    }

    const user = await userInfoRes.json();

    return Response.json({
      authenticated: true,
      user,
    });
  } catch (err) {
    console.error('Error al validar sesión:', err);
    return Response.json({ authenticated: false });
  }
}