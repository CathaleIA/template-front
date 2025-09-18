/*Componente del lado del sevirdor
Se usa para que los componente del lado del servidor puedan conocer quien esta logado
Para componentes del lado del cliente se usa el hook*/

import { cookies } from "next/headers"

function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return {};
  }
}

export async function getUserFromToken(): Promise<{
  userRole?: string
  username?: string
  payload?: any
} | null> {
  const cookieStore = await cookies() // ✅ usar await si cookies() es async en tu contexto
  const token = cookieStore.get("cognito_id_token")?.value

  if (!token) return null

  const payload = decodeJWT(token)

  return {
    userRole: payload["custom:userRole"] || payload["user_role"],
    username: payload["cognito:username"] || payload["sub"],
    payload,
  }
}

