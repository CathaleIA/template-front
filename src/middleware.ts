// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path === '/select-tenant') {
    return NextResponse.next();
  }

  // 🔐 Solo protegemos rutas que comienzan con /dashboard
  if (path.startsWith('/dashboard')) {
    const idToken = request.cookies.get('id_token')?.value;

    if (!idToken) {
      return NextResponse.redirect(new URL('/select-tenant', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|static|api|sign-in|select-tenant).*)'],
};