import { type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("cognito_access_token")?.value;
  const accessToken1 = request.cookies.get("cognito_expires_at")?.value;
  const accessToken2 = request.cookies.get("cognito_id_token")?.value;
  const accessToken3 = request.cookies.get("cognito_refresh_token")?.value;
  const userPoolId = request.cookies.get("userPoolId")?.value;
  const appClientId = request.cookies.get("appClientId")?.value;
  const userPoolDomain = request.cookies.get("userPoolDomain")?.value;

  const isAuthenticated = !!( accessToken && accessToken1 && accessToken2 && accessToken3);
  const hasTenantConfig = !!(userPoolId && appClientId && userPoolDomain);

  return Response.json({
    isAuthenticated,
    hasTenantConfig,
    userPoolId,
    appClientId,
    userPoolDomain,
  });
}