"use client"

import React, { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { setTenantConfig } from "@/components/login/save-tenant"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Factory, ArrowRight, Loader2 } from "lucide-react"
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from "@/components/ui/alert"

const formSchema = z.object({
  tenant: z.string().min(2, {
    message: "Tenant name must be at least 2 characters without characters.",
  }),
})

export function SelectTenant() {
  const [tenant, setTenant] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState("")
  const [progress, setProgress] = useState(0)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tenant: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    setError(null)
    setProgress(0)

    if (!values.tenant.trim()) {
      setError("Por favor ingresa el nombre de tu empresa")
      setLoading(false)
      return
    }

    try {
      // Etapa 1: Validando empresa
      setLoadingStage("Validando empresa...")
      setProgress(10) // Pequeño avance visual mientras se prepara

      // Etapa 2: Configurando tenant
      setLoadingStage("Configurando acceso...")
      setProgress(30)
      await setTenantConfig(values.tenant.trim())

      setLoadingStage("Obteniendo configuración...")
      setProgress(60)
      const infoRes = await fetch("/api/auth/tenantget")
      if (!infoRes.ok) throw new Error("No se pudieron obtener los datos del tenant")

      const { userPoolId, appClientId: clientId, userPoolDomain } = await infoRes.json()
      if (!userPoolId || !clientId || !userPoolDomain) {
        throw new Error("Faltan datos después de configurar el tenant")
      }

      // Etapa 4: Preparando redirección
      setLoadingStage("Preparando redirección...")
      setProgress(90)

      const region = userPoolId.split("_")[0] || "us-east-1"
      //const redirectUri = "https://suecia.d1ajb21hsxi2dm.amplifyapp.com/api/auth/callback"
      const redirectUri = "http://localhost:3000/api/auth/callback"
      const scope = "email+openid+profile"
      const state = encodeURIComponent(
        JSON.stringify({ userPoolId, appClientId: clientId, userPoolDomain })
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
  return (
    <div className="flex items-center justify-center">
      {loading ? (
        <div
          className="w-full max-w-md animate-fadeIn rounded-xl"
        >

          <div className="flex flex-col gap-6">
            <img
              src="assets/logo-grad.svg"
              alt="Logo de la empresa"
              className="w-[150px] h-auto mx-auto"
            />
            <Card
              className="
                w-full
                overflow-hidden
                backdrop-blur-sm
                bg-transparent
                shadow-2xl
                rounded-xl
                border
                border-border/40
              "
              style={{
                backgroundImage: 'var(--background-vidrio)',
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat"
              }}
            >
                <CardContent>
                  <div className="">
                    <div className="flex flex-col pt-5 gap-8">
                      <div className="flex flex-col items-center text-center">
                        <h1 className="text-2xl font-bold text-white">Procesando</h1>
                        <p className="text-md text-white">
                          Configurando tu acceso empresarial
                        </p>
                      </div>

                      <div className="flex items-center justify-center space-x-3">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-medium text-white">{loadingStage}</span>
                      </div>

                      <Progress value={progress} className="w-full" />

                      <div className="space-y-4 text-sm">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className={`w-4 h-4 ${progress >= 25 ? 'text-green-500' : 'text-white'}`} />
                          <span className={progress >= 25 ? 'text-foreground' : 'text-white'}>
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
                          <span className={progress >= 50 ? 'text-foreground' : 'text-white'}>
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
                          <span className={progress >= 75 ? 'text-foreground' : 'text-white'}>
                            Preparando autenticación
                          </span>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-border">
                        <p className="text-xs text-center text-white">
                          Este proceso puede tomar unos segundos...
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
      ) : (
        <div
          className="w-full max-w-md animate-fadeIn rounded-xl"
        >

          <div className="flex flex-col gap-6">
            <img
              src="logos/cathaleiaNew.png"
              alt="Logo de la empresa"
              className="w-[150px] h-auto mx-auto"
            />
            <Card
              className="
                w-full
                overflow-hidden
                backdrop-blur-sm
                bg-transparent
                shadow-2xl
                rounded-xl
                border
                border-border/40
              "
              style={{
                backgroundImage: 'var(--background-vidrio)',
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat"
              }}
            >
              <CardContent className='pt-5'>
                <div className="flex flex-col items-center text-center pb-8">
                  <h1 className="text-2xl font-bold text-white">SELECCIONAR EMPRESA</h1>
                  <p className="text-sm text-muted-foreground font-normal">
                    Ingresa el nombre de tu empresa para continuar
                  </p>
                </div>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="tenant"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium text-white">
                            Nombre de la Empresa
                          </FormLabel>
                          <div className="relative">
                            <Factory className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white" />
                            <Separator orientation="vertical" className="absolute left-9 h-4 w-[2px]" />
                            <Input
                              id="tenant"
                              type="text"
                              placeholder="Ej: Copower"
                              {...field}
                              onChange={(e) => {
                                const inputValue = e.target.value
                                  .toLowerCase()
                                  .trim()
                                  .replace(/\s+/g, "")
                                field.onChange(inputValue)
                              }}
                              className="pl-10 h-11 border-border text-card-white backdrop-blur-xs placeholder:text-white/30 focus:border-ring focus:ring-ring"
                              autoFocus
                            />
                          </div>
                          <FormMessage className="text-sm text-destructive" />
                        </FormItem>
                      )}
                    />
                    {error && (
                      <Alert variant="destructive" className="border-destructive/20 bg-destructive/10">
                        <AlertDescription className="text-sm text-destructive">{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      disabled={loading || !form.watch("tenant")?.trim()}
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
                          <span>{loadingStage || "Procesando..."}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="font-bold uppercase text-white">Continuar</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </Button>
                    {loading && progress > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="pt-4 mt-2 border-t border-white/10 text-center">
              <p className="text-xs text-green-live">
                ¿Necesitas ayuda?{" "}
                <a
                  href="cathaleia@cathaleia.com.co"
                  className="text-white hover:underline font-medium transition"
                >
                  Contacta a tu administrador de sistema
                </a>
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  )

}