import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

import ButtonShape from "@/assets/boton.svg"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-transparent text-muted-foreground",
        "inline-flex h-auto w-full items-center justify-start",
        "p-0 gap-0",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      {...props}
      className={cn(
        "relative group box-border min-w-0",
        "h-9.5 w-[150px]",
        "transition-[width] duration-300 ease-in-out",
        "hover:w-[200px] data-[state=active]:w-[200px]",
        "flex items-center justify-center",
        "-ml-7 first:ml-0",
        "focus:outline-none focus:z-20 focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        "hover:z-2 data-[state=active]:z-3",
        "px-3 cursor-pointer",
        "overflow-hidden",
        className
      )}
    >
      {/* Fondo: SVG por defecto (BLANCO) */}
      <ButtonShape
        className={cn(
          "absolute inset-0 w-full h-full text-background transition-all duration-200 pointer-events-none",
          "group-hover:opacity-0 group-data-[state=active]:opacity-0",
          "object-contain"
        )}
        preserveAspectRatio="none"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Fondo: SVG para hover (GRIS) */}
      <ButtonShape
        className={cn(
          "absolute inset-0 w-full h-full text-ring/60 transition-all duration-200 pointer-events-none",
          "opacity-0 group-hover:opacity-100",
          "group-data-[state=active]:group-hover:opacity-100",
          "object-contain",
        )}
        preserveAspectRatio="none"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Fondo: SVG para activo (AZUL) */}
      <ButtonShape
        className={cn(
          "absolute inset-0 w-full h-full text-blue-hover transition-all duration-200 pointer-events-none",
          "opacity-0 group-data-[state=active]:opacity-100",
          "object-contain"
        )}
        preserveAspectRatio="none"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Texto */}
      <span className="relative z-1 text-sm font-semibold text-primary leading-none drop-shadow-sm group-data-[state=active]:font-semibold group-data-[state=active]:text-blue-link">
        {children}
      </span>
    </TabsPrimitive.Trigger>
  )
}
function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
