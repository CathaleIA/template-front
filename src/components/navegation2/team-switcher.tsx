"use client"

import * as React from "react"
import { ChevronsUpDown, Plus } from "lucide-react"
import Image from 'next/image'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import { UserInfo } from "@/types/user"


import AppSidebarSkeleton from "@/components/skeleton/app-sidebar-skeleton"
import { Separator } from "../ui/separator"

export function TeamSwitcher({
  user,
}: {
  user: UserInfo | null
}) {
  const { isMobile } = useSidebar()


  const tenantLogo = user?.tenantName ? `/logos/${user?.tenantName}.svg` : "/logos/cathaleia.svg"


  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src="/logos/cathaleia.svg" alt="empresa" />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight text-white">
                <span className="truncate font-medium">CATHALEIA</span>
                <span className="truncate text-xs">Platform</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xs bg-bg-inset ml-2"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Teams
            </DropdownMenuLabel>

            <DropdownMenuItem
              className="gap-2 p-2"
            >
              <div className="relative flex h-18 w-full items-center justify-center">
                <Image
                  src={tenantLogo}
                  fill
                  alt="Company Logo"
                  className="object-contain"
                  priority
                />
              </div>
              {/* Nombre y Tier en línea horizontal */}
              <div className="flex items-center justify-center px-3 py-2">
                <span className="truncate text-xs italic uppercase text-sidebar-foreground/60">
                  {user?.tenantName}
                </span>
                <Separator orientation="vertical" className="mx-3" />
                <DropdownMenuShortcut>⌘{user?.tenantTier}</DropdownMenuShortcut>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
