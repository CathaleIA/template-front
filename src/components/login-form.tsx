"use client"

import React, { useState } from 'react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Factory, ArrowRight } from "lucide-react"
import { setTenantConfig } from "@/utils/save-tenant"
import Image from 'next/image'


export function EnhancedLoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const [tenant, setTenant] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState("")
  const [progress, setProgress] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setProgress(0)

    if (!tenant.trim()) {
      setError("Por favor ingresa el nombre de tu empresa")
      setLoading(false)
      return
    }

    try {
      // Etapa 1: Validando empresa
      setLoadingStage("Validando empresa...")
      setProgress(25)
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Etapa 2: Configurando tenant
      setLoadingStage("Configurando acceso...")
      setProgress(50)
      await setTenantConfig(tenant.trim())
      await new Promise((resolve) => setTimeout(resolve, 600))

      // Etapa 3: Preparando autenticación
      setLoadingStage("Preparando autenticación...")
      setProgress(75)
      await new Promise((resolve) => setTimeout(resolve, 400))

      // Llamada al endpoint para obtener cookies seguras
      const infoRes = await fetch("/api/auth/tenantget")
      if (!infoRes.ok) throw new Error("No se pudieron obtener los datos del tenant")

      const { userPoolId, appClientId: clientId, userPoolDomain } = await infoRes.json()

      if (!userPoolId || !clientId || !userPoolDomain) {
        throw new Error("Faltan datos después de configurar el tenant")
      }

      setProgress(90)

      const region = userPoolId.split("_")[0] || "us-east-1"
      const redirectUri = "https://appui.d1ajb21hsxi2dm.amplifyapp.com/api/auth/callback"
      // const redirectUri = "http://localhost:3000/api/auth/callback"

      const scope = "email+openid+profile"

      const state = encodeURIComponent(
        JSON.stringify({
          userPoolId,
          appClientId: clientId,
          userPoolDomain,
        }),
      )

      const cognitoLoginUrl = `https://${userPoolDomain}.auth.${region}.amazoncognito.com/login?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`

      setProgress(100)
      setLoadingStage("Redirigiendo...")

      window.location.href = cognitoLoginUrl
    } catch (err: any) {
      console.error("Error seleccionando empresa:", err)
      setError("Empresa no encontrada. Verifica el nombre e inténtalo nuevamente.")
      setLoading(false)
      setLoadingStage("")
      setProgress(0)
    }
  }

  const handleTenantSubmit = () => {
    const fakeEvent = { preventDefault: () => { } } as React.FormEvent
    handleSubmit(fakeEvent)
  }


  if (loading) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="overflow-hidden">
          <CardContent className="grid p-0 md:grid-cols-2">
            <div className="p-8 md:p-12">
              <div className="flex flex-col gap-8">
                <div className="flex flex-col items-center text-center space-y-3">
                  <h1 className="text-2xl font-bold">Procesando</h1>
                  <p className="text-muted-foreground">
                    Configurando tu acceso empresarial
                  </p>
                </div>

                <div className="flex items-center justify-center space-x-3">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium">{loadingStage}</span>
                </div>

                <Progress value={progress} className="w-full" />

                <div className="space-y-4 text-sm">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`w-4 h-4 ${progress >= 25 ? 'text-green-500' : 'text-muted-foreground'}`} />
                    <span className={progress >= 25 ? 'text-foreground' : 'text-muted-foreground'}>
                      Empresa identificada
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {progress >= 50 && progress < 75 ? (
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    ) : progress >= 75 ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-border"></div>
                    )}
                    <span className={progress >= 50 ? 'text-foreground' : 'text-muted-foreground'}>
                      Configurando permisos
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {progress >= 75 && progress < 100 ? (
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    ) : progress >= 100 ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-border"></div>
                    )}
                    <span className={progress >= 75 ? 'text-foreground' : 'text-muted-foreground'}>
                      Preparando autenticación
                    </span>
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <p className="text-xs text-center text-muted-foreground">
                    Este proceso puede tomar unos segundos...
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-muted relative hidden md:block">
              <Image
                src="/placeholder.svg"
                alt="Image"
                className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-8 md:p-12">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col items-center text-center space-y-3">
                <h1 className="text-2xl font-bold">Seleccionar Empresa</h1>
                <p className="text-muted-foreground text-xs">
                  Ingresa el nombre de tu organización para continuar
                </p>
              </div>
              <div className="grid gap-4">
                <Label htmlFor="tenant" className="text-sm font-medium">
                  Nombre de la Empresa
                </Label>
                <div className="relative">
                  <Factory className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="tenant"
                    type="text"
                    value={tenant}
                    onChange={(e) => {
                      const inputValue = e.target.value
                        .toLowerCase()
                        .trim()
                        .replace(/\s+/g, '')
                      setTenant(inputValue)
                    }}
                    placeholder="Ej: Copower"
                    className="pl-10"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleTenantSubmit()
                      }
                    }}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleTenantSubmit}
                  disabled={loading || !tenant.trim()}
                  className="w-full mt-2"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
                      <span>Procesando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Continuar</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          <div className="bg-muted relative hidden md:block">
            <Image
              src="/placeholder.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <p className="text-xs text-center text-muted-foreground">
        <span className="text-primary font-medium">¿Necesitas ayuda?</span> Contacta a tu administrador de sistema
      </p>
    </div>
  )
}