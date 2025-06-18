"use client"

import { useState, useEffect } from "react"

export interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: any
  error: string | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null,
  })

  // Verificar estado de autenticación
  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/status")
      const data = await response.json()

      setAuthState({
        isAuthenticated: data.isAuthenticated,
        isLoading: false,
        user: data.user || null,
        error: null,
      })
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: error instanceof Error ? error.message : "Error verificando autenticación",
      })
    }
  }

  // Refrescar tokens
  const refreshTokens = async () => {
    try {
      const response = await fetch("/api/auth/refresh", { method: "POST" })
      if (response.ok) {
        await checkAuthStatus()
      } else {
        throw new Error("Error refrescando tokens")
      }
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Error refrescando tokens",
      }))
    }
  }

  // Cerrar sesión
  const logout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" })
      const data = await response.json()

      if (data.logoutUrl) {
        // Redirigir a logout de Cognito
        window.location.href = data.logoutUrl
      } else {
        // Redirigir a página de selección de tenant
        window.location.href = "/select-tenant"
      }
    } catch (error) {
      console.error("Error en logout:", error)
      // Forzar redirección en caso de error
      window.location.href = "/select-tenant"
    }
  }

  useEffect(() => {
    checkAuthStatus()
  }, [])

  return {
    ...authState,
    refreshTokens,
    logout,
    checkAuthStatus,
  }
}
