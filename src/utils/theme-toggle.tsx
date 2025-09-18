"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Evitar hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Usar resolvedTheme para saber si está en dark o light, incluso en modo system
  const isDark = resolvedTheme === "dark"
  const isSystem = theme === "system"

  const handleToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light")
  }

  return (
    <div className="flex items-center space-x-0.5">
      <Switch id="theme-toggle" checked={isDark} onCheckedChange={handleToggle} aria-label="Toggle theme" />
      <Label htmlFor="theme-toggle" className="sr-only">
        Toggle between light and dark theme
      </Label>

    </div>
  )
}
