import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { userPoolId, appClientId, userPoolDomain } = await request.json()

    if (!userPoolId || !appClientId || !userPoolDomain) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60, // 1 hora
    }

    const response = NextResponse.json({ success: true })

    response.cookies.set("userPoolId", userPoolId, cookieOptions)
    response.cookies.set("appClientId", appClientId, cookieOptions)
    response.cookies.set("userPoolDomain", userPoolDomain, cookieOptions)

    return response
  } catch (error) {
    console.error("Error setting tenant cookies:", error)
    return NextResponse.json({ error: "Failed to set tenant cookies" }, { status: 500 })
  }
}