
import type React from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardNavbar } from "@/components/dashboard-navbar"

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const protectedCookies = [
    'cognito_access_token',
    'cognito_id_token',
    'cognito_refresh_token',
    'cognito_expires_at',
  ]

  const cookiesList = await cookies();

  const hasSession = protectedCookies.every((name) => cookiesList.has(name))

  if (!hasSession) {
    redirect('/select-tenant')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
