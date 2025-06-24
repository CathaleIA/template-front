"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { setTenantConfig } from "@/utils/save-tenant"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, Loader2, CheckCircle, ArrowRight } from "lucide-react"

export default function SelectTenantPage() {
  const router = useRouter()
  const [tenant, setTenant] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!tenant.trim()) {
      setError("Por favor ingresa el nombre de tu empresa")
      setLoading(false)
      return
    }

    try {
      // Etapa 1: Validando empresa
      setLoadingStage("Validando empresa...")
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Etapa 2: Configurando tenant
      setLoadingStage("Configurando acceso...")
      await setTenantConfig(tenant.trim())
      await new Promise((resolve) => setTimeout(resolve, 600))

      // Etapa 3: Preparando autenticación
      setLoadingStage("Preparando autenticación...")
      await new Promise((resolve) => setTimeout(resolve, 400))

      // Llamada al endpoint para obtener cookies seguras
      const infoRes = await fetch("/api/auth/tenantget")
      if (!infoRes.ok) throw new Error("No se pudieron obtener los datos del tenant")

      const { userPoolId, appClientId: clientId, userPoolDomain } = await infoRes.json()

      if (!userPoolId || !clientId || !userPoolDomain) {
        throw new Error("Faltan datos después de configurar el tenant")
      }

      const region = userPoolId.split("_")[0] || "us-east-1"
      const redirectUri = "https://appui.d1ajb21hsxi2dm.amplifyapp.com/api/auth/callback"
      const scope = "email+openid+profile"

      const state = encodeURIComponent(
        JSON.stringify({
          userPoolId,
          appClientId: clientId,
          userPoolDomain,
        }),
      )

      const cognitoLoginUrl = `https://${userPoolDomain}.auth.${region}.amazoncognito.com/login?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`

      window.location.href = cognitoLoginUrl
    } catch (err: any) {
      console.error("Error seleccionando empresa:", err)
      setError("Empresa no encontrada. Verifica el nombre e inténtalo nuevamente.")
      setLoading(false)
      setLoadingStage("")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center min-h-[calc(100vh-3.5rem)] bg-background p-4 pt-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg mb-4">
              <Building2 className="w-8 h-8 text-primary-foreground" />
              <div className="absolute -inset-2 bg-primary/20 rounded-2xl animate-pulse"></div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Configurando Acceso</h1>
            <p className="text-muted-foreground">Preparando tu entorno de trabajo</p>
          </div>

          <Card className="shadow-xl border border-border bg-card/95 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl text-center text-card-foreground">Procesando</CardTitle>
              <CardDescription className="text-center text-muted-foreground">
                Configurando tu acceso empresarial
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-center space-x-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-sm font-medium text-card-foreground">{loadingStage}</span>
              </div>

              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div className="h-full bg-primary rounded-full animate-pulse"></div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Empresa identificada</span>
                </div>
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span>Configurando permisos</span>
                </div>
                <div className="flex items-center space-x-3 text-muted-foreground/60">
                  <div className="w-4 h-4 rounded-full border-2 border-border"></div>
                  <span>Iniciando sesión</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-center text-muted-foreground">
                  Este proceso puede tomar unos segundos...
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-accent/5 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center min-h-[calc(100vh-3.5rem)] bg-background p-4 pt-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg mb-4">
            <Building2 className="w-8 h-8 text-primary-foreground" />
            <div className="absolute -inset-2 bg-primary/20 rounded-2xl animate-pulse"></div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Configurando Acceso</h1>
          <p className="text-muted-foreground">Preparando tu entorno de trabajo</p>
        </div>

        <Card className="shadow-xl border border-border bg-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center text-card-foreground">Selecciona tu Empresa</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Ingresa el nombre de tu organización para continuar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tenant" className="text-sm font-medium text-card-foreground">
                  Nombre de la Empresa
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="tenant"
                    type="text"
                    value={tenant}
                    onChange={(e) => {
                      const inputValue = e.target.value
                        .toLowerCase() // convertir a minúsculas
                        .trim()        // quitar espacios al inicio y final
                        .replace(/\s+/g, ''); // eliminar todos los espacios internos (opcional)
                      setTenant(inputValue);
                    }}
                    placeholder="Ej: Copower"
                    className="pl-10 h-11 bg-input border-border text-card-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring"
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="border-destructive/20 bg-destructive/10">
                  <AlertDescription className="text-sm text-destructive">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={loading || !tenant.trim()}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Procesando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Continuar</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-center text-muted-foreground">
                ¿Necesitas ayuda? Contacta a tu administrador de sistema
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-accent/5 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  )
}
