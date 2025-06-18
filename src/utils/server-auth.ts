import { cookies } from "next/headers"

export interface ServerTokens {
  access_token: string
  id_token: string
  refresh_token: string
  token_type: string
  expires_at: number
}

// Obtener tokens desde cookies del servidor
export async function getServerTokens(): Promise<ServerTokens | null> {
  const cookieStore = await cookies()

  const access_token = cookieStore.get("cognito_access_token")?.value
  const id_token = cookieStore.get("cognito_id_token")?.value
  const refresh_token = cookieStore.get("cognito_refresh_token")?.value
  const token_type = cookieStore.get("cognito_token_type")?.value
  const expires_at = cookieStore.get("cognito_expires_at")?.value

  if (!access_token || !id_token || !refresh_token || !token_type || !expires_at) {
    return null
  }

  // Verificar si el token ha expirado
  if (Date.now() >= Number.parseInt(expires_at)) {
    return null
  }

  return {
    access_token,
    id_token,
    refresh_token,
    token_type,
    expires_at: Number.parseInt(expires_at),
  }
}

// Verificar si el usuario está autenticado en el servidor
export async function isServerAuthenticated(): Promise<boolean> {
  const tokens = await getServerTokens()
  return tokens !== null
}

// Decodificar JWT en el servidor
export function decodeJWTServer(token: string): any {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      Buffer.from(base64, "base64")
        .toString()
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error("Error decodificando JWT:", error)
    return null
  }
}

// Obtener información del usuario en el servidor
export async function getServerUserInfo(): Promise<any> {
  const tokens = await getServerTokens()
  if (!tokens) return null

  return decodeJWTServer(tokens.id_token)
}

// Verificar si los tokens necesitan ser refrescados (5 minutos antes de expirar)
export async function needsTokenRefresh(): Promise<boolean> {
  const tokens = await getServerTokens()
  if (!tokens) return false

  const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000
  return tokens.expires_at <= fiveMinutesFromNow
}
