import { type NextRequest } from "next/server"

function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return {};
  }
}

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

  // Decodificar el token para obtener el username
  let username = null;
  if (accessToken2) {
    const payload = decodeJWT(accessToken2);
    username = payload['cognito:username'] || payload['sub'];
    console.log('Decoded username from id_token:', username);
  }

  return Response.json({
    isAuthenticated,
    hasTenantConfig,
    userPoolId,
    appClientId,
    userPoolDomain,
    username,
  });
}