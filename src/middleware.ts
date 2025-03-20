// src/middleware.ts
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { NextRequest, NextResponse } from 'next/server';
import { runWithAmplifyServerContext } from '@/utils/amplify-utils';
export async function middleware(request: NextRequest) {
    // console.log('Middleware ejecutándose para:', request.url);
    // Excluir la ruta principal ("/") de la verificación de autenticación
    if (request.nextUrl.pathname === '/') {
        return NextResponse.next();
    }
    const response = NextResponse.next();
    const authenticated = await runWithAmplifyServerContext({
        nextServerContext: { request, response },
        operation: async (contextSpec) => {
            try {
                const session = await fetchAuthSession(contextSpec);
                // console.log('Sesión:', session);
                return (
                    session.tokens?.accessToken !== undefined &&
                    session.tokens?.idToken !== undefined
                );
            } catch (error) {
                console.log('Error en fetchAuthSession:', error);
                return false;
            }
        }
    });
    // console.log('Usuario autenticado:', authenticated);
    if (authenticated) {
        return response;
    }
    return NextResponse.redirect(new URL('/api/auth/sign-in', request.url));
}

export const config = {
    matcher: [
        /*
        * Match all request paths except for the ones starting with:
        * - api (API routes)
        * - _next/static (static files)
        * - _next/image (image optimization files)
        * - favicon.ico (favicon file)
        * - sign-in (página de inicio de sesión)
        */
        '/((?!api|_next/static|_next/image|favicon.ico|sign-in|assets/).*)',
    ],
};
