// types/sidebar.ts
import { LucideIcon } from "lucide-react"

// Interfaz recursiva para items de navegación
export interface NavItem {
  title: string
  url?: string
  icon?: LucideIcon
  items?: NavItem[] // Permite anidación recursiva
  isActive?: boolean
}

// Interfaz principal para items del menú
export interface MainNavItem {
  title: string
  url?: string
  icon: LucideIcon
  isActive?: boolean
  items?: NavItem[] // Usa la interfaz recursiva
}

export interface SidebarData {
  navMain: MainNavItem[]
  navSecondary?: Array<{
    title: string
    url: string
    icon: LucideIcon
  }>
  projects?: Array<{
    name: string
    url: string
    icon: LucideIcon
  }>
}

export interface ProjectData {
  admin: Array<{
    file: string
    state: string
    url:string
  }>
  tree: TreeNode[]
}

// Tipo de item individual con título y URL
export interface TreeItem {
  title: string
  url: string
}

// Tipo que permite arrays mixtos con TreeItems y otros arrays
export type TreeNode = TreeItem | Array<TreeItem | TreeNode>
