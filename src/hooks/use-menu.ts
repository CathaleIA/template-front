"use client"

import { useState, useEffect, useCallback } from "react"
import type { MenuItem } from "@/app/api/menu/route"

export function useMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMenuItems = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/menu", {
        next: { revalidate: 3600 }, // Cache por 1 hora
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setMenuItems(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching menu items:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMenuItems()
  }, [fetchMenuItems])

  const refreshMenu = async () => {
    await fetchMenuItems()
  }

  return {
    menuItems,
    isLoading,
    error,
    refreshMenu,
  }
}
