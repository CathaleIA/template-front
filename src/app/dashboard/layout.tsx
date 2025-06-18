import type React from "react"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TopNavbar } from "@/components/navbar/top-navbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Datos del usuario
  const userData = {
    name: "Usuario Admin",
    email: "admin@copower.com",
    avatar: "/placeholder.svg?height=40&width=40",
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-1 flex-col">
          <TopNavbar user={userData} />
          <main className="flex flex-1 flex-col overflow-hidden mt-16">
            <div className="flex-1 overflow-auto p-6">{children}</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
