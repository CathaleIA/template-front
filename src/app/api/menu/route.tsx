import { NextResponse } from "next/server"

export type MenuItem = {
  id: number
  label: string
  icon: string
  route: string
  badge?: string
  items?: {
    title: string
    url: string
  }[]
}

export async function GET() {
  try {
    const menuItems: MenuItem[] = [
      {
        id: 1,
        label: "Dashboard",
        icon: "Home",
        route: "/dashboard",
      },
      {
        id: 2,
        label: "Snowflake",
        icon: "Database",
        route: "/dashboard/snowflake",
        items: [
          { title: "Conexiones", url: "/dashboard/snowflake/connections" },
          { title: "Consultas", url: "/dashboard/snowflake/queries" },
          { title: "Esquemas", url: "/dashboard/snowflake/schemas" },
        ],
      },
      {
        id: 3,
        label: "Reports",
        icon: "FileText",
        route: "/dashboard/reports",
        items: [
          { title: "Pruebas Electricas", url: "/dashboard/reports/pruebas-electricas" },
          { title: "Informes CTY", url: "/dashboard/reports/informes-campo" },
          { title: "Plantilla Test", url: "/dashboard/reports/test" },
        ],
      },
      {
        id: 4,
        label: "Alerts",
        icon: "Bell",
        route: "/dashboard/alerts",
        badge: "3",
      },
      {
        id: 5,
        label: "Administrar",
        icon: "Settings",
        route: "/dashboard/admin",
        items: [
          { title: "Usuarios", url: "/dashboard/admin/users" },
          { title: "Configuración params", url: "/dashboard/admin/settings" },
          { title: "Logs", url: "/dashboard/admin/logs" },
        ],
      },
    ]

    return NextResponse.json(menuItems, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("Error fetching menu items:", error)
    return NextResponse.json({ error: "Failed to fetch menu items" }, { status: 500 })
  }
}
