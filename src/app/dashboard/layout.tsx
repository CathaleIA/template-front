
import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"

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
    <div className="flex">
      <AppSidebar />
      <main
        className={`flex-1 pt-14 min-h-screen transition-all duration-200 ease-in-out 
        }`}
      >
        {children}
      </main>
    </div>
  )
}
