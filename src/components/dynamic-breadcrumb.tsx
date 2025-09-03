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
import { Fragment } from "react"

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

    segments.forEach((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/")
      const isCurrentPage = index === segments.length - 1
      const label = routeNames[segment] ||
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")

      breadcrumbs.push({ label, href, isCurrentPage })
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  const nopages: Array<string> = ["Tendencydata", "Cty"];

  if (breadcrumbs.length === 0) {
    return null
  }

  return (
    <Breadcrumb className="hidden sm:block">
      <BreadcrumbList className="flex items-center gap-1.5 sm:gap-2.5">
        {breadcrumbs.map((breadcrumb, index) => {
          const isExcluded = nopages.includes(breadcrumb.label);
          const isCurrentPage = breadcrumb.isCurrentPage;
          const showAsLink = !isExcluded && !isCurrentPage
          return (
            <Fragment key={breadcrumb.href}>
              <UIBreadcrumbItem>
                {showAsLink ? (
                  <BreadcrumbLink asChild>
                    <Link
                      href={breadcrumb.href}
                      className="text-blue-link flex items-center font-semibold hover:underline"
                      style={{ textDecorationThickness: '1px', textUnderlineOffset: '4px' }}
                    >
                      {index === 0 && <Home className="h-4 w-4 mr-1" />}
                      {breadcrumb.label}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <span className="text-muted-foreground flex items-center font-medium">
                    {index === 0 && <Home className="h-4 w-4 mr-1" />}
                    {breadcrumb.label}
                  </span>
                )}
              </UIBreadcrumbItem>

              {index < breadcrumbs.length - 1 && (
                <BreadcrumbSeparator className="flex h-6 items-center">
                  <span className="text-muted-foreground text-sm">/</span>
                </BreadcrumbSeparator>
              )}
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}