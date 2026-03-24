"use client";

import { useRef, useEffect, useState } from "react";
import { TagValue } from "@/context/IoTTagsContext";
import { getThresholdStatus } from "@/config/thresholds-v2";
import HalfGauge from "../shared/HalfGauge";

interface Props {
    engine: Record<string, TagValue>;
    hmi: Record<string, TagValue>;
    alarmas: Record<string, TagValue>;
}

const n = (v?: TagValue) => (v ? parseFloat(v.value) : null);

// Cilindros disponibles en GEN55 Engine_1
const ALL_CYLS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
// Vibraciones disponibles en GVL_HMI_3 (sin cil 4, 9, 10)
const VIB_CYLS = [1, 2, 3, 5, 6, 7, 8, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

const HISTORY_MS = 5 * 60_000;
const VIB_COLORS = [
    "#f87171","#fb923c","#fbbf24","#a3e635","#34d399",
    "#22d3ee","#60a5fa","#a78bfa","#f472b6","#e879f9",
    "#ef4444","#f97316","#eab308","#84cc16","#10b981",
    "#06b6d4","#3b82f6",
];

function cylCardColors(val: number | null, num: number) {
    if (val === null) return "border-border bg-card text-muted-foreground";
    const status = getThresholdStatus(`Tem_Cyl_${num}`, val);
    if (status === "critical") return "border-red-500/60 bg-red-500/10 text-red-400";
    if (status === "warning") return "border-yellow-500/60 bg-yellow-500/10 text-yellow-400";
    return "border-[#00ffc2]/30 bg-[#00ffc2]/5 text-[#00ffc2]";
}

function CylCard({ num, value }: { num: number; value: number | null }) {
    return (
        <div className={`rounded-lg border p-1.5 flex flex-col items-center gap-0 ${cylCardColors(value, num)}`}>
            <span className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">
                C{num}
            </span>
            <span className="text-sm font-bold tabular-nums leading-tight">
                {value !== null ? value.toFixed(0) : "--"}
            </span>
            <span className="text-[8px] text-muted-foreground">°F</span>
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
        normal: "text-[#00ffc2]",
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
    const barColor = pct > 90 ? "bg-red-500" : pct > 70 ? "bg-yellow-400" : "bg-[#00ffc2]";
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

function VibTrendsChart({ hmi }: { hmi: Record<string, TagValue> }) {
    const divRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const PlotlyRef = useRef<any>(null);
    const initialized = useRef(false);
    const [hidden, setHidden] = useState<Set<number>>(new Set());

    // Initialize chart once
    useEffect(() => {
        if (!divRef.current) return;
        import("plotly.js-dist-min").then((mod) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const Plotly: any = (mod as any).default ?? mod;
            PlotlyRef.current = Plotly;
            const traces = VIB_CYLS.map((num, i) => ({
                x: [] as number[],
                y: [] as number[],
                type: "scatter",
                mode: "lines",
                name: `C${String(num).padStart(2, "0")}`,
                showlegend: false,
                line: { color: VIB_COLORS[i % VIB_COLORS.length], width: 1.5 },
                hovertemplate: `C${num}: <b>%{y:.2f} mm/s</b>  %{x|%H:%M:%S}<extra></extra>`,
            }));
            Plotly.newPlot(divRef.current!, traces, {
                uirevision: "vib-chart",
                autosize: true,
                margin: { l: 36, r: 8, t: 28, b: 22 },
                paper_bgcolor: "rgba(0,0,0,0)",
                plot_bgcolor:  "rgba(0,0,0,0)",
                showlegend: false,
                shapes: [
                    { type:"line", xref:"paper", x0:0, x1:1, y0:7.1,  y1:7.1,  line:{ color:"rgba(250,204,21,0.65)", width:1.5, dash:"dash" } },
                    { type:"line", xref:"paper", x0:0, x1:1, y0:11.2, y1:11.2, line:{ color:"rgba(239,68,68,0.65)",  width:1.5, dash:"dot"  } },
                ],
                annotations: [
                    { xref:"paper", x:1, yref:"y", y:7.1,  text:"warn", showarrow:false, font:{ size:7, color:"rgba(250,204,21,0.8)" }, xanchor:"right", yanchor:"bottom" },
                    { xref:"paper", x:1, yref:"y", y:11.2, text:"crit", showarrow:false, font:{ size:7, color:"rgba(239,68,68,0.8)"  }, xanchor:"right", yanchor:"bottom" },
                ],
                xaxis: {
                    type: "date",
                    tickformat: "%H:%M:%S",
                    tickfont: { size: 7, color: "#6b7280" },
                    gridcolor: "rgba(255,255,255,0.05)",
                    linecolor: "rgba(0,255,194,0.15)",
                    rangeselector: {
                        buttons: [
                            { count: 30, label: "30s", step: "second", stepmode: "backward" },
                            { count: 1,  label: "1m",  step: "minute", stepmode: "backward" },
                            { count: 3,  label: "3m",  step: "minute", stepmode: "backward" },
                            { step: "all", label: "Todo" },
                        ],
                        font: { size: 8, color: "#9ca3af" },
                        bgcolor: "rgba(255,255,255,0.04)",
                        activecolor: "rgba(0,255,194,0.18)",
                        bordercolor: "rgba(0,255,194,0.2)",
                        borderwidth: 1,
                        x: 0, y: 1.1,
                    },
                    rangeslider: { visible: true, bgcolor: "rgba(0,0,0,0.15)", bordercolor: "rgba(0,255,194,0.15)", borderwidth: 1, thickness: 0.06 },
                },
                yaxis: {
                    tickfont: { size: 7, color: "#6b7280" },
                    gridcolor: "rgba(255,255,255,0.05)",
                    rangemode: "tozero",
                    fixedrange: false,
                    title: { text: "mm/s", font: { size: 7, color: "#6b7280" }, standoff: 2 },
                },
            }, { displayModeBar: false, responsive: true, scrollZoom: true });
            initialized.current = true;
        });
        return () => {
            if (divRef.current && PlotlyRef.current) {
                PlotlyRef.current.purge(divRef.current);
                initialized.current = false;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Append new point per trace — no full redraw
    useEffect(() => {
        if (!initialized.current || !PlotlyRef.current || !divRef.current) return;
        const t = Date.now();
        const newX: number[][] = [];
        const newY: number[][] = [];
        const indices: number[] = [];
        VIB_CYLS.forEach((num, i) => {
            const v = n(hmi[`rVib_Cil_${num}`]);
            if (v === null) return;
            newX.push([t]);
            newY.push([v]);
            indices.push(i);
        });
        if (indices.length > 0) {
            // 360 puntos max ≈ 6 min a 1 Hz
            PlotlyRef.current.extendTraces(divRef.current, { x: newX, y: newY }, indices, 360);
        }
    }, [hmi]);

    // Toggle visibility imperatively (no redraw)
    const toggleCyl = (i: number) =>
        setHidden(prev => {
            const s = new Set(prev);
            s.has(i) ? s.delete(i) : s.add(i);
            if (PlotlyRef.current && divRef.current) {
                PlotlyRef.current.restyle(divRef.current, { visible: [!s.has(i)] }, [i]);
            }
            return s;
        });

    return (
        <div className="flex-1 min-h-0 flex flex-col gap-1">
            {/* Chips de cilindros */}
            <div className="shrink-0 flex flex-wrap gap-0.5">
                {VIB_CYLS.map((num, i) => {
                    const color = VIB_COLORS[i % VIB_COLORS.length];
                    const off = hidden.has(i);
                    return (
                        <button
                            key={num}
                            onClick={() => toggleCyl(i)}
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
            {/* Contenedor imperativo */}
            <div ref={divRef} className="flex-1 min-h-0" style={{ width: "100%", height: "100%" }} />
        </div>
    );
}

function VibBar({ num, value }: { num: number; value: number | null }) {
    const status = value !== null ? getThresholdStatus(`rVib_Cil_${num}`, value) : "normal";
    const barColor =
        status === "critical" ? "bg-red-500" : status === "warning" ? "bg-yellow-400" : "bg-[#00ffc2]";
    const textColor =
        status === "critical"
            ? "text-red-500"
            : status === "warning"
            ? "text-yellow-400"
            : "text-[#00ffc2]";
    // Use an assumed max of 20 mm/s for display scaling
    const pct = value !== null ? Math.min(100, (value / 20) * 100) : 0;
    return (
        <div className="flex flex-col items-center gap-0.5 h-full">
            <span className={`text-[9px] font-bold tabular-nums ${textColor}`}>
                {value !== null ? value.toFixed(1) : "--"}
            </span>
            <div className="w-full bg-muted/20 rounded-sm relative overflow-hidden flex-1">
                <div
                    className={`absolute bottom-0 left-0 right-0 rounded-sm transition-all duration-500 ${barColor}`}
                    style={{ height: `${pct}%` }}
                />
            </div>
            <span className="text-[8px] text-muted-foreground">C{num}</span>
        </div>
    );
}

export default function TabConjuntoMotor({ engine, hmi, alarmas }: Props) {
    const promedio = n(engine["Promedio_tem_cyl"]);
    const delta = n(engine["delta_temp_cylinders"]);
    const warning = alarmas["Warning_delta_temp"]?.value;
    const hasAlarm = warning === "true" || warning === "1";

    // GEN55 Engine_1 solo tiene Devanado_W
    const devanadoW = n(engine["Devanado_W"]);

    const colorDev = devanadoW === null ? "text-foreground"
        : getThresholdStatus("Devanado_W", devanadoW) === "critical" ? "text-red-500"
        : getThresholdStatus("Devanado_W", devanadoW) === "warning"  ? "text-yellow-400"
        : "text-[#00ffc2]";

    const airTags = [
        ["Blower",  "Temp_Aire_Blower",       "°C"],
        ["Filtro",  "Temp_Aire_Filtro_Motor",  "°C"],
        ["MAT",     "MAT",                     "°C"],
        ["Gas Ent.","Temp_Gas_Entrada",         "°C"],
    ] as const;

    return (
        <div className="h-full flex flex-col gap-2 p-3 overflow-hidden">

            {/* ── FILA 1: Gauges | Alarma + Dev.W + 4 temps | Actuadores ── */}
            <div className="flex gap-2 items-stretch shrink-0">
                {/* Gauges */}
                <div className="w-28 shrink-0">
                    <HalfGauge label="Prom. Cil." value={promedio} unit="°F" min={400} max={650} warning={580} danger={610} size="sm" />
                </div>
                <div className="w-28 shrink-0">
                    <HalfGauge label="Delta Temp" value={delta} unit="°F" min={0} max={80} warning={30} danger={50} size="sm" />
                </div>

                {/* Alarma + Devanado W + 4 temps — grupo compacto */}
                <div className="flex flex-col gap-1.5 justify-center shrink-0">
                    {/* Fila superior: alarma + devanado */}
                    <div className="flex gap-1.5">
                        <div className={`rounded-lg border px-2.5 py-1 flex items-center gap-1.5 ${hasAlarm ? "border-red-500/60 bg-red-500/10" : "border-border bg-card"}`}>
                            <span className={`w-2 h-2 rounded-full shrink-0 ${hasAlarm ? "bg-red-500 animate-pulse" : "bg-[#22c55e]"}`} />
                            <div>
                                <p className="text-[8px] uppercase tracking-widest text-muted-foreground leading-none">Δ Temp</p>
                                <p className={`text-xs font-bold ${hasAlarm ? "text-red-400" : "text-[#00ffc2]"}`}>{hasAlarm ? "ALARMA" : "Normal"}</p>
                            </div>
                        </div>
                        <div className="rounded-lg border bg-card px-2.5 py-1">
                            <p className="text-[8px] uppercase tracking-widest text-muted-foreground leading-none mb-0.5">Dev. W</p>
                            <p className={`text-sm font-bold tabular-nums ${colorDev}`}>
                                {devanadoW !== null ? devanadoW.toFixed(0) : "--"}
                                <span className="text-[10px] font-normal text-muted-foreground ml-0.5">°C</span>
                            </p>
                        </div>
                    </div>
                    {/* Fila inferior: 4 temps */}
                    <div className="flex gap-1.5">
                        {airTags.map(([label, key, unit]) => {
                            const val = n(engine[key]);
                            const status = val !== null ? getThresholdStatus(key, val) : "normal";
                            const c = status === "critical" ? "text-red-500" : status === "warning" ? "text-yellow-400" : "text-[#00ffc2]";
                            return (
                                <div key={key} className="rounded-lg border bg-card px-2.5 py-1">
                                    <p className="text-[8px] uppercase tracking-widest text-muted-foreground leading-none mb-0.5 truncate">{label}</p>
                                    <p className={`text-sm font-bold tabular-nums ${c}`}>
                                        {val !== null ? val.toFixed(1) : "--"}
                                        <span className="text-[10px] font-normal text-muted-foreground ml-0.5">{unit}</span>
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Actuadores — ocupa el resto del ancho */}
                <div className="flex-1 rounded-lg border bg-card px-3 py-2 flex flex-col justify-center gap-2">
                    <h3 className="text-[9px] font-bold uppercase tracking-widest text-[#00ffc2] shrink-0">Actuadores</h3>
                    <BarActuator label="Throttle"    value={n(engine["Feedback_Throttle"])}  max={100} unit="%" />
                    <BarActuator label="T. Bypass 1" value={n(engine["Feedback_TBypass_1"])} max={100} unit="%" />
                    <BarActuator label="T. Bypass 2" value={n(engine["Feedback_TBypass_2"])} max={100} unit="%" />
                </div>
            </div>

            {/* ── FILA 2: 20 cilindros ── */}
            <div className="shrink-0">
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Temperatura Cilindros</p>
                <div className="grid grid-cols-10 gap-1">
                    {ALL_CYLS.map(num => <CylCard key={num} num={num} value={n(engine[`Tem_Cyl_${num}`])} />)}
                </div>
            </div>

            {/* ── FILA 3: Sidebar izq + Vibraciones ── */}
            <div className="flex-1 min-h-0 flex gap-2 overflow-hidden">

                {/* Sidebar angosto — Refrigeración + Aceite y Gas se reparten la altura */}
                <div className="w-48 shrink-0 flex flex-col gap-2 min-h-0">
                    {/* Refrigeración */}
                    <div className="flex-4 min-h-0 rounded-lg border bg-card p-2 flex flex-col">
                        <h3 className="shrink-0 text-[9px] font-bold uppercase tracking-widest text-[#00ffc2] mb-1">Refrigeración</h3>
                        <div className="flex-1 flex flex-col justify-evenly">
                            <SectionRow label="HT Entrada" value={n(engine["Temp_Refrigerante_HT_Entrada"])?.toFixed(1) ?? "--"} unit="°C" tagName="Temp_Refrigerante_HT_Entrada" />
                            <SectionRow label="HT Salida"  value={n(engine["Temp_Refrigerante_HT_Salida"])?.toFixed(1)  ?? "--"} unit="°C" tagName="Temp_Refrigerante_HT_Salida" />
                            <SectionRow label="LT Entrada" value={n(engine["Temp_Refrigerante_LT_Entrada"])?.toFixed(1) ?? "--"} unit="°C" tagName="Temp_Refrigerante_LT_Entrada" />
                            <SectionRow label="LT Salida"  value={n(engine["Temp_Refrigerante_LT_Salida"])?.toFixed(1)  ?? "--"} unit="°C" tagName="Temp_Refrigerante_LT_Salida" />
                        </div>
                    </div>

                    {/* Aceite y Gas */}
                    <div className="flex-7 min-h-0 rounded-lg border bg-card p-2 flex flex-col">
                        <h3 className="shrink-0 text-[9px] font-bold uppercase tracking-widest text-[#00ffc2] mb-1">Aceite y Gas</h3>
                        <div className="flex-1 flex flex-col justify-evenly">
                            <SectionRow label="Pres. Aceite" value={n(engine["Pres_Aceite_Motor"])?.toFixed(2)      ?? "--"} unit="bar"  tagName="Pres_Aceite_Motor" />
                            <SectionRow label="Temp. Aceite" value={n(engine["Temp_Aceite"])?.toFixed(1)            ?? "--"} unit="°C"   tagName="Temp_Aceite" />
                            <SectionRow label="Gas Entrada"  value={n(engine["Pres_Gas_Entrada_Motor"])?.toFixed(2) ?? "--"} unit="bar"  tagName="Pres_Gas_Entrada_Motor" />
                            <SectionRow label="Gas (PSI)"    value={n(engine["Pres_Gas_Entrada_PSI"])?.toFixed(1)   ?? "--"} unit="PSI"  tagName="Pres_Gas_Entrada_PSI" />
                            <SectionRow label="MAP P1"       value={n(engine["MAP_P1"])?.toFixed(1)                 ?? "--"} unit="mbar" tagName="MAP_P1" />
                            <SectionRow label="MAP P2"       value={n(engine["MAP_P2"])?.toFixed(1)                 ?? "--"} unit="mbar" tagName="MAP_P2" />
                            <SectionRow label="Pres. Diff."  value={n(engine["PresDiff"])?.toFixed(1)               ?? "--"} unit="mbar" tagName="PresDiff" />
                        </div>
                    </div>
                </div>

                {/* Vibraciones — ocupa todo el resto */}
                <div className="flex-1 min-h-0 min-w-0 rounded-lg border bg-card p-2.5 flex flex-col">
                    <h3 className="shrink-0 text-[9px] font-bold uppercase tracking-widest text-[#00ffc2] mb-0.5">
                        Vibraciones Cilindros
                    </h3>
                    <VibTrendsChart hmi={hmi} />
                </div>
            </div>
        </div>
    );
}
