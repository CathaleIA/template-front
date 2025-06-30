"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { useEffect, useState } from "react"
import { useUser } from "@/context/UserContext"

import { SIDEBAR_BY_TENANT } from '@/utils/sidebar-config'
import type { SidebarData, NavUserData } from "@/types"



export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { userr } = useUser();

  const [sidebarData, setSidebarData] = useState<SidebarData | null>(null)

  useEffect(() => {
    const tenant = userr?.tenantName?.toLowerCase()

    if (tenant && tenant in SIDEBAR_BY_TENANT) {
      setSidebarData(SIDEBAR_BY_TENANT[tenant])
    } else {
      setSidebarData(null) // o SIDEBAR_BY_TENANT['default']
    }
  }, [userr?.tenantName])


  const tenantLogo = userr?.tenantName ? `/logos/${userr?.tenantName}.svg` : "/cathaleia.png"
  const navUserData: NavUserData = {
    name: userr?.userName?.toString() ?? "Usuario",
    email: userr?.email ?? "correo@desconocido.com",
    avatar: "/avatars/default.png" // usa tu ruta preferida
  }

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex w-15 h-10 items-center justify-center rounded-md bg-white">
                  <img
                    src={tenantLogo}
                    alt={`${"hola"} logo`}
                    className="h-full object-contain px-2"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{userr?.tenantName}</span>
                  <span className="truncate text-xs">{userr?.tenantTier}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {sidebarData && <NavMain items={sidebarData.navMain} />}
        {sidebarData?.projects && <NavProjects projects={sidebarData.projects} />}
        {userr?.userRole === 'TenantAdmin' && sidebarData?.navSecondary && (
          <NavSecondary items={sidebarData.navSecondary} className="mt-auto" />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUserData} />
      </SidebarFooter>
    </Sidebar>
  )
}
