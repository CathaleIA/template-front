import { type NextRequest, NextResponse } from "next/server"

interface CognitoTokenResponse {
  access_token: string
  id_token: string
  refresh_token?: string
  token_type: string
  expires_in: number
}

export async function POST(request: NextRequest) {
  try {
    // Obtener refresh token desde cookies
    const refreshToken = request.cookies.get("cognito_refresh_token")?.value
    const userPoolId = request.cookies.get("userPoolId")?.value
    const appClientId = request.cookies.get("appClientId")?.value
    const userPoolDomain = request.cookies.get("userPoolDomain")?.value

    if (!refreshToken || !userPoolId || !appClientId || !userPoolDomain) {
      return NextResponse.json({ error: "Missing required data" }, { status: 401 })
    }

    const region = userPoolId.split("_")[0] || "us-east-1"
    const tokenEndpoint = `https://${userPoolDomain}.auth.${region}.amazoncognito.com/oauth2/token`

    const params = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: appClientId,
      refresh_token: refreshToken,
    })

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json({ error: errorData.error || "Refresh failed" }, { status: 401 })
    }

    const tokens: CognitoTokenResponse = await response.json()

    // Si no se devuelve un nuevo refresh_token, usar el anterior
    if (!tokens.refresh_token) {
      tokens.refresh_token = refreshToken
    }

    // Crear respuesta y establecer nuevas cookies
    const nextResponse = NextResponse.json({ success: true })
    setTokenCookies(nextResponse, tokens)

    return nextResponse
  } catch (error) {
    console.error("Error refrescando tokens:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function setTokenCookies(response: NextResponse, tokens: CognitoTokenResponse) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  }

  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)

  response.cookies.set("cognito_access_token", tokens.access_token, {
    ...cookieOptions,
    expires: expiresAt,
  })

  response.cookies.set("cognito_id_token", tokens.id_token, {
    ...cookieOptions,
    expires: expiresAt,
  })

  if (tokens.refresh_token) {
    response.cookies.set("cognito_refresh_token", tokens.refresh_token, {
      ...cookieOptions,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
    })
  }

  response.cookies.set("cognito_token_type", tokens.token_type, {
    ...cookieOptions,
    expires: expiresAt,
  })

  response.cookies.set("cognito_expires_at", expiresAt.getTime().toString(), {
    ...cookieOptions,
    expires: expiresAt,
  })
}
