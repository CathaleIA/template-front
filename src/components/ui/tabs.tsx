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
        // Fondo transparente para que no interfiera con los SVGs
        "bg-transparent text-muted-foreground",
        // Flex que se adapta al contenido y permite overflow
        "inline-flex h-auto w-full items-center justify-start",
        // Padding reducido y sin restricciones de tamaño
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
        // Base: tamaño fijo, transición solo en ancho
        "relative group box-border min-w-0",
        "h-9.5 w-[150px]", // ancho fijo inicial
        "transition-[width] duration-300 ease-in-out",
        "hover:w-[200px] data-[state=active]:w-[200px]", // crece solo en X
        "flex items-center justify-center",
        // Solapamiento para que se vean superpuestos
        "-ml-7 first:ml-0", // asumo que era -ml-3 (lo corrijo)
        "focus:outline-none focus:z-20 focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        // Z-index para que el hover esté encima
        "hover:z-30 data-[state=active]:z-20",
        "px-3",
        "overflow-hidden",
        className
      )}
    >
      {/* Fondo: SVG por defecto (BLANCO) */}
      <ButtonShape
        className={cn(
          "absolute inset-0 w-full h-full text-background transition-all duration-200 pointer-events-none",
          "group-hover:opacity-0 group-data-[state=active]:opacity-0",
          // Asegurar que el SVG se ajuste correctamente
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
          // Si está activo Y hover, mostrar gris
          "group-data-[state=active]:group-hover:opacity-100",
          "object-contain"
        )}
        preserveAspectRatio="none"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Fondo: SVG para activo (AZUL) */}
      <ButtonShape
        className={cn(
          "absolute inset-0 w-full h-full text-sidebar-hover transition-all duration-200 pointer-events-none",
          "opacity-0 group-data-[state=active]:opacity-100",
          // // Si está activo Y hover, ocultar azul para mostrar gris
          // "group-data-[state=active]:group-hover:opacity-0",
          "object-contain"
        )}
        preserveAspectRatio="none"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Texto */}
      <span className="relative z-1 text-sm font-semibold text-primary leading-none drop-shadow-sm group-data-[state=active]:font-semibold group-data-[state=active]:text-text-active">
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
