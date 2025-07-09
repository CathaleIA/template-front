// sidebar-config.ts - Configuración actualizada
import { NotepadText, ChartArea, Settings, LifeBuoy, Send, Frame, UserSearch, Folder, Cpu } from 'lucide-react'
import type { SidebarData } from "@/types/sidebar"

export const SIDEBAR_BY_TENANT: Record<string, SidebarData> = {
  copower: {
    navMain: [
      {
        title: "Generar Reportes",
        url: "/dashboard",
        icon: NotepadText,
        items: [
          { title: "Generar reportes", url: "/dashboard/reports" },
          { title: "Listar reportes", url: "/dashboard/listreports" },
        ],
      },
      {
        title: "Visualización I & D",
        icon: NotepadText,
        items: [
          {
            title: "CAMPO 1",
            url: "/dashboard/historico",
            icon: Folder,
            items: [
              {
                title: "Motor",
                url: "/dashboard/alerts",
                icon: Cpu
              },
              {
                title: "Administrar",
                url: "/dashboard/admin",
                icon: Settings
              }
            ]
          }
        ]
      },
    ],
    projects: [
      {
        name: "User Management",
        url: "/dashboard/users",
        icon: UserSearch,
      },
    ],
    navSecondary: [
      {
        title: "Support",
        url: "#",
        icon: LifeBuoy,
      },
      {
        title: "Feedback",
        url: "#",
        icon: Send,
      },
    ],
  },
  innovalub: {
    navMain: [
      {
        title: "Visualización de Data",
        url: "/dashboard/alerts",
        icon: ChartArea,
        items: [
          { title: "Análisis de sensores", url: "/dashboard/sensors" },
          { title: "Alertas operativas", url: "/dashboard/alerts" },
        ],
      },
    ],
    projects: [
      {
        name: "Design Engineering",
        url: "#",
        icon: Frame,
      },
    ],
    navSecondary: [
      {
        title: "Support",
        url: "#",
        icon: LifeBuoy,
      },
      {
        title: "Feedback",
        url: "#",
        icon: Send,
      },
    ],
  },
}