"use client"

import type React from "react"
import { Pin, PinOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

export function CustomSidebarTrigger({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { state, toggleSidebar } = useSidebar()
  const isCollapsed = state === "collapsed"

  // Estado local para el pin, inicializado según el estado inicial del sidebar
  const [isPinned, setIsPinned] = useState<boolean>(false)

  // Sincroniza el estado visual del botón cuando el sidebar cambia de forma externa
  useEffect(() => {
    setIsPinned(!isCollapsed)
  }, [isCollapsed])

  const handleClick = () => {
    const newPinnedState = !isPinned
    setIsPinned(newPinnedState)

    // Llama a toggleSidebar() solo si es necesario
    if ((newPinnedState && isCollapsed) || (!newPinnedState && !isCollapsed)) {
      toggleSidebar()
    }

    // Opcional: guardar en una variable global si lo necesitas
    if ((window as any).__sidebarSetPinned) {
      ;(window as any).__sidebarSetPinned(newPinnedState)
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleClick}
      className={cn(
        "h-9 w-9 shrink-0 transition-all duration-200",
        "hover:bg-accent hover:text-accent-foreground",
        "border-2 hover:border-primary/50",
        "shadow-sm hover:shadow-md hover:scale-105",
        "bg-background hover:bg-accent",
        isPinned && "bg-primary/10 border-primary/50",
        className,
      )}
      {...props}
    >
      {isPinned ? (
        <PinOff className="h-4 w-4" />
      ) : (
        <Pin className="h-4 w-4" />
      )}
      <span className="sr-only">
        {isPinned ? "Desfijar sidebar" : "Fijar sidebar"}
      </span>
    </Button>
  )
}