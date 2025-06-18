"use client"

import type * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useEffect, useRef } from "react"
import { Bell, Database, FileText, Home, Settings, ChevronRight, GalleryVerticalEnd } from "lucide-react"
import type { MenuItem } from "@/app/api/menu/route"

import {
  Sidebar,
  SidebarContent,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarMenuBadge,
  useSidebar,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useMenu } from "@/hooks/use-menu"
import { NavSkeleton } from "@/components/sidebar/nav-skeleton"

// Mapeo de iconos
const iconMap = {
  Home,
  Database,
  FileText,
  Bell,
  Settings,
} as const

type IconName = keyof typeof iconMap

// Componente de navegación principal
function NavMain({ items }: { items: MenuItem[] }) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navegación Principal</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const IconComponent = iconMap[item.icon as IconName] || Home
          const isActive = pathname === item.route || pathname.startsWith(item.route + "/")
          const hasSubItems = Boolean(item.items && item.items.length > 0)

          return (
            <Collapsible key={item.id} asChild defaultOpen={isActive} className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton isActive={isActive && !hasSubItems} className="transition-all duration-200">
                    {hasSubItems ? (
                      <div className="flex items-center w-full">
                        <IconComponent className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                        {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                        <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </div>
                    ) : (
                      <Link href={item.route} className="flex items-center w-full">
                        <IconComponent className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                        {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                      </Link>
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {hasSubItems && (
                  <CollapsibleContent className="transition-all duration-200">
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                            <Link href={subItem.url} className="transition-colors duration-200">
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

// Hook personalizado para manejar el hover del sidebar
function useSidebarHover() {
  const { state, setOpen } = useSidebar()
  const isCollapsed = state === "collapsed"
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isHoveringRef = useRef(false)
  const isPinnedRef = useRef(false)

  const handleMouseEnter = () => {
    if (isCollapsed && !isPinnedRef.current) {
      isHoveringRef.current = true
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
      setOpen(true)
    }
  }

  const handleMouseLeave = () => {
    if (!isPinnedRef.current) {
      isHoveringRef.current = false
      hoverTimeoutRef.current = setTimeout(() => {
        if (!isHoveringRef.current && !isPinnedRef.current) {
          setOpen(false)
        }
      }, 300) // Delay de 300ms antes de colapsar
    }
  }

  const setPinned = (pinned: boolean) => {
    isPinnedRef.current = pinned
    if (!pinned && !isHoveringRef.current) {
      setOpen(false)
    }
  }

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  return {
    handleMouseEnter,
    handleMouseLeave,
    setPinned,
    isPinned: isPinnedRef.current,
  }
}

// Componente principal del sidebar con hover temporal
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { menuItems, isLoading, error } = useMenu()
  const { handleMouseEnter, handleMouseLeave, setPinned } = useSidebarHover()



  // Pasar la función setPinned al contexto para que el trigger pueda usarla
  useEffect(() => {
    // Almacenar la función en el contexto global o usar un contexto personalizado
    ;(window as any).__sidebarSetPinned = setPinned
  }, [setPinned])

  return (
    <Sidebar
      collapsible="icon"
      className="transition-all duration-100 ease-in-out"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <SidebarContent className="transition-all duration-200">
        {isLoading ? (
          <NavSkeleton />
        ) : error ? (
          <SidebarGroup>
            <SidebarGroupLabel>Error</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton disabled>
                  <span className="text-red-500">Error al cargar el menú</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        ) : (
          <NavMain items={menuItems} />
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
