import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
} from "@/components/ui/sidebar"

import { Skeleton } from "@/components/ui/skeleton"

import { Separator } from "@/components/ui/separator"
import { ChevronRight, File, Folder } from "lucide-react"

// Skeleton para items de menú simples
function MenuItemSkeleton() {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton>
        <File className="opacity-50" />
        <Skeleton className="h-4 w-20" />
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

// Skeleton para el NavUser en el footer
function NavUserSkeleton() {
  return (
    <div className="flex items-center gap-2 px-2 py-2">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex flex-col gap-1 flex-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-2 w-32" />
      </div>
    </div>
  )
}


// Skeleton para carpetas colapsibles
function CollapsibleMenuSkeleton({ withSubItems = true }: { withSubItems?: boolean }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton>
        <ChevronRight className="opacity-50" />
        <Folder className="opacity-50" />
        <Skeleton className="h-4 w-16" />
      </SidebarMenuButton>
      {withSubItems && (
        <SidebarMenuSub>
          <MenuItemSkeleton />
          <MenuItemSkeleton />
          <MenuItemSkeleton />
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  )
}

// Skeleton principal del AppSidebar
export default function AppSidebarSkeleton() {
  return (
    <Sidebar className="top-(--header-height) h-[calc(100svh-var(--header-height))]!">
      <SidebarHeader className="gap-0 px-0 justify-center">
        <div className="flex h-18 w-full items-center justify-center bg-sidebar">
          <Skeleton className="h-16 w-40" />
        </div>
        <div className="flex items-center justify-center px-3 py-2">
          <Skeleton className="h-4 w-24" />
          <Separator orientation="vertical" className="mx-3" />
          <Skeleton className="h-4 w-20" />
        </div>
      </SidebarHeader>

      <Separator />

      <SidebarContent>
        {/* Admin section skeleton */}
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <MenuItemSkeleton />
              {/* <MenuItemSkeleton /> */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Files section skeleton */}
        <SidebarGroup>
          <SidebarGroupLabel>Services</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <CollapsibleMenuSkeleton withSubItems={true} />
              <CollapsibleMenuSkeleton withSubItems={false} />
              {/* <MenuItemSkeleton />
              <MenuItemSkeleton />
              <CollapsibleMenuSkeleton withSubItems={true} /> */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <Separator />

      <SidebarFooter>
        <NavUserSkeleton />
      </SidebarFooter>
    </Sidebar>
  )
}