"use client"

import type React from "react"
import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

  return (
    <div className="flex">
      <AppSidebar onExpandedChange={setSidebarExpanded} />
      <main
        className={`flex-1 pt-14 min-h-screen transition-all duration-200 ease-in-out ${
          sidebarExpanded ? "ml-64" : "ml-16"
        }`}
      >
        {children}
      </main>
    </div>
  )
}
