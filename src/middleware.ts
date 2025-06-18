import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Rutas que requieren autenticación
  const protectedPaths = ["/dashboard", "/profile", "/settings"]
  
  // Rutas públicas que no requieren autenticación
  const publicPaths = ["/select-tenant", "/auth", "/api/auth"]
  
  // Verificar si la ruta actual está protegida
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))
  
  console.log("Middleware - Pathname:", pathname)
  console.log("Middleware - Is Protected:", isProtectedPath)
  console.log("Middleware - Is Public:", isPublicPath)
  
  // Si es una ruta protegida, verificar autenticación
  if (isProtectedPath) {
    const accessToken = request.cookies.get("cognito_access_token")
    const idToken = request.cookies.get("cognito_id_token")
    const expiresAt = request.cookies.get("cognito_expires_at")
    
    console.log("Middleware - Tokens:", {
      hasAccessToken: !!accessToken,
      hasIdToken: !!idToken,
      hasExpiresAt: !!expiresAt,
      expiresAtValue: expiresAt?.value
    })
    
    // Si no hay tokens o han expirado, redirigir a select-tenant
    if (!accessToken || !idToken || !expiresAt) {
      console.log("Middleware - Missing tokens, redirecting to /select-tenant")
      return NextResponse.redirect(new URL("/select-tenant", request.url))
    }
    
    // Verificar si el token ha expirado
    const now = Date.now()
    const expirationTime = Number.parseInt(expiresAt.value)
    
    if (now >= expirationTime) {
      console.log("Middleware - Token expired, redirecting to /select-tenant")
      return NextResponse.redirect(new URL("/select-tenant", request.url))
    }
  }
  
  // Si está autenticado y trata de acceder a páginas de auth (excepto select-tenant), redirigir al dashboard
  if (pathname.startsWith("/auth") && pathname !== "/select-tenant") {
    const accessToken = request.cookies.get("cognito_access_token")
    const expiresAt = request.cookies.get("cognito_expires_at")
    
    if (accessToken && expiresAt && Date.now() < Number.parseInt(expiresAt.value)) {
      console.log("Middleware - User authenticated, redirecting from auth to /dashboard")
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }
  
  // Manejar la ruta raíz "/" - permitir que pase al componente que hace redirect
  if (pathname === "/") {
    console.log("Middleware - Root path, allowing through for server-side redirect")
    return NextResponse.next()
  }
  
  console.log("Middleware - Allowing request to continue")
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) - pero permitimos /api/auth
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}