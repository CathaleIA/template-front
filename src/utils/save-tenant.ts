// utils/tenant.ts
export async function setTenantConfig(tenantName: string): Promise<{
  userPoolId: string;
  appClientId: string;
  apiGatewayUrl: string;
  userPoolDomain: string;
}> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_REG_API_GATEWAY_URL;

  if (!apiBaseUrl) {
    throw new Error('Falta NEXT_PUBLIC_REG_API_GATEWAY_URL en variables de entorno');
  }

  const res = await fetch(`${apiBaseUrl}/tenant/init/${tenantName}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error obteniendo datos del tenant: ${text}`);
  }

  const data = await res.json();

  // ✅ Guardar en localStorage
  localStorage.setItem('userPoolId', data.userPoolId);
  localStorage.setItem('appClientId', data.appClientId);
  localStorage.setItem('apiGatewayUrl', data.apiGatewayUrl);
  localStorage.setItem('userPoolDomain', data.userPoolDomain);

  return data;
}