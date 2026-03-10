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
    Calendar, Cpu, BarChart3, Info, Target,
    ArrowUpRight, ArrowDownRight, Minus, Building2,
    FlaskConical, CheckCircle2, XCircle, Clock
} from "lucide-react"
import dynamic from "next/dynamic"

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

interface KPI {
    label: string
    value: string
    comparisonValue?: string
    delta?: string
    unit?: string
    status?: string
    trend?: 'up' | 'down' | 'stable'
}

interface WebReportViewerProps {
    reportId: string
    data: {
        reportType?: 'monthly' | 'comparative' | 'executive' | string
        title: string
        period?: string
        periodA?: string
        periodB?: string
        overallStatus?: 'normal' | 'warning' | 'critical' | string
        executiveSummary?: string
        date?: string
        summary: string
        kpis?: KPI[]
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
    useEffect(() => { setMounted(true) }, [])
    if (!mounted) return null

    const reportType = data.reportType || 'monthly'

    // ── Helpers ────────────────────────────────────────────────────────────────
    const getStatusGradient = (status?: string, kpiLabel?: string) => {
        const s = (status || '').toLowerCase()
        const label = (kpiLabel || '').toLowerCase()
        if (s.includes('crit') || s.includes('danger')) return "from-red-500/20 via-red-500/5 to-transparent border-red-500/30"
        if (s.includes('warn') || s.includes('adv')) return "from-amber-500/20 via-amber-500/5 to-transparent border-amber-500/30"
        if (label.includes('volt')) return "from-blue-500/20 via-blue-500/5 to-transparent border-blue-500/30"
        if (label.includes('temp')) return "from-orange-500/20 via-orange-500/5 to-transparent border-orange-500/30"
        if (label.includes('pres')) return "from-emerald-500/20 via-emerald-500/5 to-transparent border-emerald-500/30"
        if (label.includes('corr') || label.includes('amp')) return "from-purple-500/20 via-purple-500/5 to-transparent border-purple-500/30"
        if (label.includes('pot') || label.includes('power')) return "from-yellow-500/20 via-yellow-500/5 to-transparent border-yellow-500/30"
        return "from-primary/15 via-primary/5 to-transparent border-primary/20"
    }

    const getIcon = (label: string) => {
        const l = (label || '').toLowerCase()
        if (l.includes('volt')) return <Zap className="w-5 h-5 text-blue-400" />
        if (l.includes('temp')) return <Thermometer className="w-5 h-5 text-orange-400" />
        if (l.includes('pres')) return <Gauge className="w-5 h-5 text-emerald-400" />
        if (l.includes('corr') || l.includes('amp')) return <Activity className="w-5 h-5 text-purple-400" />
        if (l.includes('freq')) return <Cpu className="w-5 h-5 text-indigo-400" />
        if (l.includes('pot') || l.includes('power')) return <Zap className="w-5 h-5 text-yellow-400" />
        return <Monitor className="w-5 h-5 text-primary/60" />
    }

    const overallStatusConfig = {
        critical: { label: 'Estado Crítico', color: 'bg-red-500/20 text-red-400 border-red-500/30', dot: 'bg-red-500', icon: <XCircle className="w-4 h-4" /> },
        warning:  { label: 'Requiere Atención', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', dot: 'bg-amber-500', icon: <AlertTriangle className="w-4 h-4" /> },
        normal:   { label: 'Operación Normal', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-500', icon: <CheckCircle2 className="w-4 h-4" /> },
    }
    const statusKey = (data.overallStatus || 'normal').toLowerCase() as keyof typeof overallStatusConfig
    const statusCfg = overallStatusConfig[statusKey] ?? overallStatusConfig.normal

    const reportTypeMeta = {
        monthly:     { badge: 'Informe Mensual',    accent: 'bg-blue-500',    icon: <Calendar className="w-4 h-4" /> },
        comparative: { badge: 'Análisis Comparativo', accent: 'bg-violet-500', icon: <BarChart3 className="w-4 h-4" /> },
        executive:   { badge: 'Informe Ejecutivo',  accent: 'bg-amber-500',   icon: <Building2 className="w-4 h-4" /> },
    }
    const typeMeta = reportTypeMeta[reportType as keyof typeof reportTypeMeta] ?? reportTypeMeta.monthly

    const plotLayout = (extra?: any) => ({
        autosize: true,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#94a3b8', family: 'var(--font-sans)' },
        xaxis: { gridcolor: 'rgba(255,255,255,0.04)', zerolinecolor: 'rgba(255,255,255,0.05)', tickfont: { size: 10, color: '#475569' } },
        yaxis: { gridcolor: 'rgba(255,255,255,0.04)', zerolinecolor: 'rgba(255,255,255,0.05)', tickfont: { size: 10, color: '#475569' } },
        margin: { t: 30, b: 60, l: 60, r: 20 },
        showlegend: true,
        legend: { orientation: 'h', y: -0.25, font: { size: 10, color: '#cbd5e1' }, bgcolor: 'rgba(0,0,0,0)' },
        ...extra,
    })

    // ── Shared sub-components ──────────────────────────────────────────────────
    const SectionHeader = ({ number, title, color = 'bg-primary' }: { number?: string; title: string; color?: string }) => (
        <div className="flex items-center gap-4">
            <div className={`h-10 w-1.5 rounded-full ${color}`} />
            {number && <span className="text-xs font-black text-muted-foreground/40 uppercase tracking-widest">{number}</span>}
            <h2 className="text-xl font-black uppercase tracking-tight">{title}</h2>
        </div>
    )

    const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
        <div className={`rounded-3xl bg-card/50 border border-border/40 p-7 shadow-sm ${className}`}>
            {children}
        </div>
    )

    const ConclusionsList = () => (
        <div className="space-y-3">
            {(data.conclusions || []).map((c, i) => (
                <div key={i} className="flex gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10 hover:border-primary/25 transition-all group">
                    <div className="mt-0.5 h-5 w-5 shrink-0 rounded-md bg-primary/15 text-primary flex items-center justify-center text-[10px] font-black group-hover:scale-110 transition-transform">{i + 1}</div>
                    <p className="text-sm font-semibold text-foreground/80 leading-snug">{c}</p>
                </div>
            ))}
        </div>
    )

    const AnomaliesSidebar = () => !data.anomalies?.length ? null : (
        <Card className="rounded-3xl border-red-500/20 bg-red-500/5 overflow-hidden">
            <CardHeader className="bg-red-500/10 border-b border-red-500/20 py-5 px-6">
                <CardTitle className="flex items-center gap-2 text-red-400 text-xs font-black uppercase tracking-widest">
                    <AlertTriangle className="w-4 h-4" /> Alertas Activas
                </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
                {data.anomalies!.map((a, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/5 border border-red-500/10 space-y-1">
                        <span className="text-[9px] font-black uppercase bg-red-500/20 text-red-400 px-2 py-0.5 rounded">{a.variable}</span>
                        <p className="text-xs font-semibold text-red-400/90">{a.message}</p>
                    </div>
                ))}
            </CardContent>
        </Card>
    )

    const ChartsSection = () => !data.charts?.length ? null : (
        <section className="space-y-6 pt-12 border-t border-white/5">
            <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20"><Activity className="w-5 h-5 text-primary" /></div>
                <h2 className="text-xl font-black uppercase tracking-tight">Gráficas de Telemetría</h2>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {data.charts!.map((chart, idx) => (
                    <div key={idx} className="rounded-3xl bg-slate-900 border border-white/10 overflow-hidden hover:border-primary/30 transition-all">
                        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-xs font-black uppercase tracking-widest text-white/60">{chart.title || `Análisis ${idx + 1}`}</h3>
                            <Info className="w-4 h-4 text-white/20" />
                        </div>
                        <div className="p-4 h-90">
                            <Plot data={Array.isArray(chart.data) ? chart.data : []} layout={plotLayout(chart.layout)} config={{ displayModeBar: false, responsive: true }} useResizeHandler className="w-full h-full" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )

    // ── SHARED HEADER ──────────────────────────────────────────────────────────
    const ReportHeader = () => (
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-10 shadow-2xl border border-white/5">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/15 rounded-full blur-[100px] -mr-40 -mt-40" />
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-blue-500/10 rounded-full blur-[80px] -ml-28 -mb-28" />
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-3 flex-1 min-w-0">
                    {/* Badges row */}
                    <div className="flex flex-wrap gap-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.15em] text-primary/80">
                            {typeMeta.icon} {typeMeta.badge}
                        </div>
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.15em] ${statusCfg.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} animate-pulse`} />
                            {statusCfg.label}
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white leading-tight">{data.title}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-slate-400 text-xs font-bold">
                        {data.period && (
                            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                                <Clock className="w-3.5 h-3.5 text-primary" />{data.period}
                            </span>
                        )}
                        <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 font-mono">
                            <FileText className="w-3.5 h-3.5 text-blue-400" />{reportId.slice(0, 12)}…
                        </span>
                    </div>
                </div>
                <div className="flex gap-3 shrink-0 no-print">
                    <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 transition-all">
                        <Share2 className="w-4 h-4 text-white" />
                    </Button>
                    <Button className="h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 font-black uppercase tracking-wider text-sm">
                        <Download className="w-4 h-4 mr-2" /> Exportar PDF
                    </Button>
                </div>
            </div>
        </div>
    )

    // ══════════════════════════════════════════════════════════════════════════
    // LAYOUT A — MONTHLY
    // ══════════════════════════════════════════════════════════════════════════
    if (reportType === 'monthly') {
        return (
            <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 px-4 lg:px-8">
                <ReportHeader />

                {/* KPI grid 4 columns */}
                {!!data.kpis?.length && (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        {data.kpis.map((kpi, i) => (
                            <div key={i} className={`relative overflow-hidden rounded-2xl border p-5 bg-card/40 backdrop-blur-xl hover:scale-[1.02] transition-all group shadow-sm ${getStatusGradient(kpi.status, kpi.label)}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform">{getIcon(kpi.label)}</div>
                                    {kpi.status && kpi.status !== 'normal' && (
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${kpi.status === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>{kpi.status}</span>
                                    )}
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground/50 mb-1">{kpi.label}</p>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-3xl font-black tracking-tighter">{kpi.value}</span>
                                    <span className="text-xs font-bold text-muted-foreground/50 uppercase">{kpi.unit}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Main + Sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-8">
                        <section className="space-y-4">
                            <SectionHeader number="I" title="Análisis del Período" />
                            <SectionCard>
                                <p className="text-base leading-relaxed text-foreground/75 whitespace-pre-wrap first-letter:text-4xl first-letter:font-black first-letter:text-primary first-letter:mr-2 first-letter:float-left">{data.summary}</p>
                            </SectionCard>
                        </section>
                        {data.dynamicSections?.map((s, i) => (
                            <section key={i} className="space-y-4">
                                <SectionHeader number={`${['II','III','IV','V'][i] ?? i+2}`} title={s.title} color="bg-blue-500" />
                                <SectionCard>
                                    <p className="text-sm leading-relaxed text-foreground/70 whitespace-pre-wrap font-medium">{s.content}</p>
                                </SectionCard>
                            </section>
                        ))}
                    </div>
                    <div className="lg:col-span-4 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-primary">
                                <Target className="w-5 h-5" />
                                <h3 className="text-sm font-black uppercase tracking-widest">Hallazgos del Mes</h3>
                            </div>
                            <ConclusionsList />
                        </div>
                        <AnomaliesSidebar />
                    </div>
                </div>
                <ChartsSection />
            </div>
        )
    }

    // ══════════════════════════════════════════════════════════════════════════
    // LAYOUT B — COMPARATIVE
    // ══════════════════════════════════════════════════════════════════════════
    if (reportType === 'comparative') {
        const labelA = data.periodA || 'Período A'
        const labelB = data.periodB || 'Período B'
        return (
            <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 px-4 lg:px-8">
                <ReportHeader />

                {/* Period legend bar */}
                <div className="flex items-center gap-6 px-6 py-4 rounded-2xl bg-card/50 border border-border/40">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span className="text-sm font-black text-foreground/80">{labelA}</span>
                        <span className="text-xs text-muted-foreground font-medium">(valor actual)</span>
                    </div>
                    <div className="h-4 w-px bg-border" />
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-slate-500" />
                        <span className="text-sm font-black text-muted-foreground">{labelB}</span>
                        <span className="text-xs text-muted-foreground/60 font-medium">(base de comparación)</span>
                    </div>
                </div>

                {/* Comparative KPI grid */}
                {!!data.kpis?.length && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {data.kpis.map((kpi, i) => (
                            <div key={i} className={`relative overflow-hidden rounded-2xl border p-5 bg-card/40 backdrop-blur-xl hover:shadow-lg transition-all group ${getStatusGradient(kpi.status, kpi.label)}`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-xl bg-white/5 border border-white/5">{getIcon(kpi.label)}</div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground/50">{kpi.label}</p>
                                    </div>
                                    {kpi.delta && (
                                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${
                                            kpi.trend === 'up'   ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            kpi.trend === 'down' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                                   'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>
                                            {kpi.trend === 'up'   ? <ArrowUpRight className="w-3 h-3" /> :
                                             kpi.trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> :
                                                                    <Minus className="w-3 h-3" />}
                                            {kpi.delta}
                                        </div>
                                    )}
                                </div>
                                {kpi.comparisonValue ? (
                                    <div className="flex items-end justify-between gap-2">
                                        <div>
                                            <p className="text-[9px] font-bold text-primary/60 uppercase mb-0.5">{labelA}</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-black tracking-tighter">{kpi.value}</span>
                                                <span className="text-xs font-bold text-muted-foreground/50">{kpi.unit}</span>
                                            </div>
                                        </div>
                                        <div className="text-right opacity-40">
                                            <p className="text-[9px] font-bold uppercase mb-0.5">{labelB}</p>
                                            <div className="flex items-baseline gap-1 justify-end">
                                                <span className="text-2xl font-black tracking-tighter">{kpi.comparisonValue}</span>
                                                <span className="text-[10px] font-bold">{kpi.unit}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-3xl font-black tracking-tighter">{kpi.value}</span>
                                        <span className="text-xs font-bold text-muted-foreground/50">{kpi.unit}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Main content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-8">
                        <section className="space-y-4">
                            <SectionHeader number="I" title="Análisis Comparativo" />
                            <SectionCard>
                                <p className="text-base leading-relaxed text-foreground/75 whitespace-pre-wrap">{data.summary}</p>
                            </SectionCard>
                        </section>
                        {data.dynamicSections?.map((s, i) => (
                            <section key={i} className="space-y-4">
                                <SectionHeader number={`${['II','III','IV'][i] ?? i+2}`} title={s.title} color={i === 0 ? 'bg-violet-500' : 'bg-blue-500'} />
                                <SectionCard>
                                    <p className="text-sm leading-relaxed text-foreground/70 whitespace-pre-wrap font-medium">{s.content}</p>
                                </SectionCard>
                            </section>
                        ))}
                    </div>
                    <div className="lg:col-span-4 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-violet-400">
                                <FlaskConical className="w-5 h-5" />
                                <h3 className="text-sm font-black uppercase tracking-widest">Conclusiones</h3>
                            </div>
                            <ConclusionsList />
                        </div>
                        <AnomaliesSidebar />
                    </div>
                </div>
                <ChartsSection />
            </div>
        )
    }

    // ══════════════════════════════════════════════════════════════════════════
    // LAYOUT C — EXECUTIVE
    // ══════════════════════════════════════════════════════════════════════════
    if (reportType === 'executive') {
        return (
            <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 px-4 lg:px-8">
                <ReportHeader />

                {/* Executive summary banner */}
                {data.executiveSummary && (
                    <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 p-7">
                        <div className="absolute top-3 right-4 opacity-5"><Building2 className="w-20 h-20" /></div>
                        <div className="flex items-start gap-4">
                            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/20 shrink-0">
                                <Building2 className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-amber-400/70 mb-2">Resumen para Gerencia</p>
                                <p className="text-base font-semibold text-foreground/85 leading-relaxed">{data.executiveSummary}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* KPI grid — 3 columns, larger cards for executive view */}
                {!!data.kpis?.length && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {data.kpis.map((kpi, i) => (
                            <div key={i} className={`relative overflow-hidden rounded-2xl border p-6 bg-card/40 backdrop-blur-xl hover:scale-[1.01] transition-all group shadow-sm ${getStatusGradient(kpi.status, kpi.label)}`}>
                                <div className="flex justify-between items-start mb-5">
                                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform">{getIcon(kpi.label)}</div>
                                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                                        kpi.status === 'critical' ? 'bg-red-500/15 text-red-400 border-red-500/20' :
                                        kpi.status === 'warning'  ? 'bg-amber-500/15 text-amber-400 border-amber-500/20' :
                                                                    'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                                    }`}>
                                        {kpi.status === 'critical' ? '⚠ Crítico' : kpi.status === 'warning' ? '△ Alerta' : '✓ Normal'}
                                    </div>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground/50 mb-1">{kpi.label}</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black tracking-tighter">{kpi.value}</span>
                                    <span className="text-sm font-bold text-muted-foreground/50 uppercase">{kpi.unit}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Main content + sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-8">
                        <section className="space-y-4">
                            <SectionHeader number="I" title="Análisis Ejecutivo" color="bg-amber-500" />
                            <SectionCard>
                                <p className="text-base leading-relaxed text-foreground/75 whitespace-pre-wrap first-letter:text-4xl first-letter:font-black first-letter:text-amber-500 first-letter:mr-2 first-letter:float-left">{data.summary}</p>
                            </SectionCard>
                        </section>
                        {data.dynamicSections?.map((s, i) => {
                            const colors = ['bg-amber-500', 'bg-red-500', 'bg-emerald-500', 'bg-blue-500']
                            return (
                                <section key={i} className="space-y-4">
                                    <SectionHeader number={`${['II','III','IV','V'][i] ?? i+2}`} title={s.title} color={colors[i] ?? 'bg-primary'} />
                                    <SectionCard>
                                        <p className="text-sm leading-relaxed text-foreground/70 whitespace-pre-wrap font-medium">{s.content}</p>
                                    </SectionCard>
                                </section>
                            )
                        })}
                    </div>
                    <div className="lg:col-span-4 space-y-6">
                        {/* Overall status card */}
                        <div className={`p-5 rounded-3xl border ${statusCfg.color} space-y-3`}>
                            <div className="flex items-center gap-2">
                                {statusCfg.icon}
                                <span className="text-sm font-black uppercase tracking-wider">Estado General</span>
                            </div>
                            <p className="text-xs font-semibold opacity-80">El equipo se encuentra en estado <strong>{statusCfg.label}</strong> durante el período analizado.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-amber-400">
                                <ShieldCheck className="w-5 h-5" />
                                <h3 className="text-sm font-black uppercase tracking-widest">Puntos Clave</h3>
                            </div>
                            <ConclusionsList />
                        </div>
                        <AnomaliesSidebar />
                    </div>
                </div>
                <ChartsSection />
            </div>
        )
    }

    // ══════════════════════════════════════════════════════════════════════════
    // FALLBACK — uses monthly layout for unknown types
    // ══════════════════════════════════════════════════════════════════════════
    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 px-4 lg:px-8">
            <ReportHeader />
            {!!data.kpis?.length && (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {data.kpis.map((kpi, i) => (
                        <div key={i} className={`overflow-hidden rounded-2xl border p-5 bg-card/40 backdrop-blur-xl hover:scale-[1.02] transition-all group ${getStatusGradient(kpi.status, kpi.label)}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">{getIcon(kpi.label)}</div>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground/50 mb-1">{kpi.label}</p>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-3xl font-black tracking-tighter">{kpi.value}</span>
                                <span className="text-xs font-bold text-muted-foreground/50">{kpi.unit}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    <SectionCard><p className="text-base leading-relaxed text-foreground/75 whitespace-pre-wrap">{data.summary}</p></SectionCard>
                    {data.dynamicSections?.map((s, i) => (
                        <section key={i} className="space-y-4">
                            <SectionHeader title={s.title} color="bg-blue-500" />
                            <SectionCard><p className="text-sm leading-relaxed text-foreground/70 whitespace-pre-wrap font-medium">{s.content}</p></SectionCard>
                        </section>
                    ))}
                </div>
                <div className="lg:col-span-4 space-y-6">
                    <ConclusionsList />
                    <AnomaliesSidebar />
                </div>
            </div>
            <ChartsSection />
        </div>
    )
}
