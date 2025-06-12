// src/app/api/auth/callback/route.ts


import { NextResponse } from 'next/server';


export async function GET(request: Request) {
  const url = new URL(request.url);
  console.log('Callback recibido con estos parámetros:', url.searchParams.toString());

  return NextResponse.json({ 
    status: '¡Esta ruta solo debe ser llamada por Cognito!',
    params: Object.fromEntries(url.searchParams.entries())
  });
}
