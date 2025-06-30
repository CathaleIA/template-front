import { NotepadText, ChartArea, Settings, LifeBuoy, Send, Frame, PieChart } from 'lucide-react'

import type { SidebarData } from "@/types"


export const SIDEBAR_BY_TENANT: Record<string, SidebarData> = {
  copower: {
    navMain: [
      {
        title: "Generar Reportes",
        url: "/dashboard/reports",
        icon: NotepadText,
        items: [
          { title: "Listar reportes", url: "#" },
          { title: "Configuraciones", url: "#" },
        ],
      },
    ],
    projects: [
      {
        name: "User Management",
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
