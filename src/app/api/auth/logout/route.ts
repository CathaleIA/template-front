import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Obtener configuración para logout de Cognito
    const userPoolId = request.cookies.get("userPoolId")?.value
    const appClientId = request.cookies.get("appClientId")?.value
    const userPoolDomain = request.cookies.get("userPoolDomain")?.value

    // Crear respuesta
    const response = NextResponse.json({ success: true })

    // Limpiar todas las cookies de autenticación
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      expires: new Date(0), // Expirar inmediatamente
    }

    response.cookies.set("cognito_access_token", "", cookieOptions)
    response.cookies.set("cognito_id_token", "", cookieOptions)
    response.cookies.set("cognito_refresh_token", "", cookieOptions)
    response.cookies.set("cognito_token_type", "", cookieOptions)
    response.cookies.set("cognito_expires_at", "", cookieOptions)

    // Si tenemos la configuración, también podemos hacer logout de Cognito
    if (userPoolId && appClientId && userPoolDomain) {
      const region = userPoolId.split("_")[0] || "us-east-1"
      const logoutUrl = `https://${userPoolDomain}.auth.${region}.amazoncognito.com/logout?client_id=${appClientId}&logout_uri=${encodeURIComponent(
        `${request.nextUrl.origin}/select-tenant`,
      )}`

      return NextResponse.json({ success: true, logoutUrl })
    }

    return response
  } catch (error) {
    console.error("Error en logout:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
