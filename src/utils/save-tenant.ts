// Función actualizada para guardar también en cookies
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

  const res = await fetch(`${apiBaseUrl}/tenant/init/${tenantName}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Error obteniendo datos del tenant: ${text}`)
  }

  const data = await res.json()

  // Guardar en localStorage (para compatibilidad)
  localStorage.setItem("userPoolId", data.userPoolId)
  localStorage.setItem("appClientId", data.appClientId)
  localStorage.setItem("apiGatewayUrl", data.apiGatewayUrl)
  localStorage.setItem("userPoolDomain", data.userPoolDomain)

  // También guardar en cookies para el servidor con configuración más robusta
  const cookieOptions = "path=/; max-age=86400; SameSite=Lax; Secure"
  const isSecure = window.location.protocol === "https:"

  const cookieString = isSecure ? cookieOptions : "path=/; max-age=86400; SameSite=Lax"

  document.cookie = `userPoolId=${data.userPoolId}; ${cookieString}`
  document.cookie = `appClientId=${data.appClientId}; ${cookieString}`
  document.cookie = `apiGatewayUrl=${data.apiGatewayUrl}; ${cookieString}`
  document.cookie = `userPoolDomain=${data.userPoolDomain}; ${cookieString}`

  return data
}
