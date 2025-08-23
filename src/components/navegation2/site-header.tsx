"use client"

import { SidebarIcon } from "lucide-react"

import { SearchForm } from "@/components/navegation/search-form"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"

import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb"

import { ThemeToggle } from "@/utils/theme-toggle"

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b px-2">
      <div className="flex h-(--header-height) w-full items-center gap-2">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <DynamicBreadcrumb/>
        
        <SearchForm className="w-full sm:ml-auto sm:w-auto" />
        <ThemeToggle/>
      </div>
    </header>
  )
}