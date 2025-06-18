"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const description = searchParams.get("description")

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "access_denied":
        return "Acceso denegado. El usuario canceló la autenticación."
      case "invalid_request":
        return "Solicitud inválida. Parámetros incorrectos."
      case "unauthorized_client":
        return "Cliente no autorizado."
      case "unsupported_response_type":
        return "Tipo de respuesta no soportado."
      case "invalid_scope":
        return "Ámbito inválido."
      case "server_error":
        return "Error del servidor de autorización."
      case "temporarily_unavailable":
        return "Servicio temporalmente no disponible."
      case "missing_code":
        return "Código de autorización faltante."
      case "token_exchange_failed":
        return "Error al intercambiar el código por tokens."
      default:
        return "Error de autenticación desconocido."
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertCircle className="w-5 h-5 mr-2" />
            Error de Autenticación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium">{getErrorMessage(error)}</p>
            {description && <p className="text-sm text-muted-foreground mt-2">{description}</p>}
          </div>

          <div className="space-y-2">
            <Button onClick={() => (window.location.href = "/select-tenant")} className="w-full">
              Intentar de nuevo
            </Button>
            <Button variant="outline" onClick={() => (window.location.href = "/")} className="w-full">
              Ir al inicio
            </Button>
          </div>

          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 p-3 bg-muted rounded text-xs space-y-2">
              <p>
                <strong>Error:</strong> {error}
              </p>
              <p>
                <strong>Descripción:</strong> {description}
              </p>
              <p>
                <strong>URL actual:</strong> {window.location.href}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
