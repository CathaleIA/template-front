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
import { Building2, Loader2, CheckCircle, ArrowRight, Factory } from "lucide-react"
import { Separator } from "@/components/ui/separator"

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
      // const redirectUri = "https://appui.d1ajb21hsxi2dm.amplifyapp.com/api/auth/callback"
      const redirectUri = "http://localhost:3000/api/auth/callback"

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
      <div className="flex justify-center min-h-screen p-4 pt-40"
        style={{
          backgroundImage: "url('assets/background-grad.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        <div className="w-full max-w-md">
          <div className="text-center">
            <div className="mb-20">
              <img
                src="assets/logo-grad.svg"
                alt="Logo de la empresa"
                className="w-[150px] h-auto mx-auto"
              />
            </div>
            <p className="text-muted-foreground pb-2">Preparando tu entorno de trabajo</p>
          </div>

          <Card className="shadow-xl border-1 bg-white/10 backdrop-blur-lg ">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl text-center text-card-foreground">Procesando</CardTitle>
              <CardDescription className="text-center text-white">
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
                <div className="flex items-center space-x-3 text-white">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Empresa identificada</span>
                </div>
                <div className="flex items-center space-x-3 text-white">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span>Configurando permisos</span>
                </div>
                <div className="flex items-center space-x-3 text-white">
                  <div className="w-4 h-4 rounded-full border-2 border-border"></div>
                  <span>Iniciando sesión</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-center text-foreground">
                  Este proceso puede tomar unos segundos...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (

    <div className="flex justify-center min-h-screen p-4 pt-40"
      style={{
        backgroundImage: "url('assets/background-grad.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="mb-20">
            <img
              src="assets/logo-grad.svg"
              alt="Logo de la empresa"
              className="w-[150px] h-auto mx-auto"
            />
          </div>
          <p className="text-muted-foreground pb-2">Preparando tu entorno de trabajo</p>
        </div>

        <Card className="shadow-xl border-1 bg-white/10 backdrop-blur-lg ">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center font-bold uppercase text-white">
              SELECCIONAR EMPRESA
            </CardTitle>

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
                  <Factory className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white" />
                  <Separator orientation="vertical" className="absolute left-9 h-4 w-[2px]" />
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
                    className="pl-10 h-11 border-border text-card-white bg-white/20 backdrop-blur-xs placeholder:text-white/30 focus:border-ring focus:ring-ring"
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
                className="w-full h-11 rounded-3xl font-semibold text-primary-foreground shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
                style={{
                  backgroundImage: "url('assets/button-grad.svg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Procesando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="font-bold uppercase text-white">Continuar</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>

                )}
              </Button>
            </form>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-center text-muted-foreground">
                <span className="text-xs text-center font-bold " style={{ color: "#72bfaf" }}>¿Necesitas ayuda?</span> Contacta a tu administrador de sistema
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}