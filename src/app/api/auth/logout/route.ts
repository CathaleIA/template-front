import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const userPoolId = request.cookies.get("userPoolId")?.value
    const appClientId = request.cookies.get("appClientId")?.value
    const userPoolDomain = request.cookies.get("userPoolDomain")?.value

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      expires: new Date(0),
    }

    const response = NextResponse.redirect(`${request.nextUrl.origin}/select-tenant`, {
      status: 302,
    })

    // Eliminar todas las cookies relacionadas con la sesión
    response.cookies.set("cognito_access_token", "", cookieOptions)
    response.cookies.set("cognito_id_token", "", cookieOptions)
    response.cookies.set("cognito_refresh_token", "", cookieOptions)
    response.cookies.set("cognito_token_type", "", cookieOptions)
    response.cookies.set("cognito_expires_at", "", cookieOptions)

    // Si tenemos datos del tenant, redirigimos al logout de Cognito
    if (userPoolId && appClientId && userPoolDomain) {
      const region = userPoolId.split("_")[0] || "us-east-1"
      const logoutRedirectUri = encodeURIComponent(`${request.nextUrl.origin}/select-tenant`)
      const cognitoLogoutUrl = `https://${userPoolDomain}.auth.${region}.amazoncognito.com/logout?client_id=${appClientId}&logout_uri=${logoutRedirectUri}`

      return NextResponse.redirect(cognitoLogoutUrl, {
        status: 302,
      })
    }

    return response
  } catch (error) {
    console.error("Error en logout:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}