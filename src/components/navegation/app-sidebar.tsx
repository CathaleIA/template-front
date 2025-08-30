"use client"

import * as React from "react"
import Image from 'next/image'

import { NavUser } from "@/components/navegation/nav-user"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar"

import AppSidebarSkeleton from "@/components/skeleton/app-sidebar-skeleton"



import { ChevronRight, File, Folder } from "lucide-react"

import { useEffect, useState } from "react"
import { useUser } from "@/context/UserContext"

import { SIDEBAR_BY_TENANT } from '@/utils/sidebar-config'
import type { ProjectData, NavUserData, TreeNode, TreeItem } from "@/types"

import { Separator } from "@/components/ui/separator"
import Link from "next/link"


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { userr, loading } = useUser();

  const [sidebarData, setSidebarData] = useState<ProjectData | null>(null)

  useEffect(() => {
    const tenant = userr?.tenantName?.toLowerCase()

    if (tenant && tenant in SIDEBAR_BY_TENANT) {
      setSidebarData(SIDEBAR_BY_TENANT[tenant])
    } else {
      setSidebarData(null)
    }
  }, [userr?.tenantName])


  const tenantLogo = userr?.tenantName ? `/logos/${userr?.tenantName}.svg` : "/logos/cathaleia.svg"
  const navUserData: NavUserData = {
    name: userr?.userName?.toString() ?? "Usuario",
    email: userr?.email ?? "correo@desconocido.com",
    avatar: "/avatars/default.png"
  }

  // Mostrar skeleton mientras carga
  if (loading || !userr) {
    return <AppSidebarSkeleton />
  }

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader className="gap-0 px-0 justify-center">
        {/* <div className="flex h-18 w-full items-center justify-center bg-sidebar">
          <Image
            src={tenantLogo}
            width={500}
            height={400}
            alt="Company Logo"
            className="h-full w-full object-contain"
          />
        </div> */}
        <div className="relative flex h-18 w-full items-center justify-center">
          <Image
            src={tenantLogo}
            // width={500}
            // height={400}
            fill
            alt="Company Logo"
            className="object-contain"
            priority
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
        {userr?.userRole === 'TenantAdmin' && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarData?.admin.map((item, index) => (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <File />
                        <span>{item.file}</span>
                      </Link>
                    </SidebarMenuButton>
                    <SidebarMenuBadge>{item.state}</SidebarMenuBadge>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        <SidebarGroup>
          <SidebarGroupLabel>Services</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarData?.tree.map((item, index) => (
                <Tree key={index} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <Separator />
      <SidebarFooter>
        <NavUser user={navUserData} />
      </SidebarFooter>
    </Sidebar>
  )
}

// Función helper para verificar si un item es TreeItem
function isTreeItem(item: TreeNode): item is TreeItem {
  return typeof item === 'object' && !Array.isArray(item) && 'title' in item && 'url' in item
}

function Tree({ item }: { item: TreeNode }) {
  // Si es un TreeItem individual (archivo)
  if (isTreeItem(item)) {
    return (
      <SidebarMenuButton asChild>
        <Link href={item.url}>
          <File />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    )
  }

  // Si es un array (carpeta con contenido)
  if (Array.isArray(item)) {
    const [firstItem, ...restItems] = item

    // El primer elemento debe ser TreeItem (nombre de la carpeta)
    if (!isTreeItem(firstItem)) {
      return null
    }

    // Si no hay más elementos, es una carpeta vacía
    if (restItems.length === 0) {
      return (
        <SidebarMenuButton asChild>
          <Link href={firstItem.url}>
            <Folder />
            <span>{firstItem.title}</span>
          </Link>
        </SidebarMenuButton>
      )
    }

    // Es una carpeta con contenido
    return (
      <SidebarMenuItem>
        <Collapsible
          className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
          defaultOpen={firstItem.title === "components" || firstItem.title === "ui"}
        >
          <CollapsibleTrigger asChild>
            <SidebarMenuButton>
              <ChevronRight className="transition-transform" />
              <Folder />
              {firstItem.title}
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {restItems.map((subItem, index) => (
                <Tree key={index} item={subItem} />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>
    )
  }

  // Fallback para casos no manejados
  return null
}