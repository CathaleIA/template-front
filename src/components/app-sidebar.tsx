"use client"

import { AlertTriangle, FileText, Settings, Home, Shield, PanelLeftClose, PanelLeft } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"

// Menu items para navegación principal
const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Alertas",
    url: "/dashboard/alerts",
    icon: AlertTriangle,
  },
  {
    title: "Reportes",
    url: "/dashboard/reports",
    icon: FileText,
  },
  {
    title: "Administración",
    url: "/dashboard/admin",
    icon: Shield,
  },
]

// Menu items para configuración
const settingsItems = [
  {
    title: "Configuración",
    url: "/dashboard/settings",
    icon: Settings,
  },
]

interface AppSidebarProps {
  onExpandedChange?: (expanded: boolean) => void
}

export function AppSidebar({ onExpandedChange }: AppSidebarProps) {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const shouldShowText = isExpanded || isHovered

  const handleToggle = () => {
    const newExpanded = !isExpanded
    setIsExpanded(newExpanded)
    onExpandedChange?.(newExpanded)
  }

  return (
    <div
      className={`fixed left-0 top-14 bottom-0 bg-sidebar border-r transition-all duration-200 ease-in-out ${
        shouldShowText ? "w-64" : "w-16"
      } ${isHovered && !isExpanded ? "z-40 shadow-lg" : "z-10"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header solo con toggle */}
      <div className="p-3 border-b">
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleToggle}>
            {isExpanded ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 p-3">
        {/* Navegación principal */}
        <div>
          {shouldShowText && (
            <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Navegación
            </h3>
          )}
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.url
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                    isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
                  }`}
                  title={!shouldShowText ? item.title : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {shouldShowText && <span>{item.title}</span>}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Configuración */}
        <div>
          {shouldShowText && (
            <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sistema</h3>
          )}
          <nav className="space-y-1">
            {settingsItems.map((item) => {
              const isActive = pathname === item.url
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                    isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
                  }`}
                  title={!shouldShowText ? item.title : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {shouldShowText && <span>{item.title}</span>}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex aspect-square size-6 items-center justify-center rounded-md bg-accent">
            <Settings className="size-3" />
          </div>
          {shouldShowText && <span className="text-xs text-muted-foreground">v1.0.0</span>}
        </div>
      </div>
    </div>
  )
}
