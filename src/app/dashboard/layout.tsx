import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import ProtectedRoute from "@/context/ProtectedRoute"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="[--header-height:calc(theme(spacing.14))] min-h-screen overflow-hidden">
        <SidebarProvider className="flex h-screen flex-col">
          <SiteHeader />
          <div className="flex flex-1 min-h-0">
            <AppSidebar />
            <SidebarInset className="flex flex-1 flex-col overflow-hidden">
              <main className="flex-1 overflow-auto p-4">{children}</main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    </ProtectedRoute>

  )
}
