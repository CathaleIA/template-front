// types/sidebar.ts
import { LucideIcon } from "lucide-react"

export interface SidebarData {
  navMain: Array<{
    title: string
    url: string
    icon: LucideIcon
    items?: Array<{ title: string; url: string }>
  }>
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
