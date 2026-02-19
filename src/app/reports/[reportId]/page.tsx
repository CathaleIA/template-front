"use client"

import { useParams } from "next/navigation"
import { WebReportViewer } from "@/components/reports/web-report-viewer"
import { useEffect, useState } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function StandaloneReportPage() {
    const params = useParams()
    const reportId = params.reportId as string
    const [reportData, setReportData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchReport() {
            try {
                setLoading(true)
                const response = await fetch(`/api/reports/${reportId}`)
                if (response.ok) {
                    const data = await response.json()
                    setReportData(data)
                } else {
                    console.error("Report not found or error:", response.status)
                    setReportData(null)
                }
            } catch (err) {
                console.error("Error fetching report:", err)
                setReportData(null)
            } finally {
                setLoading(false)
            }
        }

        if (reportId) {
            fetchReport()
        }
    }, [reportId])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
                <Loader2 className="w-12 h-12 text-[#22c55e] animate-spin" />
                <p className="text-muted-foreground animate-pulse">Cargando reporte industrial...</p>
            </div>
        )
    }

    if (!reportData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-6 px-4 text-center">
                <div className="bg-destructive/10 p-6 rounded-full">
                    <AlertCircle className="w-16 h-16 text-destructive" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Resumen no encontrado</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        El enlace parece haber expirado o es incorrecto. Por favor, solicita un nuevo análisis al asistente.
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/dashboard">Volver al Dashboard</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10">
            <div className="container mx-auto px-4 md:px-10">
                <WebReportViewer reportId={reportId} data={reportData} />
            </div>
        </div>
    )
}
