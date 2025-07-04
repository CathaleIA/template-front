import type React from "react"

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import { Toaster } from "@/components/ui/sonner"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const cookieStore = await cookies()
  const idToken = cookieStore.get('cognito_id_token')?.value

  if (!idToken) {
    redirect('/select-tenant')
  }

  // Decode the JWT payload
  let payload: any
  try {
    const base64Url = idToken.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    payload = JSON.parse(jsonPayload)
  } catch (err) {
    console.error('Error decoding JWT in layout:', err)
    redirect('/select-tenant')
  }

  // Validate expiration
  const now = Math.floor(Date.now() / 1000)
  if (!payload.exp || payload.exp < now) {
    console.warn('Token expired')
    redirect('/select-tenant')
  }



  return (
    <div className="[--header-height:calc(theme(spacing.14))] min-h-screen overflow-hidden">
      <SidebarProvider className="flex h-screen flex-col">
        <SiteHeader />
        <div className="flex flex-1 min-h-0">
          <AppSidebar />
          <SidebarInset className="flex flex-1 flex-col overflow-hidden">
            <main className="flex-1 overflow-auto p-4">
              <Toaster position="top-right" />
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
