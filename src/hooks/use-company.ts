"use client"

import { useState, useEffect } from "react"
import type { Company } from "@/types/tenant"

export function useCompany() {
  const [company, setCompany] = useState<Company | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      // Cambia 'company_data' por la key que estés usando
      const stored = localStorage.getItem("tenant")
      if (stored) {
        const companyData = JSON.parse(stored)
        setCompany(companyData)
      }
    } catch (error) {
      console.error("Error loading company data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    company,
    isLoading,
    companyName: company?.name || "Dashboard",
    companyLogo: company?.logo,
  }
}
