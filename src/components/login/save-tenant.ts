// utils/set-tenant.ts o donde la tengas

export async function setTenantConfig(tenantName: string): Promise<{
  userPoolId: string
  appClientId: string
  apiGatewayUrl: string
  userPoolDomain: string
}> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_REG_API_GATEWAY_URL

  if (!apiBaseUrl) {
    throw new Error("Falta NEXT_PUBLIC_REG_API_GATEWAY_URL en variables de entorno")
  }

  // 1. Obtener datos del tenant desde la ruta proxy local (evita CORS)
  const res = await fetch(`/api/tenant/init/${tenantName}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  localStorage.setItem("tenant", tenantName);

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Error obteniendo datos del tenant: ${text}`)
  }

  const data = await res.json()
  //console.log("Datos del tenant obtenidos:", data)

  // 2. Enviar los datos al endpoint local para guardarlos como cookies seguras
  const response = await fetch("/api/auth/tenantset", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userPoolId: data.userPoolId,
      appClientId: data.appClientId,
      apiGatewayUrl: data.apiGatewayUrl,
      userPoolDomain: data.userPoolDomain,
    }),
  })

  if (!response.ok) {
    throw new Error("Error setting secure cookies for tenant")
  }

  return data
}