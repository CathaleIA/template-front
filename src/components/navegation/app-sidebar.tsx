"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { TeamSwitcher } from "./team-switcher"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { NavUserData } from "@/types"
import { useUser } from "@/context/UserContext"
import { NavSettings } from "./nav-settings"
import { tenantConfigs } from "@/lib/navegation-tenant-config"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const { userr, logout } = useUser();
  const tenantKey = userr?.tenantName?.toLowerCase() || "default"
  const data = tenantConfigs[tenantKey] || tenantConfigs.default
  const navUserData: NavUserData = {
    name: userr?.userName?.toString() ?? "Usuario",
    email: userr?.email ?? "correo@desconocido.com",
    avatar: "/avatars/default.png"
  }

  return (
    <Sidebar collapsible="icon" {...props} className="border-none">
      <SidebarHeader>
        <TeamSwitcher user={userr} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {
          userr?.userRole === "TenantAdmin" && data.settings && data.settings.length > 0
            ? <NavSettings settings={data.settings} />
            : []
        }
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUserData} logout={logout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
