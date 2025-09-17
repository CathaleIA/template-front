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
import { setTenantConfig } from "@/utils/save-tenant"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Factory, ArrowRight } from "lucide-react"

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
      // Etapa 1: Validando empresa (inmediato, no requiere espera)
      setLoadingStage("Validando empresa...")
      setProgress(10) // Pequeño avance visual mientras se prepara

      // Etapa 2: Configurando tenant → ESTA ES LA OPERACIÓN REAL
      setLoadingStage("Configurando acceso...")
      setProgress(30)
      await setTenantConfig(values.tenant.trim()) // ← Esto toma el tiempo que tome

      // Etapa 3: Obteniendo datos del tenant → OTRA OPERACIÓN REAL
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
      const redirectUri = "http://localhost:3000/api/auth/callback"
      const scope = "email+openid+profile"
      const state = encodeURIComponent(
        JSON.stringify({ userPoolId, appClientId: clientId, userPoolDomain })
      )

      const cognitoLoginUrl = `https://${userPoolDomain}.auth.${region}.amazoncognito.com/login?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`

      setProgress(100)
      setLoadingStage("Redirigiendo...")

      // Redirige inmediatamente
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
        <div className="w-full max-w-md animate-fadeIn">
          <div className="
        backdrop-blur-sm
        shadow-xl
        rounded-xl
        p-6
        bg-white/10
        dark:bg-black/10
      ">
            <div className="flex flex-col gap-6">
              <Card className="
            overflow-hidden
            backdrop-blur-sm
            bg-white/10 dark:bg-black/10
            shadow-xl
            rounded-xl
            border
            border-border/40
          ">
                <CardContent>
                  <div className="">
                    <div className="flex flex-col pt-5 gap-8">
                      <div className="flex flex-col items-center text-center">
                        <h1 className="text-2xl font-bold">Procesando</h1>
                        <p className="text-md text-muted-foreground">
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
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md animate-fadeIn">
          <div className="
        backdrop-blur-sm
        shadow-xl
        rounded-xl
        p-6
        bg-white/10
        dark:bg-black/10
      ">
            <div className="flex flex-col gap-6">
              <Card className="
            overflow-hidden
            backdrop-blur-sm
            bg-white/10 dark:bg-black/10
            shadow-xl
            rounded-xl
            border
            border-border/40
          ">
                <CardContent className='pt-5'>
                  <div className="flex flex-col items-center text-center pb-8">
                    <h1 className="text-2xl font-bold">¡Welcome Back!</h1>
                    <p className="text-md text-muted-foreground">
                      Digite el nombre de su empresa
                    </p>
                  </div>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="tenant"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: copower" {...field} />
                            </FormControl>
                            <FormDescription>
                              This is your public display name.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full">
                        Validar
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  )

}