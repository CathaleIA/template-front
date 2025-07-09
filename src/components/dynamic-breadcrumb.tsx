"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem as UIBreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Home } from "lucide-react"

// Configuración para nombres más amigables
const routeNames: Record<string, string> = {
  users: "Usuarios",
  settings: "Configuración",
  profile: "Perfil",
  products: "Productos",
  orders: "Pedidos",
  analytics: "Analíticas",
  reports: "Reportes",
  admin: "Administración",
  billing: "Facturación",
  team: "Equipo",
  projects: "Proyectos",
  tasks: "Tareas",
  calendar: "Calendario",
  messages: "Mensajes",
  notifications: "Notificaciones",
}

interface BreadcrumbItem {
  label: string
  href: string
  isCurrentPage: boolean
}

export function DynamicBreadcrumb() {
  const pathname = usePathname()

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split("/").filter((segment) => segment !== "")
    const breadcrumbs: BreadcrumbItem[] = []


    // Generar breadcrumbs para cada segmento
    segments.forEach((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/")
      const isCurrentPage = index === segments.length - 1

      // Usar nombre amigable si existe, sino capitalizar el segmento
      const label = routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")

      breadcrumbs.push({
        label,
        href,
        isCurrentPage,
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  // No mostrar breadcrumb si solo hay "Inicio"
  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <Breadcrumb className="hidden sm:block">
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => (
          <div key={breadcrumb.href} className="flex items-center">
            <UIBreadcrumbItem>
              {breadcrumb.isCurrentPage ? (
                <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={breadcrumb.href} className="flex items-center">
                    {index === 0 && <Home className="h-4 w-4 mr-1" />}
                    {breadcrumb.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </UIBreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}