import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 })
  }

  try {
    const response = await fetch(
      "https://pooledtenant-serverlesssaas-240435918890.auth.us-east-1.amazoncognito.com/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: "2s9e6hdscshv3a7si9k3asul5o",
          code: code,
          redirect_uri: "https://appui.d1ajb21hsxi2dm.amplifyapp.com/api/auth/callback",
        }),
      },
    )

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error: `Token exchange failed: ${error}` }, { status: 400 })
    }

    const tokens = await response.json()

    // Usar la variable de entorno para construir la URL de redirección
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://appui.d1ajb21hsxi2dm.amplifyapp.com"
    const redirectUrl = `${baseUrl}/dashboard`

    const redirectResponse = NextResponse.redirect(redirectUrl, { status: 302 })

    // Set cookies
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)

    redirectResponse.cookies.set("cognito_access_token", tokens.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    })

    redirectResponse.cookies.set("cognito_id_token", tokens.id_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    })

    redirectResponse.cookies.set("cognito_refresh_token", tokens.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      path: "/",
    })

    redirectResponse.cookies.set("cognito_expires_at", expiresAt.getTime().toString(), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    })

    return redirectResponse
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}