"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Download, FileText, Share2, AlertTriangle,
    TrendingUp, TrendingDown, Gauge, Activity,
    Zap, Thermometer, Monitor, ShieldCheck,
    Calendar, Cpu, BarChart3, Info
} from "lucide-react"
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
            status?: string
            trend?: 'up' | 'down' | 'stable'
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

    // Función para obtener gradientes premium según el estado
    const getStatusGradient = (status?: string, kpiLabel?: string) => {
        const s = (status || '').toLowerCase()
        const label = (kpiLabel || '').toLowerCase()

        if (s.includes('crit') || s.includes('danger')) return "from-red-500/20 via-red-500/5 to-transparent border-red-500/30"
        if (s.includes('adv') || s.includes('warn')) return "from-amber-500/20 via-amber-500/5 to-transparent border-amber-500/30"

        // Colores por tipo de variable si es normal
        if (label.includes('volt')) return "from-blue-500/20 via-blue-500/5 to-transparent border-blue-500/30"
        if (label.includes('temp')) return "from-orange-500/20 via-orange-500/5 to-transparent border-orange-500/30"
        if (label.includes('pres')) return "from-emerald-500/20 via-emerald-500/5 to-transparent border-emerald-500/30"
        if (label.includes('corr')) return "from-purple-500/20 via-purple-500/5 to-transparent border-purple-500/30"

        return "from-primary/15 via-primary/5 to-transparent border-primary/20"
    }

    const getIcon = (label: string) => {
        const l = (label || '').toLowerCase()
        if (l.includes('volt')) return <Zap className="w-5 h-5 text-blue-400" />
        if (l.includes('temp')) return <Thermometer className="w-5 h-5 text-orange-400" />
        if (l.includes('pres')) return <Gauge className="w-5 h-5 text-emerald-400" />
        if (l.includes('corr') || l.includes('amp')) return <Activity className="w-5 h-5 text-purple-400" />
        if (l.includes('freq')) return <Cpu className="w-5 h-5 text-indigo-400" />
        return <Monitor className="w-5 h-5 text-primary/60" />
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-32 px-4 lg:px-8">
            {/* Super Header - Estilo "Hero" */}
            <div className="relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-12 shadow-2xl border border-white/5">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -mr-48 -mt-48 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -ml-32 -mb-32" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md">
                            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-foreground/80">Certificado por Industrial IA</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-[0.9] drop-shadow-sm">
                            {data.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-slate-400 font-bold text-sm">
                            <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                                <Calendar className="w-4 h-4 text-primary" />
                                {data.date || new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/5 font-mono">
                                <FileText className="w-4 h-4 text-blue-400" />
                                {reportId.slice(0, 15)}...
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-4 no-print">
                        <Button variant="outline" className="h-14 w-14 rounded-3xl border-white/10 bg-white/5 hover:bg-white/10 hover:scale-105 transition-all backdrop-blur-xl">
                            <Share2 className="w-5 h-5 text-white" />
                        </Button>
                        <Button className="h-14 px-8 rounded-3xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_40px_-10px_rgba(var(--primary),0.5)] hover:scale-105 transition-all font-black uppercase tracking-widest">
                            <Download className="w-5 h-5 mr-3" /> Exportar PDF
                        </Button>
                    </div>
                </div>
            </div>

            {/* KPI Grid - Glassmorphism Cards */}
            {Array.isArray(data.kpis) && data.kpis.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {data.kpis.map((kpi, idx) => (
                        <div key={idx} className={`relative overflow-hidden rounded-[2rem] border p-6 bg-card/40 backdrop-blur-2xl transition-all hover:scale-[1.02] hover:shadow-2xl hover:bg-card/60 group shadow-lg shadow-black/5 ${getStatusGradient(kpi.status, kpi.label)}`}>
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                        {getIcon(kpi.label)}
                                    </div>
                                </div>
                                {kpi.delta && (
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-tighter shadow-sm flex items-center gap-1.5 backdrop-blur-md border ${kpi.trend === 'up' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            kpi.trend === 'down' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>
                                        {kpi.trend === 'up' ? <TrendingUp className="w-3 h-3" /> :
                                            kpi.trend === 'down' ? <TrendingDown className="w-3 h-3" /> :
                                                <Activity className="w-3 h-3" />}
                                        {kpi.delta}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/60">
                                    {kpi.label || "Parámetro Técnico"}
                                </h4>

                                {kpi.comparisonValue ? (
                                    <div className="flex items-center justify-between gap-4 mt-2">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-bold text-muted-foreground/40 uppercase">Actual</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-black text-foreground tracking-tighter leading-none">{kpi.value}</span>
                                                <span className="text-xs font-bold text-muted-foreground/60">{kpi.unit}</span>
                                            </div>
                                        </div>
                                        <div className="h-10 w-[1px] bg-gradient-to-b from-transparent via-border to-transparent" />
                                        <div className="flex flex-col text-right">
                                            <span className="text-[9px] font-bold text-muted-foreground/40 uppercase">Anterior</span>
                                            <div className="flex items-baseline gap-1 justify-end">
                                                <span className="text-2xl font-black text-muted-foreground/30 tracking-tighter leading-none">{kpi.comparisonValue}</span>
                                                <span className="text-[10px] font-bold text-muted-foreground/20">{kpi.unit}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-foreground tracking-tighter">
                                            {kpi.value}
                                        </span>
                                        <span className="text-sm font-bold text-muted-foreground/60 uppercase tracking-widest">
                                            {kpi.unit}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Analysis Column */}
                <div className="lg:col-span-8 space-y-12">
                    {/* Resumen Operativo */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-2 rounded-full bg-primary" />
                            <h2 className="text-2xl font-black uppercase tracking-tight italic">I. Análisis Operativo Profundo</h2>
                        </div>
                        <div className="relative group overflow-hidden rounded-[2rem] bg-card/50 border border-border/40 p-8 md:p-12 shadow-inner hover:shadow-2xl transition-all duration-700">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <FileText className="w-32 h-32" />
                            </div>
                            <div className="relative z-10 prose prose-slate dark:prose-invert max-w-none">
                                <p className="text-lg md:text-xl font-medium leading-relaxed text-foreground/80 first-letter:text-5xl first-letter:font-black first-letter:text-primary first-letter:mr-3 first-letter:float-left whitespace-pre-wrap italic decoration-primary/20 underline-offset-8">
                                    {data.summary}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Dynamic Sections (Causalidad/Recomendaciones) */}
                    {Array.isArray(data.dynamicSections) && data.dynamicSections.map((section, idx) => (
                        <section key={idx} className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-2 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                                <h2 className="text-2xl font-black uppercase tracking-tight italic">{section.title}</h2>
                            </div>
                            <div className="rounded-[2.5rem] bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-white/5 p-8 md:p-10 text-lg leading-relaxed font-semibold text-foreground/70 whitespace-pre-wrap shadow-xl">
                                {section.content}
                            </div>
                        </section>
                    ))}
                </div>

                {/* Sidebar Column (Insights/Alerts) */}
                <div className="lg:col-span-4 space-y-10">
                    {/* Diagnóstico Técnico (Conclusiones) */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 text-primary">
                            <BarChart3 className="w-6 h-6" />
                            <h3 className="text-lg font-black uppercase tracking-widest">Hallazgos Clave</h3>
                        </div>
                        <div className="space-y-4">
                            {Array.isArray(data.conclusions) && data.conclusions.map((conclusion, idx) => (
                                <div key={idx} className="p-6 rounded-3xl bg-primary/5 border border-primary/10 hover:border-primary/30 transition-all hover:bg-primary/10 group cursor-default">
                                    <div className="flex gap-4">
                                        <div className="h-6 w-6 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-[10px] font-black group-hover:scale-110 transition-transform">
                                            {idx + 1}
                                        </div>
                                        <p className="text-sm font-bold text-foreground/80 leading-snug">{conclusion}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Alertas de Integridad */}
                    {Array.isArray(data.anomalies) && data.anomalies.length > 0 && (
                        <Card className="rounded-[2.5rem] border-red-500/20 bg-red-500/5 overflow-hidden backdrop-blur-md">
                            <CardHeader className="bg-red-500/10 border-b border-red-500/20 py-6 px-8">
                                <CardTitle className="flex items-center gap-3 text-red-500 text-sm font-black uppercase tracking-[0.2em]">
                                    <AlertTriangle className="w-5 h-5" />
                                    Alertas Críticas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                {data.anomalies.map((anomaly, idx) => (
                                    <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-red-500/10 space-y-2 hover:bg-white/10 transition-all">
                                        <span className="text-[9px] font-black uppercase bg-red-500/20 text-red-500 px-2 py-0.5 rounded-md">
                                            {anomaly.variable}
                                        </span>
                                        <p className="text-sm font-bold text-red-600/90">{anomaly.message}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Charts Section - Estética Next-Gen */}
            {Array.isArray(data.charts) && data.charts.length > 0 && (
                <section className="space-y-8 pt-16 border-t border-white/5">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4 text-primary">
                            <div className="p-3 rounded-[1.5rem] bg-primary/10 border border-primary/20">
                                <Activity className="w-6 h-6" />
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter italic">Telemetría Avanzada</h2>
                        </div>
                        <Badge className="bg-white/5 text-muted-foreground border-white/5 font-mono">Real-time Verified</Badge>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                        {data.charts.map((chart, idx) => (
                            <div key={idx} className="group relative overflow-hidden rounded-[3rem] bg-slate-900 border border-white/10 shadow-2xl transition-all hover:border-primary/40">
                                <div className="p-8 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-white/[0.02] to-transparent">
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/70">
                                        {chart.title || `Stream Analítico ${idx + 1}`}
                                    </h3>
                                    <Info className="w-4 h-4 text-white/20 group-hover:text-primary transition-colors" />
                                </div>
                                <div className="p-6 bg-slate-900">
                                    <div className="w-full h-[400px]">
                                        <Plot
                                            data={Array.isArray(chart.data) ? chart.data : []}
                                            layout={{
                                                ...chart.layout,
                                                autosize: true,
                                                paper_bgcolor: 'rgba(0,0,0,0)',
                                                plot_bgcolor: 'rgba(0,0,0,0)',
                                                font: { color: '#94a3b8', family: 'var(--font-sans)' },
                                                xaxis: {
                                                    gridcolor: 'rgba(255,255,255,0.03)',
                                                    zerolinecolor: 'rgba(255,255,255,0.05)',
                                                    tickfont: { size: 10, color: '#475569' }
                                                },
                                                yaxis: {
                                                    gridcolor: 'rgba(255,255,255,0.03)',
                                                    zerolinecolor: 'rgba(255,255,255,0.05)',
                                                    tickfont: { size: 10, color: '#475569' }
                                                },
                                                margin: { t: 30, b: 60, l: 60, r: 30 },
                                                showlegend: true,
                                                legend: {
                                                    orientation: 'h',
                                                    y: -0.2,
                                                    font: { size: 10, color: '#cbd5e1' },
                                                    bgcolor: 'rgba(0,0,0,0)'
                                                }
                                            }}
                                            config={{ displayModeBar: false, responsive: true }}
                                            useResizeHandler={true}
                                            className="w-full h-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}
