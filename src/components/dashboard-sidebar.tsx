"use client"

import { useState, useEffect } from "react"
import { Home, Settings, BarChart3, Users, Wrench, AlertTriangle, Pin, PinOff } from "lucide-react"
import Link from "next/link";

const tenantMenus: Record<string, { icon: any; label: string; href: string }[]> = {
  copower: [
    { icon: Home, label: "Home", href: "/dashboard" },
    { icon: BarChart3, label: "Reports", href: "/dashboard/reports" },
  ],
  techcorp: [
    { icon: BarChart3, label: "Análisis", href: "/dashboard/analytics" },
    { icon: Users, label: "Equipo", href: "/dashboard/staff" },
  ],
  default: [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: BarChart3, label: "Reportes", href: "/dashboard/reports" },
    { icon: AlertTriangle, label: "Alertas", href: "/dashboard/alerts" },
    { icon: Settings, label: "Configuración", href: "/dashboard/admin" },
    { icon: Settings, label: "Snowflake", href: "/dashboard/snowflake" },
  ]
}


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

  // Components for the sidebar
  const [menuItems, setMenuItems] = useState(tenantMenus.default)
  const [tenantName, setTenantName] = useState("Empresa")
  const [tenantLogo, setTenantLogo] = useState("/logos/copower.svg")

  useEffect(() => {
    const tenant = localStorage.getItem("tenant")
    if (tenant && tenantMenus[tenant]) {
      setMenuItems(tenantMenus[tenant])
      setTenantName(tenant)
      setTenantLogo(`/logos/${tenant}.svg`)
    }
  }, [])




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
            {tenantLogo ? (
              <img src={tenantLogo} alt="Logo" className="w-10 h-10 rounded-[0.65rem] object-contain" />
            ) : (
              <div className="w-8 h-8 bg-sidebar-primary rounded-[0.65rem] flex items-center justify-center">
                <Wrench className="w-5 h-5 text-sidebar-primary-foreground" />
              </div>
            )}
            {isExpanded && (
              <span className="font-semibold text-lg text-sidebar-foreground truncate">
                {tenantName}
              </span>
            )}
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
              <Link
                href={item.href}
                className="flex items-center space-x-3 p-3 rounded-[0.65rem] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group"
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isExpanded && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center space-x-3">
          <img
            src="/logos/cathaleia.png"
            alt="Logo"
            className="w-8 h-8 rounded-[0.65rem] object-contain"
          />
          {isExpanded && (
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-sidebar-foreground">CathaleIA</p>
              <p className="text-xs text-muted-foreground">v1.0.0</p>
            </div>
          )}
        </div>
      </div>


    </div>
  )
}
