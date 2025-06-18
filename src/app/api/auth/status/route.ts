import { NextResponse } from "next/server"
import { getServerTokens, getServerUserInfo } from "@/utils/server-auth"

export async function GET() {
  try {
    const tokens = await getServerTokens()
    const user = await getServerUserInfo()

    return NextResponse.json({
      isAuthenticated: !!tokens,
      user,
    })
  } catch (error) {
    console.error("Error verificando estado de autenticación:", error)
    return NextResponse.json({
      isAuthenticated: false,
      user: null,
    })
  }
}
