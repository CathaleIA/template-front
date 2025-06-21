"use client"

import { useState } from "react"

import { Moon, Sun, User, LogOut, Settings, ChevronDown } from "lucide-react"
import { useTheme } from "next-themes"

export function DashboardNavbar() {
  const { theme, setTheme } = useTheme()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo y nombre de empresa */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-radius flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">IA</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-card-foreground]">Industrial Analytics</h1>
              <p className="text-xs text-muted-foreground]">Sistema de Gestión Industrial</p>
            </div>
          </div>
        </div>

        {/* Controles del navbar */}
        <div className="flex items-center space-x-4">
          {/* Toggle de tema */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-radius hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {theme ? (
              <Sun className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Moon className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {/* Avatar y menú de usuario */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-radius hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium text-card-foreground">Admin</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Dropdown del usuario */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-popover rounded-radius shadow-lg border border-border py-1 z-50">
                <a
                  href="/dashboard/profile"
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Mi Perfil</span>
                </a>
                <a
                  href="/dashboard/settings"
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Configuración</span>
                </a>
                <hr className="my-1 border-border]" />
                <button
                  onClick={() => {
                    // Redirige directamente al endpoint de logout de Cognito
                    window.location.href = "/api/auth/logout"
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-destructive hover:bg-destructive hover:text-primary-foreground w-full text-left transition-colors rounded-radius]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
