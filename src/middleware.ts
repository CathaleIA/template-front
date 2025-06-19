import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // EXCLUIR completamente las rutas de API del middleware
  if (pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // EXCLUIR /select-tenant para evitar loops
  if (pathname === "/select-tenant") {
    return NextResponse.next()
  }

  // Rutas que requieren autenticación
  const protectedPaths = ["/dashboard", "/profile", "/settings"]

  // Verificar si la ruta actual está protegida
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))

  // Si es una ruta protegida, verificar autenticación
  if (isProtectedPath) {
    const accessToken = request.cookies.get("cognito_access_token")
    const idToken = request.cookies.get("cognito_id_token")
    const expiresAt = request.cookies.get("cognito_expires_at")

    // Si no hay tokens, redirigir a select-tenant
    if (!accessToken || !idToken || !expiresAt) {
      return NextResponse.redirect(new URL("/select-tenant", request.url))
    }

    // Verificar si el token ha expirado
    const now = Date.now()
    const expirationTime = Number.parseInt(expiresAt.value)

    if (now >= expirationTime) {
      return NextResponse.redirect(new URL("/select-tenant", request.url))
    }
  }

  // Si está autenticado y trata de acceder a rutas de auth, redirigir al dashboard
  if (pathname.startsWith("/auth") && pathname !== "/select-tenant") {
    const accessToken = request.cookies.get("cognito_access_token")
    const expiresAt = request.cookies.get("cognito_expires_at")

    if (accessToken && expiresAt && Date.now() < Number.parseInt(expiresAt.value)) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}