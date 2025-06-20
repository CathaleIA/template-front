import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, search, origin } = request.nextUrl
  
  // LOGS DE DEBUGGING - Aparecen en la TERMINAL del servidor
  console.log('🚀 MIDDLEWARE EJECUTÁNDOSE')
  console.log('📍 Pathname:', pathname)
  console.log('🔍 Search params:', search)
  console.log('🌐 Origin:', origin)
  console.log('📱 User Agent:', request.headers.get('user-agent')?.slice(0, 50))
  
  // Solo permitimos acceso a /select-tenant
  if (pathname === '/select-tenant') {
    console.log('✅ PERMITIENDO acceso a /select-tenant')
    return NextResponse.next()
  }
  
  // Para debugging: mostrar todas las redirecciones
  console.log('🚫 BLOQUEANDO y REDIRIGIENDO desde:', pathname)
  console.log('➡️  Redirigiendo a: /select-tenant')
  
  const redirectUrl = new URL('/select-tenant', request.url)
  console.log('🔗 URL de redirección completa:', redirectUrl.toString())
  
  return NextResponse.redirect(redirectUrl)
}

// Matcher simplificado para debugging
export const config = {
  matcher: [
    // Excluir archivos estáticos y Next.js internals
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
}

// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'

// export function middleware(request: NextRequest) {
//   console.log('Middleware ejecutándose para:', request.nextUrl.pathname)

//   const pathname = request.nextUrl.pathname

//   if (pathname !== '/select-tenant') {
//     const url = request.nextUrl.clone()
//     url.pathname = '/select-tenant'
//     return NextResponse.redirect(url)
//   }

//   return NextResponse.next()
// }

// export const config = {
//   matcher: '/:path*', // Esto incluye "/"
// }