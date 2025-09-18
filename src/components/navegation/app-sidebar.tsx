"use client"

import {
  AudioWaveform,
  BookOpen,
  Brain,
  Command,
  GalleryVerticalEnd,
  ClipboardMinus,
  Rotate3d,
  Users,
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
import { NavSettings } from "./nav-settings"
import { tenantConfigs } from "@/lib/navegation-tenant-config"

// const data = {
//   user: {
//     name: "shadcn",
//     email: "m@example.com",
//     avatar: "/avatars/shadcn.jpg",
//   },
//   teams: [
//     {
//       name: "Acme Inc",
//       logo: GalleryVerticalEnd,
//       plan: "Enterprise",
//     },
//     {
//       name: "Acme Corp.",
//       logo: AudioWaveform,
//       plan: "Startup",
//     },
//     {
//       name: "Evil Corp.",
//       logo: Command,
//       plan: "Free",
//     },
//   ],
//   navMain: [
//     {
//       title: "Servicio de Reportes",
//       url: "*",
//       icon: ClipboardMinus,
//       isActive: false,
//       items: [
//         {
//           title: "Crear",
//           url: "/dashboard/reports",
//         },
//         {
//           title: "Listar",
//           url: "#",
//         },
//         {
//           title: "Configurar",
//           url: "#",
//         },
//       ],
//     },
//     {
//       title: "Analisis de Sitio",
//       url: "#",
//       icon: Brain,
//       isActive: false,
//       sites: [
//         {
//           title: "Campo CTY",
//           url: "/dashboard/tendencydata/cty/gen51",
//           sistemas: [
//             {
//               title: "GEN 51",
//               url: "#",
//               items: [
//                 {
//                   title: "Analisis Inteligente",
//                   url: "/dashboard/analisis/cty/gen51",
//                 },
//                 {
//                   title: "Tendencia de datos",
//                   url: "/dashboard/tendencydata/cty/gen51",
//                 },
//                 {
//                   title: "Administracion",
//                   url: "/dashboard/admin/cty/gen51",
//                 },
//               ]
//             },
//             {
//               title: "GEN 52",
//               url: "#",
//               items: [
//                 {
//                   title: "Analisis Inteligente",
//                   url: "/dashboard/analisis/cty/gen52",
//                 },
//                 {
//                   title: "Tendencia de datos",
//                   url: "/dashboard/tendencydata/cty/gen52",
//                 },
//                 {
//                   title: "Administracion",
//                   url: "/dashboard/admin/cty/gen52",
//                 },
//               ]
//             },
//           ],
//         },
//         {
//           title: "Campo Miraflores",
//           url: "/dashboard/tendencydata",
//           sistemas: [
//             {
//               title: "Turbina 001",
//               url: "#",
//               items: [
//                 {
//                   title: "Analisis Inteligente",
//                   url: "#",
//                 },
//                 {
//                   title: "Tendencia de datos",
//                   url: "#",
//                 },
//                 {
//                   title: "Administracion",
//                   url: "#",
//                 },
//               ]
//             },
//           ],
//         },
//       ],
//     },
//     {
//       title: "Desarrollo",
//       url: "#",
//       icon: BookOpen,
//       items: [
//         {
//           title: "Cliente Apollo",
//           url: "/dashboard/test",
//         },
//       ],
//     },
//     {
//       title: "Activos Generales",
//       url: "/dashboard/activo",
//       icon: Rotate3d,
//     },
//   ],
//   settings: [
//     {
//       name: "Users Managment",
//       url: "/dashboard/users",
//       icon: Users,
//     },
//   ],
// }

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
