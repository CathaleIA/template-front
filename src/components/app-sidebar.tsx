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
} from "@/components/ui/sidebar"

import { useEffect, useState } from "react"
import { useUser } from "@/context/UserContext"

import { SIDEBAR_BY_TENANT } from '@/utils/sidebar-config'
import type { SidebarData, NavUserData } from "@/types"

import { Separator } from "@/components/ui/separator"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { userr } = useUser();

  const [sidebarData, setSidebarData] = useState<SidebarData | null>(null)

  useEffect(() => {
    const tenant = userr?.tenantName?.toLowerCase()

    if (tenant && tenant in SIDEBAR_BY_TENANT) {
      setSidebarData(SIDEBAR_BY_TENANT[tenant])
    } else {
      setSidebarData(null)
    }
  }, [userr?.tenantName])


  const tenantLogo = userr?.tenantName ? `/logos/${userr?.tenantName}.svg` : "/logos/cathaleia.png"
  const navUserData: NavUserData = {
    name: userr?.userName?.toString() ?? "Usuario",
    email: userr?.email ?? "correo@desconocido.com",
    avatar: "/avatars/default.png"
  }

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader className="gap-0 px-0 justify-center">
        {/* Logo a ancho completo */}
        <div className="flex h-18 w-full items-center justify-center bg-sidebar">
            <img
              src={tenantLogo}
              alt="Company Logo"
              className="h-full w-full object-contain"
            />
        </div>

        {/* Nombre y Tier en línea horizontal */}
        <div className="flex items-center justify-center px-3 py-2">
          <span className="truncate text-xs italic uppercase text-sidebar-foreground/60">
            {userr?.tenantName}
          </span>
          <Separator orientation="vertical" className="mx-3" />
          <span className="text-xs italic text-sidebar-foreground/40">
            {userr?.tenantTier}
          </span>
        </div>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        {sidebarData && <NavMain items={sidebarData.navMain} />}
        {sidebarData?.projects && <NavProjects projects={sidebarData.projects} />}
        {userr?.userRole === 'TenantAdmin' && sidebarData?.navSecondary && (
          <NavSecondary items={sidebarData.navSecondary} className="mt-auto" />
        )}
      </SidebarContent>
      <Separator />
      <SidebarFooter>
        <NavUser user={navUserData} />
      </SidebarFooter>
    </Sidebar>
  )
}
