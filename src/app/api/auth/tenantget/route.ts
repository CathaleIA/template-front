import { type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const userPoolId = request.cookies.get("userPoolId")?.value;
  const appClientId = request.cookies.get("appClientId")?.value;
  const userPoolDomain = request.cookies.get("userPoolDomain")?.value;

  const isAuthenticated = !!accessToken;
  const hasTenantConfig = !!(userPoolId && appClientId && userPoolDomain);

  return Response.json({
    isAuthenticated,
    hasTenantConfig,
    userPoolId,
    appClientId,
    userPoolDomain,
  });
}