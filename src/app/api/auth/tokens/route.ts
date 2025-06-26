// app/api/auth/tokens/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('cognito_access_token')?.value;
    const idToken = request.cookies.get('cognito_id_token')?.value;
    const refreshToken = request.cookies.get('cognito_refresh_token')?.value;
    const expiresAt = request.cookies.get('cognito_expires_at')?.value;

    if (!accessToken || !idToken || !refreshToken || !expiresAt) {
      return NextResponse.json({ error: 'No tokens found' }, { status: 401 });
    }

    return NextResponse.json({
      access_token: accessToken,
      id_token: idToken,
      refresh_token: refreshToken,
      expires_at: parseInt(expiresAt),
    });
  } catch (error) {
    console.error('Error getting tokens:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}