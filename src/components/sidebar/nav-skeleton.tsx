import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuSkeleton } from "@/components/ui/sidebar"

export function NavSkeleton() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Cargando...</SidebarGroupLabel>
      <SidebarMenu>
        {Array.from({ length: 5 }).map((_, index) => (
          <SidebarMenuSkeleton key={index} showIcon />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
