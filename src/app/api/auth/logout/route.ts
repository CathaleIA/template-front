import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // Puedes obtener estos de cookies o variables de entorno según tu arquitectura
  const userPoolDomain = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_DOMAIN || request.cookies.get("userPoolDomain")?.value;
  const appClientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || request.cookies.get("appClientId")?.value;
  const userPoolId = request.cookies.get("userPoolId")?.value;

  if (!userPoolDomain || !appClientId) {
    return new Response("Missing required configuration", {
      status: 400,
    });
  }

  const region = userPoolId?.split("_")[0] || "us-east-1";

  // La URL a donde quieres redirigir tras el logout
  const logoutUri = encodeURIComponent("https://appui.d1ajb21hsxi2dm.amplifyapp.com"); 

  // Construcción de la URL de Cognito Logout
  const cognitoLogoutUrl = `https://${userPoolDomain}.auth.${region}.amazoncognito.com/logout?client_id=${encodeURIComponent(
    appClientId
  )}&logout_uri=${logoutUri}`;

  return new Response(null, {
    status: 302,
    headers: {
      Location: cognitoLogoutUrl,
    },
  });
}