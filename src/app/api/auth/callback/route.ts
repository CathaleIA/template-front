import { type NextRequest, NextResponse } from "next/server"

interface CognitoTokenResponse {
  access_token: string
  id_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    // Si hay error de OAuth
    if (error) {
      const errorDescription = searchParams.get("error_description")
      return NextResponse.redirect(
        new URL(`/auth/error?error=${error}&description=${errorDescription || ""}`, request.url),
      )
    }

    // Si no hay código
    if (!code) {
      return NextResponse.redirect(new URL("/auth/error?error=missing_code", request.url))
    }

    // Intercambiar código por tokens - HARDCODEADO
    const tokens = await exchangeCodeForTokens(code)

    // Crear respuesta de redirección
    const response = NextResponse.redirect(new URL("/dashboard", request.url))

    // Establecer cookies
    setTokenCookies(response, tokens)

    return response
  } catch (error) {
    // Si algo falla, redirigir a error
    return NextResponse.redirect(new URL("/auth/error?error=server_error", request.url))
  }
}

async function exchangeCodeForTokens(authorizationCode: string): Promise<CognitoTokenResponse> {
  const tokenEndpoint = "https://pooledtenant-serverlesssaas-240435918890.auth.us-east-1.amazoncognito.com/oauth2/token"

  // Crear el body exactamente como en Postman
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: "2s9e6hdscshv3a7si9k3asul5o",
    code: authorizationCode,
    redirect_uri: "https://appui.d1ajb21hsxi2dm.amplifyapp.com/api/auth/callback",
  })

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Token exchange failed: ${response.status} ${text}`)
  }

  return await response.json()
}

function setTokenCookies(response: NextResponse, tokens: CognitoTokenResponse) {
  const isProduction = process.env.NODE_ENV === "production"
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
  }

  response.cookies.set("cognito_access_token", tokens.access_token, {
    ...cookieOptions,
    expires: expiresAt,
  })

  response.cookies.set("cognito_id_token", tokens.id_token, {
    ...cookieOptions,
    expires: expiresAt,
  })

  response.cookies.set("cognito_refresh_token", tokens.refresh_token, {
    ...cookieOptions,
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
  })
}
