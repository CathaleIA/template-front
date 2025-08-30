"use client"

import { PanelLeftClose } from "lucide-react"

import { SearchForm } from "@/components/navegation/search-form"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"

import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb"

import { ThemeToggle } from "@/utils/theme-toggle"

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()

  return (
    <header className="bg-green-dark sticky top-0 z-50 flex w-full items-center">
      <div className="flex h-(--header-height) w-full items-center justify-between gap-2">


        <div className="flex flex-row items-center max-w-full h-full max-h-[50%]">
          <button className="text-green-live font-bold pl-2 pr-5" onClick={toggleSidebar}>
            <PanelLeftClose className="size-5" />
          </button>
          <Separator data-slot="separator" orientation="vertical" className="bg-green-gray"/>
          <div className="max-w-full px-5">
            <DynamicBreadcrumb />
          </div>
        </div>


        <div className="h-full bg-green-dark pl-5 rounded-bl-full rounded-tl-full" style={{ boxShadow: '-10px 0 15px rgba(0, 0, 0, 0.53)' }}>
          <div className="flex flex-row gap-5 items-center px-10 h-full bg-green-medium rounded-bl-full rounded-tl-full">
            <SearchForm className="sm:ml-auto sm:w-auto" />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}