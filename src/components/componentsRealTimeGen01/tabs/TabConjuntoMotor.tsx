"use client";

import { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { TagValue } from "@/context/IoTTagsContext";
import { getThresholdStatus } from "@/config/thresholds-v2";
import HalfGauge from "../shared/HalfGauge";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface Props {
    engine: Record<string, TagValue>;
    gvl: Record<string, TagValue>;
}

const n = (v?: TagValue) => (v ? parseFloat(v.value) : null);

const ALL_CYLS = Array.from({ length: 20 }, (_, i) => i + 1);
const KNOCK_NUMS = Array.from({ length: 20 }, (_, i) => i + 1);

const HISTORY_MS = 5 * 60_000;
const KNOCK_COLORS = [
    "#f87171","#fb923c","#fbbf24","#a3e635","#34d399",
    "#22d3ee","#60a5fa","#a78bfa","#f472b6","#e879f9",
    "#ef4444","#f97316","#eab308","#84cc16","#10b981",
    "#06b6d4","#3b82f6","#8b5cf6","#ec4899","#d946ef",
];

function cylCardColors(val: number | null, num: number) {
    if (val === null) return "border-border bg-card text-muted-foreground";
    const status = getThresholdStatus(`Tem_Cyl_${num}`, val);
    if (status === "critical") return "border-red-500/60 bg-red-500/10 text-red-400";
    if (status === "warning") return "border-yellow-500/60 bg-yellow-500/10 text-yellow-400";
    return "border-[#60a5fa]/30 bg-[#60a5fa]/5 text-[#60a5fa]";
}

function CylCard({ num, value }: { num: number; value: number | null }) {
    return (
        <div className={`rounded-lg border p-2.5 flex flex-col items-center gap-1 ${cylCardColors(value, num)}`}>
            <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                C{num}
            </span>
            <span className="text-lg font-bold tabular-nums leading-none">
                {value !== null ? value.toFixed(0) : "--"}
            </span>
        </div>
    );
}

function SectionRow({
    label,
    value,
    unit,
    tagName,
}: {
    label: string;
    value: string;
    unit: string;
    tagName?: string;
}) {
    const numVal = parseFloat(value);
    const status = tagName && !isNaN(numVal) ? getThresholdStatus(tagName, numVal) : "normal";
    const colorMap: Record<string, string> = {
        critical: "text-red-500",
        warning: "text-yellow-400",
        info: "text-blue-400",
        normal: "text-[#60a5fa]",
    };
    return (
        <div className="flex items-center justify-between py-1 border-b border-border/40 last:border-0">
            <span className="text-xs text-muted-foreground truncate mr-2">{label}</span>
            <span className={`text-xs font-semibold tabular-nums whitespace-nowrap ${colorMap[status] ?? "text-foreground"}`}>
                {value} <span className="text-muted-foreground font-normal">{unit}</span>
            </span>
        </div>
    );
}

function BarActuator({
    label,
    value,
    max = 100,
    unit = "%",
}: {
    label: string;
    value: number | null;
    max?: number;
    unit?: string;
}) {
    const pct = value !== null ? Math.min(100, (value / max) * 100) : 0;
    const barColor = pct > 90 ? "bg-red-500" : pct > 70 ? "bg-yellow-400" : "bg-[#60a5fa]";
    return (
        <div className="flex flex-col gap-0.5">
            <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest truncate">{label}</span>
                <span className="text-xs font-semibold tabular-nums text-foreground ml-1 whitespace-nowrap">
                    {value !== null ? value.toFixed(1) : "--"}{" "}
                    <span className="text-muted-foreground font-normal">{unit}</span>
                </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted/30">
                <div className={`h-1.5 rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

function KnockTrendsChart({ gvl }: { gvl: Record<string, TagValue> }) {
    const histMap = useRef<Map<number, { t: number; v: number }[]>>(new Map());
    const [, setRev] = useState(0);
    const [hidden, setHidden] = useState<Set<number>>(new Set());

    const toggleKnock = (i: number) =>
        setHidden(prev => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; });

    useEffect(() => {
        const t = Date.now();
        const cutoff = t - HISTORY_MS;
        KNOCK_NUMS.forEach((num, i) => {
            const v = n(gvl[`rVib_Cil_${num}`]);
            if (v === null) return;
            const prev = histMap.current.get(i) ?? [];
            histMap.current.set(i, [...prev.filter(p => p.t >= cutoff), { t, v }]);
        });
        setRev(r => r + 1);
    }, [gvl]);

    const traces = KNOCK_NUMS.map((num, i) => {
        const pts = histMap.current.get(i) ?? [];
        const color = KNOCK_COLORS[i % KNOCK_COLORS.length];
        return {
            x: pts.map(p => p.t),
            y: pts.map(p => p.v),
            type: "scatter" as const,
            mode: "lines" as const,
            name: `C${String(num).padStart(2,"0")}`,
            showlegend: false,
            visible: (hidden.has(i) ? false : true) as boolean,
            line: { color, width: 1.5 },
            hovertemplate: `C${num}: <b>%{y:.2f}</b>  %{x|%H:%M:%S}<extra></extra>`,
        };
    });

    return (
        <div className="flex-1 min-h-0 flex flex-col gap-1">
            <div className="shrink-0 flex flex-wrap gap-0.5">
                {KNOCK_NUMS.map((num, i) => {
                    const color = KNOCK_COLORS[i % KNOCK_COLORS.length];
                    const off = hidden.has(i);
                    return (
                        <button
                            key={num}
                            onClick={() => toggleKnock(i)}
                            title={off ? `Mostrar C${num}` : `Ocultar C${num}`}
                            className="rounded px-1 py-0.5 text-[8px] font-bold leading-none transition-all"
                            style={{
                                background: off ? "transparent" : `${color}22`,
                                color:      off ? "#374151"     : color,
                                border:     `1px solid ${off ? "#374151" : `${color}55`}`,
                            }}
                        >C{num}</button>
                    );
                })}
            </div>
            <div className="flex-1 min-h-0">
                <Plot
                    data={traces}
                    layout={{
                        uirevision: "knock-chart-gen01",
                        autosize: true,
                        margin: { l: 36, r: 8, t: 28, b: 22 },
                        paper_bgcolor: "rgba(0,0,0,0)",
                        plot_bgcolor:  "rgba(0,0,0,0)",
                        showlegend: false,
                        xaxis: {
                            type: "date",
                            tickformat: "%H:%M:%S",
                            tickfont: { size: 7, color: "#6b7280" },
                            gridcolor: "rgba(255,255,255,0.05)",
                            linecolor: "rgba(96,165,250,0.15)",
                            rangeselector: {
                                buttons: [
                                    { count: 30, label: "30s", step: "second", stepmode: "backward" },
                                    { count: 1,  label: "1m",  step: "minute", stepmode: "backward" },
                                    { count: 3,  label: "3m",  step: "minute", stepmode: "backward" },
                                    { step: "all", label: "Todo" },
                                ],
                                font: { size: 8, color: "#9ca3af" },
                                bgcolor: "rgba(255,255,255,0.04)",
                                activecolor: "rgba(96,165,250,0.18)",
                                bordercolor: "rgba(96,165,250,0.2)",
                                borderwidth: 1,
                                x: 0, y: 1.1,
                            },
                            rangeslider: {
                                visible: true,
                                bgcolor: "rgba(0,0,0,0.15)",
                                bordercolor: "rgba(96,165,250,0.15)",
                                borderwidth: 1,
                                thickness: 0.06,
                            },
                        },
                        yaxis: {
                            tickfont: { size: 7, color: "#6b7280" },
                            gridcolor: "rgba(255,255,255,0.05)",
                            rangemode: "tozero",
                            fixedrange: false,
                            title: { text: "Vibración", font: { size: 7, color: "#6b7280" }, standoff: 2 },
                        },
                    }}
                    config={{ displayModeBar: false, responsive: true, scrollZoom: true }}
                    style={{ width: "100%", height: "100%" }}
                    useResizeHandler
                />
            </div>
        </div>
    );
}

export default function TabConjuntoMotor({ engine, gvl }: Props) {
    const promedio = n(engine["Promedio_tem_cyl"]);

    return (
        <div className="h-full flex flex-col gap-2 p-3 overflow-hidden">

            <div className="flex gap-2 items-stretch shrink-0">
                <div className="w-24 shrink-0">
                    <HalfGauge
                        label="Prom. Cil."
                        value={promedio}
                        unit="°C"
                        min={400}
                        max={650}
                        warning={580}
                        danger={610}
                        size="sm"
                    />
                </div>
                <div className="flex gap-1 items-center shrink-0">
                    {(["U", "V", "W"] as const).map((d) => {
                        const val = n(engine[`Devanado_${d}`]);
                        const status = val !== null ? getThresholdStatus(`Devanado_${d}`, val) : "normal";
                        const color =
                            status === "critical" ? "text-red-500"
                            : status === "warning" ? "text-yellow-400"
                            : val === null ? "text-foreground"
                            : "text-[#60a5fa]";
                        return (
                            <div key={d} className="rounded-lg border bg-card px-2 py-1.5 min-w-14">
                                <p className="text-[8px] uppercase tracking-widest text-muted-foreground">Dev. {d}</p>
                                <p className={`text-sm font-bold tabular-nums ${color}`}>
                                    {val !== null ? val.toFixed(0) : "--"}
                                    <span className="text-[10px] font-normal text-muted-foreground ml-0.5">°C</span>
                                </p>
                            </div>
                        );
                    })}
                </div>
                <div className="flex-1 rounded-lg border bg-card px-3 py-1.5 flex items-center gap-4">
                    <h3 className="text-[9px] font-bold uppercase tracking-widest text-[#60a5fa] shrink-0">Actuadores</h3>
                    <div className="flex-1 grid grid-cols-4 gap-x-4">
                        <BarActuator label="Throttle" value={n(engine["pos_throttle"])} max={100} unit="%" />
                        <BarActuator label="Bypass"   value={n(engine["pos_bypass"])} max={100} unit="%" />
                        <BarActuator label="3 Vías"   value={n(engine["feedback_3_vias"])} max={100} unit="%" />
                        <BarActuator label="Mixer"    value={n(engine["MandoMixer"])} max={100} unit="%" />
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 flex gap-2">

                <div className="w-72 shrink-0 flex flex-col gap-2 min-h-0">

                    <div className="shrink-0">
                        <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Temperatura Cilindros <span className="normal-case font-normal">(°C)</span></p>
                        <div className="grid grid-cols-5 gap-1">
                            {ALL_CYLS.map((num) => (
                                <CylCard key={num} num={num} value={n(engine[`Tem_Cyl_${num}`])} />
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 min-h-0 grid grid-cols-2 grid-rows-2 gap-1.5">
                        <div className="rounded-lg border bg-card p-2">
                            <h3 className="text-[9px] font-bold uppercase tracking-widest text-[#60a5fa] mb-1">Refrigeración</h3>
                            <SectionRow label="HT Entrada" value={n(engine["T_HT_ENTREDA"])?.toFixed(1) ?? "--"}         unit="°C"  tagName="T_HT_ENTREDA" />
                            <SectionRow label="HT Salida"  value={n(engine["Tem_HT_ref_salida"])?.toFixed(1) ?? "--"}    unit="°C"  tagName="Tem_HT_ref_salida" />
                            <SectionRow label="LT Salida"  value={n(engine["Temp_LT_salida"])?.toFixed(1) ?? "--"}       unit="°C"  tagName="Temp_LT_salida" />
                        </div>
                        <div className="rounded-lg border bg-card p-2">
                            <h3 className="text-[9px] font-bold uppercase tracking-widest text-[#60a5fa] mb-1">Aceite</h3>
                            <SectionRow label="Temp."  value={n(engine["Temperatura_aceite"])?.toFixed(1) ?? "--"}  unit="°C"  tagName="Temperatura_aceite" />
                            <SectionRow label="Presión" value={n(engine["Presion_aceite"])?.toFixed(2) ?? "--"}    unit="bar" tagName="Presion_aceite" />
                        </div>
                        <div className="rounded-lg border bg-card p-2">
                            <h3 className="text-[9px] font-bold uppercase tracking-widest text-[#60a5fa] mb-1">Gas</h3>
                            <SectionRow label="Entrada" value={n(engine["Pres_Gas_Entrada_Motor"])?.toFixed(2) ?? "--"} unit="bar"  tagName="Pres_Gas_Entrada_Motor" />
                            <SectionRow label="MAP"     value={n(engine["MAP"])?.toFixed(1) ?? "--"}                   unit="mbar" tagName="MAP" />
                        </div>
                        <div className="rounded-lg border bg-card p-2">
                            <h3 className="text-[9px] font-bold uppercase tracking-widest text-[#60a5fa] mb-1">Filtro / Aire</h3>
                            <SectionRow label="Filtro" value={n(engine["Tempe_filtro"])?.toFixed(1) ?? "--"} unit="°C" tagName="Tempe_filtro" />
                        </div>
                    </div>
                </div>

                <div className="flex-1 min-h-0 min-w-0 rounded-lg border bg-card p-2.5 flex flex-col">
                    <h3 className="text-[9px] font-bold uppercase tracking-widest text-[#60a5fa] mb-1.5 shrink-0">
                        Vibraciones Cilindros — 20 Sensores
                    </h3>
                    <KnockTrendsChart gvl={gvl} />
                </div>
            </div>
        </div>
    );
}
