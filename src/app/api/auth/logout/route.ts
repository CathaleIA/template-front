// app/api/auth/logout/route.ts
import { cookies } from 'next/headers';

export async function GET() {

    const cookieStore = await cookies();

    // ✅ Elimina los tokens de sesión
    cookieStore.delete('id_token');
    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');

    return new Response(null, {
        status: 302,
        headers: {
            Location: '/select-tenant',
        },
    });
}