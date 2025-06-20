// src/middleware.ts

import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas públicas que no requieren autenticación
  const isPublicPath = pathname === '/select-tenant'

  // Cookies necesarias
  const requiredCookies = [
    'cognito_access_token',
    'cognito_id_token',
    'cognito_refresh_token',
    'cognito_expires_at',
  ]

  // Verifica si todas las cookies están presentes
  const cookiesPresent = requiredCookies.every((cookieName) =>
    request.cookies.has(cookieName)
  )

  // Si es una ruta pública o las cookies están presentes, continuar
  if (isPublicPath || cookiesPresent) {
    return NextResponse.next()
  }

  // Si no hay cookies y no es pública, redirigir a /select-tenant
  const loginUrl = new URL('/select-tenant', request.url)
  return NextResponse.redirect(loginUrl)
}

// Aplica el middleware a todas las rutas excepto APIs y archivos estáticos
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
}