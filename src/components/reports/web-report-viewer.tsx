"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Download, FileText, Share2, Printer, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, Gauge, Activity, Cpu, Zap, Thermometer, Droplets, Monitor, ShieldCheck } from "lucide-react"
import dynamic from "next/dynamic"

// Importar Plotly dinámicamente para evitar problemas de SSR
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

interface WebReportViewerProps {
    reportId: string
    data: {
        title: string
        date?: string
        summary: string
        kpis?: Array<{
            label: string
            value: string
            comparisonValue?: string
            delta?: string
            unit?: string
            trend?: 'up' | 'down' | 'stable'
            color?: string
        }>
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
        dynamicSections?: Array<{
            title: string
            content: string
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
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20 px-4 md:px-0">
            {/* Header del Reporte - Más discreto y elegante */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-primary/10 pb-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-primary rounded-full transition-all duration-500 group-hover:h-10" />
                        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground/90 leading-none">
                            {data.title}
                        </h2>
                    </div>
                    <p className="text-muted-foreground font-medium flex items-center gap-2 ml-5">
                        <FileText className="w-4 h-4 opacity-50" />
                        ID: {reportId} {data.date && <span className="text-primary/40 ml-2">| {data.date}</span>}
                    </p>
                </div>
                <div className="flex gap-3 no-print">
                    <Button variant="outline" size="sm" className="rounded-full px-4 border-primary/20 hover:bg-primary/5 transition-all text-xs font-semibold tracking-wide uppercase">
                        <Share2 className="w-3.5 h-3.5 mr-2" />
                    </Button>
                    <Button size="sm" className="rounded-full px-5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all text-xs font-semibold tracking-wide uppercase">
                        <Download className="w-3.5 h-3.5 mr-2" /> Exportar
                    </Button>
                </div>
            </div>

            {/* KPI Grid - Resumen de Alto Nivel */}
            {Array.isArray(data.kpis) && data.kpis.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {data.kpis.map((kpi, idx) => (
                        <Card key={idx} className={`border-border bg-card shadow-none transition-all hover:border-primary/50 ${kpi.comparisonValue ? 'col-span-1 md:col-span-2' : ''}`}>
                            <CardContent className="p-4 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-md bg-primary/5 text-primary">
                                            {kpi.label.toLowerCase().includes('volt') ? <Zap className="w-3.5 h-3.5" /> :
                                                kpi.label.toLowerCase().includes('temp') ? <Thermometer className="w-3.5 h-3.5" /> :
                                                    kpi.label.toLowerCase().includes('pres') ? <Gauge className="w-3.5 h-3.5" /> :
                                                        kpi.label.toLowerCase().includes('eficiencia') ? <Activity className="w-3.5 h-3.5" /> :
                                                            <Monitor className="w-3.5 h-3.5" />}
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground line-clamp-1">
                                            {kpi.label}
                                        </p>
                                    </div>
                                    {kpi.delta && (
                                        <Badge variant="outline" className={`text-[10px] h-5 rounded-sm border-none bg-opacity-10 ${kpi.trend === 'up' ? 'text-emerald-500 bg-emerald-500' :
                                            kpi.trend === 'down' ? 'text-red-500 bg-red-500' : 'text-blue-500 bg-blue-500'}`}>
                                            {kpi.delta}
                                        </Badge>
                                    )}
                                </div>

                                {kpi.comparisonValue ? (
                                    <div className="flex items-center justify-between gap-4 mt-auto">
                                        <div className="space-y-0.5">
                                            <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-50">Actual</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-xl font-mono font-black text-foreground">{kpi.value}</span>
                                                <span className="text-[10px] opacity-70 font-bold uppercase">{kpi.unit}</span>
                                            </div>
                                        </div>
                                        <div className="h-8 w-px bg-border/50" />
                                        <div className="space-y-0.5 text-right">
                                            <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-50">Anterior</p>
                                            <div className="flex items-baseline gap-1 justify-end">
                                                <span className="text-xl font-mono font-black text-muted-foreground/60">{kpi.comparisonValue}</span>
                                                <span className="text-[10px] opacity-40 font-bold uppercase">{kpi.unit}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-auto flex items-baseline gap-1">
                                        <span className="text-2xl font-mono font-black text-foreground line-clamp-1">
                                            {kpi.value}
                                        </span>
                                        {kpi.unit && <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">{kpi.unit}</span>}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Análisis y Diagnóstico */}
            <div className="space-y-12">
                {/* Resumen Ejecutivo Ampliado */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-foreground border-l-4 border-primary pl-4">
                        <h3 className="text-lg font-black uppercase tracking-tighter italic">I. Resumen Operativo</h3>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm leading-relaxed text-foreground/90 text-sm md:text-base font-medium whitespace-pre-wrap border-l-primary/20 border-l-8">
                        {data.summary || "No se proporcionó un análisis operativo detallado."}
                    </div>
                </section>

                {/* Hallazgos y Conclusiones Técnicas */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-foreground border-l-4 border-primary pl-4">
                        <h3 className="text-lg font-black uppercase tracking-tighter italic">II. Diagnóstico Técnico</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Array.isArray(data.conclusions) && data.conclusions.map((conclusion, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-5 rounded-xl bg-muted/20 border border-border/50 group hover:border-primary/30 transition-all hover:bg-card">
                                <div className="mt-1 flex-shrink-0 w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center font-mono text-xs font-bold">
                                    {String(idx + 1).padStart(2, '0')}
                                </div>
                                <p className="text-sm font-semibold text-foreground/80 leading-snug">{conclusion}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SECCIONES DINÁMICAS (Nuevo: Análisis IA Profundo) */}
                {Array.isArray(data.dynamicSections) && data.dynamicSections.map((section, idx) => (
                    <section key={idx} className="space-y-4">
                        <div className="flex items-center gap-2 text-foreground border-l-4 border-primary pl-4">
                            <h3 className="text-lg font-black uppercase tracking-tighter italic">{section.title}</h3>
                        </div>
                        <div className="bg-card/50 border border-border/40 rounded-xl p-6 md:p-8 text-sm md:text-base leading-relaxed font-medium text-foreground/80 whitespace-pre-wrap">
                            {section.content}
                        </div>
                    </section>
                ))}

                {/* Sección de Anomalías (Solo si existen) */}
                {Array.isArray(data.anomalies) && data.anomalies.length > 0 && (
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-red-500 border-l-4 border-red-500 pl-4">
                            <h3 className="text-lg font-black uppercase tracking-tighter italic text-red-600">⚠ Alertas de Integridad</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.anomalies.map((anomaly, idx) => (
                                <div key={idx} className="flex gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-red-600 items-center hover:bg-red-500/10 transition-colors">
                                    <div className="p-2 rounded-lg bg-red-500/10">
                                        <AlertTriangle className="w-5 h-5 shrink-0" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 underline decoration-red-500/30">{anomaly.variable}</p>
                                        <p className="text-sm font-black">{anomaly.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Visualización de Datos de Alto IMPACTO - Condicional */}
            {Array.isArray(data.charts) && data.charts.length > 0 && (
                <section className="space-y-6 pt-10 border-t border-border/50">
                    <div className="flex items-center gap-3 text-primary">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold uppercase tracking-widest">Visualización Analítica</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {data.charts.map((chart, idx) => (
                            <Card key={idx} className="border-border bg-card/40 overflow-hidden rounded-3xl group shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                                <CardHeader className="bg-muted/30 py-4 px-6 border-b border-border/50">
                                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground/70 flex justify-between items-center text-primary">
                                        {chart.title || chart.layout?.title || `Parámetro Industrial ${idx + 1}`}
                                        <Zap className="w-3.5 h-3.5 opacity-20" />
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <div className="w-full h-[320px]">
                                        <Plot
                                            data={Array.isArray(chart.data) ? chart.data : []}
                                            layout={{
                                                ...chart.layout,
                                                autosize: true,
                                                paper_bgcolor: 'rgba(0,0,0,0)',
                                                plot_bgcolor: 'rgba(0,0,0,0)',
                                                font: { color: '#888', family: 'Inter, sans-serif' },
                                                xaxis: {
                                                    gridcolor: 'rgba(128,128,128,0.05)',
                                                    zerolinecolor: 'rgba(128,128,128,0.1)',
                                                    tickfont: { size: 10 }
                                                },
                                                yaxis: {
                                                    gridcolor: 'rgba(128,128,128,0.05)',
                                                    zerolinecolor: 'rgba(128,128,128,0.1)',
                                                    tickfont: { size: 10 }
                                                },
                                                margin: { t: 20, b: 40, l: 40, r: 20 },
                                                showlegend: true,
                                                legend: { orientation: 'h', y: -0.2, font: { size: 9 } }
                                            }}
                                            config={{ displayModeBar: false, responsive: true }}
                                            useResizeHandler={true}
                                            className="w-full h-full"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}
