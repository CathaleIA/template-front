"use client"

import { useState } from "react"
import { Home, Settings, BarChart3, Users, Wrench, AlertTriangle, Pin, PinOff } from "lucide-react"

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: BarChart3, label: "Reportes", href: "/dashboard/reports" },
  { icon: Wrench, label: "Equipos", href: "/dashboard/equipment" },
  { icon: Users, label: "Personal", href: "/dashboard/staff" },
  { icon: AlertTriangle, label: "Alertas", href: "/dashboard/alerts" },
  { icon: Settings, label: "Configuración", href: "/dashboard/settings" },
]

export function DashboardSidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPinned, setIsPinned] = useState(false)

  const handleMouseEnter = () => {
    if (!isPinned) {
      setIsExpanded(true)
    }
  }

  const handleMouseLeave = () => {
    if (!isPinned) {
      setIsExpanded(false)
    }
  }

  const togglePin = () => {
    setIsPinned(!isPinned)
    if (!isPinned) {
      setIsExpanded(true)
    }
  }

  const sidebarWidth = isExpanded ? "w-64" : "w-16"

  return (
    <div
      className={`${sidebarWidth} bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out flex flex-col border-r border-sidebar-border`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-sidebar-primary rounded-[0.65rem] flex items-center justify-center">
              <Wrench className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            {isExpanded && <span className="font-semibold text-lg text-sidebar-foreground">IndustrialApp</span>}
          </div>
          {isExpanded && (
            <button onClick={togglePin} className="p-1 hover:bg-sidebar-accent rounded-[0.65rem] transition-colors">
              {isPinned ? (
                <Pin className="w-4 h-4 text-sidebar-primary" />
              ) : (
                <PinOff className="w-4 h-4 text-sidebar-accent-foreground" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <a
                href={item.href}
                className="flex items-center space-x-3 p-3 rounded-[0.65rem] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group"
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isExpanded && <span className="text-sm font-medium">{item.label}</span>}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-muted-foreground">U</span>
          </div>
          {isExpanded && (
            <div>
              <p className="text-sm font-medium text-sidebar-foreground">Usuario</p>
              <p className="text-xs text-muted-foreground">Operador</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
