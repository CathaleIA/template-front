"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"



function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer data-[state=checked]:bg-card data-[state=unchecked]:bg-card focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.60rem] w-12 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 shadow-md",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-background shadow-sm dark:data-[state=checked]:bg-background pointer-events-none block size-6 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0",
          "flex items-center justify-center"
        )}
      >
        { props.checked 
          ? <Moon className="w-4 h-4"/>
          : <Sun className="w-4 h-4"/>
        }
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  )
}

export { Switch }