import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 })
  }

  try {
    //Obtener datos desde cookies (guardados previamente con /api/tenant)
    const userPoolId = request.cookies.get("userPoolId")?.value
    const userPoolDomain = request.cookies.get("userPoolDomain")?.value
    const clientId = request.cookies.get("appClientId")?.value

    if (!userPoolDomain || !clientId || !userPoolId) {
      return NextResponse.json(
        { error: "Missing required tenant configuration in cookies" },
        { status: 400 }
      )
    }

    //Construir la URL dinámicamente usando userPoolDomain
    const region = userPoolId.split("_")[0] || "us-east-1"
    const cognitoTokenEndpoint = `https://${userPoolDomain}.auth.${region}.amazoncognito.com/oauth2/token` 

    // 🔄 Hacer el intercambio de código por tokens
    const response = await fetch(cognitoTokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        code: code,
        // redirect_uri: "https://appui.d1ajb21hsxi2dm.amplifyapp.com/api/auth/callback",  // <- puedes moverlo a env después
        redirect_uri: "http://localhost:3000/api/auth/callback",
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Token exchange failed: ${errorText}` },
        { status: 400 }
      )
    }

    const tokens = await response.json()

    //Calcular expiración
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)

    //Redirección final
    const redirectUrl = process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
      : "https://appui.d1ajb21hsxi2dm.amplifyapp.com/dashboard" 
    //const redirectUrl = "http://localhost:3000/dashboard"

    const redirectResponse = NextResponse.redirect(redirectUrl, {
      status: 302,
    })

    //Guardar tokens en cookies (httpOnly)
    redirectResponse.cookies.set("cognito_access_token", tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    })

    redirectResponse.cookies.set("cognito_id_token", tokens.id_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    })

    redirectResponse.cookies.set("cognito_refresh_token", tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // ~30 días
      path: "/",
    })

    redirectResponse.cookies.set("cognito_expires_at", expiresAt.getTime().toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    })

    return redirectResponse
  } catch (error) {
    console.error("Error en callback:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}