"use client"


import {
  AudioWaveform,
  BookOpen,
  Brain,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  ClipboardMinus,
} from "lucide-react"

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

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Servicio de Reportes",
      url: "*",
      icon: ClipboardMinus,
      isActive: false,
      items: [
        {
          title: "Crear",
          url: "/dashboard/reports",
        },
        {
          title: "Listar",
          url: "#",
        },
        {
          title: "Configurar",
          url: "#",
        },
      ],
    },
    {
      title: "Analisis de Sitio",
      url: "#",
      icon: Brain,
      isActive: false,
      sites: [
        {
          title: "Campo CTY",
          url: "/dashboard/tendencydata",
          sistemas: [
            {
              title: "GEN 01",
              url: "#",
              items: [
                {
                  title: "Monitoreo en tiempo real",
                  url: "/dashboard/tiempoReal",
                },
                {
                  title: "Analisis Inteligente",
                  url: "/dashboard/analisis",
                },
                {
                  title: "Tendencia de datos",
                  url: "/dashboard/tendencydata/cty/gen51",
                },
                {
                  title: "Administracion",
                  url: "/dashboard/admin",
                },
                {
                  title: "Activos Actuales",
                  url: "/dashboard/activo",
                },
              ]
            },
            {
              title: "GEN 02",
              url: "#",
              items: [
                {
                  title: "Monitoreo en tiempo real",
                  url: "/dashboard/tiempoReal",
                },
                {
                  title: "Analisis Inteligente",
                  url: "/dashboard/analisis",
                },
                {
                  title: "Tendencia de datos",
                  url: "/dashboard/tendencydata/cty/gen52",
                },
                {
                  title: "Administracion",
                  url: "/dashboard/admin",
                },
                {
                  title: "Activos Actuales",
                  url: "/dashboard/activo",
                },
              ]
            },
          ],
        },
        {
          title: "Campo Miraflores",
          url: "/dashboard/tendencydata",
          sistemas: [
            {
              title: "Turbina 001",
              url: "#",
              items: [
                {
                  title: "Analisis Inteligente",
                  url: "#",
                },
                {
                  title: "Tendencia de datos",
                  url: "#",
                },
                {
                  title: "Administracion",
                  url: "#",
                },
                {
                  title: "Activos Actuales",
                  url: "#",
                },
              ]
            },
          ],
        },
      ],
    },
    {
      title: "Desarrollo",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Cliente Apollo",
          url: "/dashboard/test",
        },
        {
          title: "Tabs submenu",
          url: "/dashboard/tabtest",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Equipo",
          url: "/dashboard/users",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const { userr, logout } = useUser();

  const navUserData: NavUserData = {
    name: userr?.userName?.toString() ?? "Usuario",
    email: userr?.email ?? "correo@desconocido.com",
    avatar: "/avatars/default.png"
  }

  return (
    <Sidebar collapsible="icon" {...props} className="bg-sidebar-gradient border-none">
      <SidebarHeader className="bg-green-medium h-(--header-height)">
        <TeamSwitcher user={userr} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUserData} logout={logout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
