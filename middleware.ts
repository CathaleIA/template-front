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

  // Verificar autenticación
  const accessToken = request.cookies.get("cognito_access_token")
  const idToken = request.cookies.get("cognito_id_token")
  const expiresAt = request.cookies.get("cognito_expires_at")

  const isAuthenticated = accessToken && idToken && expiresAt && Date.now() < Number.parseInt(expiresAt.value)

  // MANEJAR LA RUTA RAÍZ
  if (pathname === "/") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    } else {
      return NextResponse.redirect(new URL("/select-tenant", request.url))
    }
  }

  // Rutas que requieren autenticación
  const protectedPaths = ["/dashboard", "/profile", "/settings"]
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))

  if (isProtectedPath && !isAuthenticated) {
    return NextResponse.redirect(new URL("/select-tenant", request.url))
  }

  // Si está autenticado y trata de acceder a rutas de auth, redirigir al dashboard
  if (pathname.startsWith("/auth") && pathname !== "/select-tenant" && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
