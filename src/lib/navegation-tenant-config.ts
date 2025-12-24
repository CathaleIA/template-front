import { NavItemMain } from "@/types"

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

export type TenantConfig = {
  navMain: NavItemMain[]
  settings?: { name: string; url: string; icon: any }[]
}

export const tenantConfigs: Record<string, TenantConfig> = {
  copower: {
    navMain: [
      {
        title: "Servicio de Reportes",
        url: "*",
        icon: ClipboardMinus,
        isActive: false,
        items: [
          { title: "Crear", url: "/dashboard/reports" },
          { title: "solar", url: "/dashboard/formulario-url-prefir" },
          { title: "Configurar", url: "#" },
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
            url: "/dashboard/tendencydata/cty/gen51",
            sistemas: [
              {
                title: "GEN 51",
                url: "#",
                items: [
                  { title: "Analisis Inteligente", url: "/dashboard/analisis/cty/gen51" },
                  { title: "Tendencia de datos", url: "/dashboard/tendencydata/cty/gen51" },
                  { title: "Administracion", url: "/dashboard/admin/cty/gen51" },
                ],
              },
              {
                title: "GEN 52",
                url: "#",
                items: [
                  { title: "Analisis Inteligente", url: "/dashboard/analisis/cty/gen52" },
                  { title: "Tendencia de datos", url: "/dashboard/tendencydata/cty/gen52" },
                  { title: "Administracion", url: "/dashboard/admin/cty/gen52" },
                ],
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
                  { title: "Analisis Inteligente", url: "#" },
                  { title: "Tendencia de datos", url: "#" },
                  { title: "Administracion", url: "#" },
                ],
              },
            ],
          },
        ],
      },
      {
        title: "Activos Generales",
        url: "/dashboard/activo",
        icon: Rotate3d,
      },
      {
        title: "Desarrollo",
        url: "#",
        icon: BookOpen,
        items: [{ title: "Cliente Apollo", url: "/dashboard/test" }],
      },
    ],
    settings: [
      { name: "Users Managment", url: "/dashboard/users", icon: Users },
    ],
  },

  pruebaselectricas: {
    navMain: [
      {
        title: "Servicio de Reportes",
        url: "*",
        icon: ClipboardMinus,
        isActive: false,
        items: [
          { title: "Crear", url: "/dashboard/reports" },
          { title: "Listar", url: "#" },
          { title: "Configurar", url: "#" },
        ],
      },
    ]
  },

  dautom: {
    navMain: [
      {
        title: "Servicio de Dashboard",
        url: "#",
        icon: ClipboardMinus,
        isActive: false,
        items: [
          { title: "Crear", url: "/motul-dashboard/reports" },
          { title: "Listar", url: "#" },
          { title: "Configurar", url: "#" },
        ],
      },
    ],
    settings: [
      { name: "Users Managment", url: "/dashboard/users", icon: Users },
    ],
  },
  motul:{
    navMain: [
      {
        title: "Servicio de Reportes",
        url: "#",
        icon: ClipboardMinus,
        isActive: false,
        items: [
          { title: "General", url: "/dashboard/general" },
          { title: "Cargar CSV", url: "#" }
        ],
      },
    ],
    settings: [
      { name: "Users Managment", url: "/dashboard/users", icon: Users },
    ],
  },

  default: {
    navMain: [
      {
        title: "Bienvenido",
        url: "/dashboard",
        icon: Brain,
        items: [{ title: "Configura tu tenant", url: "/dashboard/setup" }],
      },
    ],
    settings: [
      { name: "Users Managment", url: "/dashboard/users", icon: Users },
    ],
  },
}