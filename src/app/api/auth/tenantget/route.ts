import { type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const userPoolId = request.cookies.get("userPoolId")?.value
  const appClientId = request.cookies.get("appClientId")?.value
  const userPoolDomain = request.cookies.get("userPoolDomain")?.value

  return Response.json({
    userPoolId,
    appClientId,
    userPoolDomain,
  })
}