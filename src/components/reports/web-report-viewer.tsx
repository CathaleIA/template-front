"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Download, FileText, Share2, Printer, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown } from "lucide-react"
import dynamic from "next/dynamic"

// Importar Plotly dinámicamente para evitar problemas de SSR
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

interface WebReportViewerProps {
    reportId: string
    data: {
        title: string
        date?: string
        summary: string
        conclusions?: string[]
        anomalies?: Array<{
            severity: 'critical' | 'warning' | 'info'
            message: string
            variable: string
        }>
        charts?: Array<{
            title?: string
            data: any[]
            layout?: any
        }>
    }
}

export function WebReportViewer({ reportId, data }: WebReportViewerProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header del Reporte */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <Badge variant="outline" className="mb-2 border-primary/50 text-primary uppercase tracking-wider text-[10px]">
                        Reporte generado por AI
                    </Badge>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">{data.title}</h2>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                        <FileText className="w-4 h-4" />
                        ID: {reportId}{data.date ? ` | Generado el ${data.date}` : ''}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:bg-primary/5">
                        <Share2 className="w-4 h-4" /> Compartir
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:bg-primary/5">
                        <Printer className="w-4 h-4" /> Imprimir
                    </Button>
                    <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Download className="w-4 h-4" /> Exportar PDF
                    </Button>
                </div>
            </div>

            <Separator className="bg-primary/10" />

            {/* Grid de Resumen y Alertas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Resumen Ejecutivo */}
                <Card className="lg:col-span-2 border-primary/10 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2 text-primary">
                            <TrendingUp className="w-5 h-5" />
                            Resumen Ejecutivo
                        </CardTitle>
                        <CardDescription>
                            Análisis consolidado del comportamiento del equipo.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-foreground/90 leading-relaxed italic border-l-4 border-primary/30 pl-4 py-2 bg-primary/5 rounded-r-lg">
                            "{data.summary}"
                        </p>
                    </CardContent>
                </Card>

                {/* Estado de Salud / Anomalías */}
                <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2 text-primary">
                            <AlertTriangle className="w-5 h-5" />
                            Estado de Salud
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {(data.anomalies ?? []).length > 0 ? (
                            (data.anomalies ?? []).map((anomaly, idx) => (
                                <div key={idx} className={`p-3 rounded-lg border flex gap-3 ${anomaly.severity === 'critical' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                    anomaly.severity === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                                        'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                    }`}>
                                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-semibold uppercase text-[10px] tracking-widest mb-1">{anomaly.severity}</p>
                                        <p className="text-foreground/80">{anomaly.message}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex gap-3 text-green-500">
                                <CheckCircle2 className="w-6 h-6 shrink-0" />
                                <p className="text-sm">Operación dentro de los límites normales. No se detectaron anomalías en el periodo.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Visualización de Datos (Gráficas) */}
            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-xl text-primary">Comportamiento Histórico (S3)</CardTitle>
                    <CardDescription>Visualización interactiva de variables críticas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-10">
                        {(data.charts ?? []).map((chart, idx) => (
                            <div key={idx} className="space-y-4">
                                <h3 className="text-lg font-medium text-foreground/80 pl-4 border-l-2 border-primary/50">
                                    {chart.title || chart.layout?.title || `Gráfico ${idx + 1}`}
                                </h3>
                                <div className="w-full h-[400px] bg-background/40 rounded-xl overflow-hidden border border-primary/5 flex items-center justify-center">
                                    <Plot
                                        data={chart.data}
                                        layout={{
                                            ...chart.layout,
                                            autosize: true,
                                            paper_bgcolor: 'rgba(0,0,0,0)',
                                            plot_bgcolor: 'rgba(0,0,0,0)',
                                            font: { color: '#888' },
                                            xaxis: { gridcolor: 'rgba(128,128,128,0.1)', zerolinecolor: 'rgba(128,128,128,0.2)' },
                                            yaxis: { gridcolor: 'rgba(128,128,128,0.1)', zerolinecolor: 'rgba(128,128,128,0.2)' },
                                            margin: { t: 30, b: 40, l: 60, r: 20 },
                                        }}
                                        useResizeHandler={true}
                                        className="w-full h-full"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Conclusiones Técnicas Detalladas */}
            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
                <CardHeader>
                    <CardTitle className="text-2xl text-primary">Conclusiones y Recomendaciones</CardTitle>
                    <CardDescription>Basado en el análisis de inteligencia artificial sobre datos históricos.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(data.conclusions ?? []).map((conclusion, idx) => (
                            <div key={idx} className="p-4 rounded-lg bg-primary/5 border border-primary/10 hover:border-primary/30 transition-all flex gap-3">
                                <div className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                                    {idx + 1}
                                </div>
                                <p className="text-sm text-foreground/90">{conclusion}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="text-center py-10">
                <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">
                    Fin del Reporte • Generado bajo demanda por Bedrock Intelligence System
                </p>
            </div>
        </div>
    )
}
