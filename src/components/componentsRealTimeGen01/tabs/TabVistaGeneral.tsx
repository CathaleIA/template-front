"use client";

import { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { TagValue } from "@/context/IoTTagsContext";
import { getThresholdStatus, ALL_THRESHOLDS } from "@/config/thresholds-v2";
import HalfGauge from "../shared/HalfGauge";
import { appendChartRow, loadChartHistory, MAX_AGE_MS } from "@/lib/chartHistory";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface Props {
    agc: Record<string, TagValue>;
    engine: Record<string, TagValue>;
    raiz: Record<string, TagValue>;
}

interface PowerPoint {
    t: number;     // epoch ms — misma unidad que Plotly usa internamente
    v: number;
}

const HISTORY_MS = MAX_AGE_MS; // mantener últimas 12 horas (persistido en IndexedDB + S3)
const n = (v?: TagValue) => (v ? parseFloat(v.value) : null);

const STATUS_TEXT: Record<string, string> = {
    critical: "text-red-500",
    warning:  "text-yellow-400",
    info:     "text-blue-400",
    normal:   "text-[#00ffc2]",
};

function statusColor(tagName: string, val: number | null) {
    if (val === null) return "text-[#00ffc2]";
    return STATUS_TEXT[getThresholdStatus(tagName, val)] ?? "text-[#00ffc2]";
}

function BottomCard({ label, value, unit, tagName }: { label: string; value: string; unit: string; tagName?: string }) {
    const numVal = parseFloat(value);
    const color = tagName && !isNaN(numVal) ? statusColor(tagName, numVal) : "text-[#00ffc2]";
    return (
        <div className="rounded-lg border bg-card px-2 py-1.5 flex flex-col gap-0.5">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground leading-tight truncate">{label}</p>
            <p className={`text-base font-bold tabular-nums ${color}`}>
                {value}<span className="text-xs font-normal text-muted-foreground ml-0.5">{unit}</span>
            </p>
        </div>
    );
}

function PowerChart({
    data,
    color,
    unit,
    label,
    tagName,
    currentVal,
}: {
    data: PowerPoint[];
    color: string;
    unit: string;
    label: string;
    tagName: string;
    currentVal: number | null;
}) {
    const valColor = statusColor(tagName, currentVal);
    const displayVal = currentVal !== null ? currentVal.toFixed(0) : "--";
    const [activeBtn, setActiveBtn] = useState<"1m" | "3m" | "1h" | "∞">("∞");
    const plotDivId = `power-chart-${tagName}`;

    // ── LIVE / EXPLORE mode ─────────────────────────────────────────────────
    // true  = LIVE MODE:    viewport slides with latest data
    // false = EXPLORE MODE: viewport frozen, user is panning/zooming freely
    const isLiveModeRef = useRef(true);
    const windowMinsRef = useRef<number | null>(null);
    const isInternalRef = useRef(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const PlotlyRef = useRef<any>(null);

    // Load Plotly module for imperative calls (same instance as react-plotly.js uses)
    useEffect(() => {
        import("plotly.js-dist-min").then(mod => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            PlotlyRef.current = (mod as any).default ?? mod;
        });
    }, []);

    const xs = data.map(p => p.t);
    const ys = data.map(p => p.v);

    // Button click → LIVE MODE: jump to latest data
    const activateLive = (minutes: number | null, btn: "1m" | "3m" | "1h" | "∞") => {
        isLiveModeRef.current = true;
        windowMinsRef.current = minutes;
        setActiveBtn(btn);
        const el = document.getElementById(plotDivId);
        if (!el || !PlotlyRef.current) return;
        isInternalRef.current = true;
        const update = minutes === null
            ? { "xaxis.autorange": true }
            : data.length > 0
                ? { "xaxis.range": [data[data.length - 1].t - minutes * 60_000, data[data.length - 1].t], "xaxis.autorange": false }
                : { "xaxis.autorange": true };
        PlotlyRef.current.relayout(el, update)
            .finally(() => { isInternalRef.current = false; });
    };

    // Slide viewport on new data — ONLY in LIVE MODE with a time window
    useEffect(() => {
        if (!isLiveModeRef.current) return; // EXPLORE MODE → don't touch viewport
        const mins = windowMinsRef.current;
        if (mins === null || data.length === 0) return; // ∞ → autorange handles it
        const el = document.getElementById(plotDivId);
        if (!el || !PlotlyRef.current) return;
        const end = data[data.length - 1].t;
        isInternalRef.current = true;
        PlotlyRef.current.relayout(el, { "xaxis.range": [end - mins * 60_000, end] })
            .finally(() => { isInternalRef.current = false; });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    // Detect user pan/zoom → EXPLORE MODE
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleRelayout = (eventData: any) => {
        if (isInternalRef.current) return;
        if (eventData["xaxis.range[0]"] !== undefined ||
            eventData["xaxis.range"] !== undefined) {
            isLiveModeRef.current = false;
            setActiveBtn("∞");
        }
    };

    // Líneas de umbral (warning/critical) desde el archivo de thresholds
    const th = ALL_THRESHOLDS[tagName];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const thresholdShapes: any[] = [];
    if (th) {
        const addLine = (val: number | undefined, lineColor: string, dash: string) => {
            if (val === undefined) return;
            thresholdShapes.push({
                type: "line", xref: "paper", x0: 0, x1: 1,
                y0: val, y1: val,
                line: { color: lineColor, width: 1, dash },
            });
        };
        addLine(th.warning_high,  "rgba(250,204,21,0.55)",  "dash");
        addLine(th.warning_low,   "rgba(250,204,21,0.55)",  "dash");
        addLine(th.critical_high, "rgba(239,68,68,0.55)",   "dot");
        addLine(th.critical_low,  "rgba(239,68,68,0.55)",   "dot");
    }

    return (
        <div className="flex items-stretch gap-2 bg-card border rounded-xl px-3 py-1 min-w-0 flex-1 min-h-0">
            {/* Valor actual */}
            <div className="shrink-0 w-20 flex flex-col justify-center">
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground leading-tight truncate">{label}</p>
                <p className={`text-xl font-bold tabular-nums leading-none mt-1 ${valColor}`}>
                    {displayVal}
                    <span className="text-[10px] font-normal text-muted-foreground ml-0.5">{unit}</span>
                </p>
            </div>

            {/* Botones de rango — verticales, al costado del valor */}
            <div className="shrink-0 flex flex-col gap-1 items-stretch justify-center self-stretch border-l border-border/30 pl-2">
                {(["1m", "3m", "1h", "∞"] as const).map((btn) => (
                    <button
                        key={btn}
                        onClick={() => activateLive(btn === "1m" ? 1 : btn === "3m" ? 3 : btn === "1h" ? 60 : null, btn)}
                        title={btn === "1m" ? "Último minuto" : btn === "3m" ? "Últimos 3 min" : btn === "1h" ? "Última hora" : "Todo el historial"}
                        className="text-[11px] font-bold px-2 py-1 rounded transition-all leading-none"
                        style={{
                            background: activeBtn === btn ? `${color}22` : "transparent",
                            color: activeBtn === btn ? color : "#6b7280",
                            border: `1px solid ${activeBtn === btn ? `${color}55` : "transparent"}`,
                        }}
                    >{btn}</button>
                ))}
            </div>

            {/* Gráfica Plotly — crece con la altura del card */}
            <div className="flex-1 min-w-0 min-h-0">
                <Plot
                    divId={plotDivId}
                    data={[{
                        x: xs,
                        y: ys,
                        type: "scatter",
                        mode: "lines",
                        line: { color, width: 1.5, shape: "spline" },
                        fill: "tozeroy",
                        fillcolor: `${color}28`,
                        hovertemplate: `%{x|%H:%M:%S}<br><b>%{y:.0f} ${unit}</b><extra></extra>`,
                    }]}
                    layout={{
                        uirevision: tagName,
                        autosize: true,
                        margin: { l: 30, r: 8, t: 2, b: 14 },
                        paper_bgcolor: "rgba(0,0,0,0)",
                        plot_bgcolor: "rgba(0,0,0,0)",
                        showlegend: false,
                        shapes: thresholdShapes,
                        annotations: currentVal !== null ? [{
                            xref: "paper", x: 0,
                            yref: "y",     y: currentVal,
                            text: `<b>${currentVal.toFixed(0)}</b>`,
                            showarrow: false,
                            font: { color, size: 9 },
                            xanchor: "right",
                            yanchor: "middle",
                            bgcolor: "rgba(13,13,15,0.75)",
                            borderpad: 2,
                            bordercolor: `${color}70`,
                            borderwidth: 1,
                        }] : [],
                        xaxis: {
                            type: "date",
                            tickformat: "%H:%M:%S",
                            tickfont: { size: 8, color: "#6b7280" },
                            gridcolor: "rgba(255,255,255,0.04)",
                            linecolor: `${color}30`,
                            rangeslider: {
                                visible: true,
                                bgcolor: "rgba(0,0,0,0.15)",
                                bordercolor: `${color}25`,
                                borderwidth: 1,
                                thickness: 0.08,
                            },
                        },
                        yaxis: {
                            visible: true,
                            tickfont: { size: 8, color: "#6b7280" },
                            gridcolor: "rgba(255,255,255,0.04)",
                            tickformat: "~s",
                            fixedrange: false,
                        },
                    }}
                    config={{
                        displayModeBar: false,
                        responsive: true,
                        scrollZoom: true,
                    }}
                    onRelayout={handleRelayout}
                    style={{ width: "100%", height: "100%" }}
                    useResizeHandler
                />
            </div>
        </div>
    );
}

export default function TabVistaGeneral({ agc, engine, raiz }: Props) {
    const histActive   = useRef<PowerPoint[]>([]);
    const histReactive = useRef<PowerPoint[]>([]);
    const histApparent = useRef<PowerPoint[]>([]);
    // contador para forzar re-render cuando los refs se actualizan
    const [, setRev] = useState(0);

    const activePow   = n(agc["Generator_active_power"]);
    const reactivePow = n(agc["Generator_reactive_power"]);
    const apparentPow = n(agc["Generator_apparent_power"]);

    // Cargar historial desde S3/IndexedDB al montar
    useEffect(() => {
        loadChartHistory("gen01_potencies").then(rows => {
            if (rows.length === 0) return;
            histActive.current   = rows.map(r => ({ t: r.t, v: r.values[0] ?? 0 })).filter(p => p.v !== 0);
            histReactive.current = rows.map(r => ({ t: r.t, v: r.values[1] ?? 0 })).filter(p => p.v !== 0);
            histApparent.current = rows.map(r => ({ t: r.t, v: r.values[2] ?? 0 })).filter(p => p.v !== 0);
            setRev(r => r + 1);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Acumular historial cuando llegan nuevos datos
    useEffect(() => {
        const t = Date.now(); // epoch ms
        const cutoff = t - HISTORY_MS;
        const push = (ref: React.RefObject<PowerPoint[]>, v: number | null) => {
            if (v === null) return;
            ref.current = [...ref.current!.filter(p => p.t >= cutoff), { t, v }];
        };
        push(histActive,   activePow);
        push(histReactive, reactivePow);
        push(histApparent, apparentPow);
        // Persistir en IndexedDB para recargas futuras
        if (activePow !== null && reactivePow !== null && apparentPow !== null) {
            appendChartRow("gen01_potencies", t, [activePow, reactivePow, apparentPow]);
        }
        setRev(r => r + 1);
    }, [activePow, reactivePow, apparentPow]);

    const rpm      = n(agc["RPM"]);
    const freqRaw  = n(agc["Generator_frequency_L1"]);
    const freqHz   = freqRaw !== null ? freqRaw / 100 : null;
    const pf       = n(agc["Generator_PF"]);

    const promCyl   = n(engine["Promedio_tem_cyl"]);
    const presAceite = n(engine["Pres_Aceite_Motor"]);
    const tempAceite = n(engine["Temp_Aceite"]);
    const devanadoW  = n(engine["Devanado_W"]);

    const energiaExp = n(agc["EnergiaExp"]);
    const vdcBattery = n(agc["VDCbattery"]);
    const iexcGen    = n(agc["IexcGen"]);
    const freqEscale = n(agc["FreqEscale"]);
    const tecFlujo   = n(raiz["TEC_FLUJO_CALCULADO"]);

    return (
        <div className="h-full flex flex-col gap-2 p-2 overflow-hidden">

            {/* FILA TOP: Gauges + 3 gráficas de potencia + PF — crece con la pantalla */}
            <div className="flex gap-3 items-stretch flex-3 min-h-0">
                {/* Gauges apilados verticalmente */}
                <div className="w-28 shrink-0 flex flex-col gap-2">
                    <HalfGauge label="RPM" value={rpm} unit="rpm" min={0} max={2000} warning={1750} danger={1900} size="sm" />
                    <HalfGauge label="Frecuencia" value={freqHz} unit="Hz" min={55} max={65} warning={59} danger={61} size="sm" />
                </div>

                {/* 3 gráficas apiladas */}
                <div className="flex-1 flex flex-col gap-1.5">
                    <PowerChart
                        data={histActive.current}
                        color="#00ffc2"
                        unit="kW"
                        label="Potencia Activa"
                        tagName="Generator_active_power"
                        currentVal={activePow}
                    />
                    <PowerChart
                        data={histReactive.current}
                        color="#facc15"
                        unit="kVAr"
                        label="Pot. Reactiva"
                        tagName="Generator_reactive_power"
                        currentVal={reactivePow}
                    />
                    <PowerChart
                        data={histApparent.current}
                        color="#818cf8"
                        unit="kVA"
                        label="Pot. Aparente"
                        tagName="Generator_apparent_power"
                        currentVal={apparentPow}
                    />
                </div>

                {/* Factor de Potencia */}
                <div className="w-24 shrink-0 rounded-xl border bg-card flex flex-col items-center justify-center gap-1 px-2">
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground text-center leading-tight">Factor Potencia</p>
                    <p className={`text-2xl font-bold tabular-nums ${statusColor("Generator_PF", pf)}`}>
                        {pf !== null ? pf.toFixed(3) : "--"}
                    </p>
                </div>
            </div>

            {/* FILA KPIs: todos los valores en una fila */}
            <div className="grid grid-cols-9 gap-1.5 shrink-0">
                <BottomCard label="Prom. Temp Cil." value={promCyl !== null ? promCyl.toFixed(0) : "--"} unit="°F" tagName="Promedio_tem_cyl" />
                <BottomCard label="Presión Aceite"  value={presAceite !== null ? presAceite.toFixed(2) : "--"} unit="bar" tagName="Pres_Aceite_Motor" />
                <BottomCard label="Temp. Aceite"    value={tempAceite !== null ? tempAceite.toFixed(1) : "--"} unit="°C" tagName="Temp_Aceite" />
                <BottomCard label="Devanado W"      value={devanadoW !== null ? devanadoW.toFixed(0) : "--"} unit="°C" tagName="Devanado_W" />
                <BottomCard label="Energía Export." value={energiaExp !== null ? energiaExp.toFixed(0) : "--"} unit="kWh" tagName="EnergiaExp" />
                <BottomCard label="VDC Battery"     value={vdcBattery !== null ? vdcBattery.toFixed(1) : "--"} unit="VDC" tagName="VDCbattery" />
                <BottomCard label="IexcGen"         value={iexcGen !== null ? iexcGen.toFixed(2) : "--"} unit="A" tagName="IexcGen" />
                <BottomCard label="FreqEscale"      value={freqEscale !== null ? freqEscale.toFixed(2) : "--"} unit="" tagName="FreqEscale" />
                <BottomCard label="Flujo Calc."     value={tecFlujo !== null ? tecFlujo.toFixed(2) : "--"} unit="L/s" tagName="TEC_FLUJO_CALCULADO" />
            </div>

            {/* TABLA ELÉCTRICA: Generador + Bus B — filas con flex para llenar el espacio */}
            <div className="flex-2 grid grid-cols-2 gap-3 min-h-0">

                {/* Generador */}
                <div className="rounded-lg border bg-card p-2 flex flex-col min-h-0">
                    <h3 className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-[#00ffc2] mb-1">Generador — Datos por Fase</h3>
                    <div className="flex-1 grid grid-cols-2 gap-x-4 min-h-0">
                        {/* Col izquierda: V L-N + V L-L */}
                        <div className="flex flex-col min-h-0">
                            <p className="shrink-0 text-[9px] uppercase tracking-widest text-muted-foreground mb-0.5">Voltajes L-N</p>
                            <div className="flex-1 flex flex-col justify-evenly">
                                {[["V L1-N","Generator_voltage_L1_N","V"],["V L2-N","Generator_voltage_L2_N","V"],["V L3-N","Generator_voltage_L3_N","V"]].map(([label,key,unit]) => {
                                    const val = n(agc[key]); const color = statusColor(key, val);
                                    return <div key={key} className="flex items-center justify-between border-b border-border/30 last:border-0 py-px"><span className="text-xs text-muted-foreground">{label}</span><span className={`text-xs font-semibold tabular-nums ${color}`}>{val !== null ? val.toFixed(0) : "--"} <span className="text-muted-foreground font-normal">{unit}</span></span></div>;
                                })}
                            </div>
                            <p className="shrink-0 text-[9px] uppercase tracking-widest text-muted-foreground mt-1 mb-0.5">Voltajes L-L</p>
                            <div className="flex-1 flex flex-col justify-evenly">
                                {[["V L1-L2","Generator_voltage_L1_L2","V"],["V L2-L3","Generator_voltage_L2_L3","V"],["V L3-L1","Generator_voltage_L3_L1","V"]].map(([label,key,unit]) => {
                                    const val = n(agc[key]); const color = statusColor(key, val);
                                    return <div key={key} className="flex items-center justify-between border-b border-border/30 last:border-0 py-px"><span className="text-xs text-muted-foreground">{label}</span><span className={`text-xs font-semibold tabular-nums ${color}`}>{val !== null ? val.toFixed(0) : "--"} <span className="text-muted-foreground font-normal">{unit}</span></span></div>;
                                })}
                            </div>
                        </div>
                        {/* Col derecha: Corrientes + Potencias */}
                        <div className="flex flex-col min-h-0">
                            <p className="shrink-0 text-[9px] uppercase tracking-widest text-muted-foreground mb-0.5">Corrientes</p>
                            <div className="flex-1 flex flex-col justify-evenly">
                                {[["I L1","Generator_current_L1","A"],["I L2","Generator_current_L2","A"],["I L3","Generator_current_L3","A"]].map(([label,key,unit]) => {
                                    const val = n(agc[key]); const color = statusColor(key, val);
                                    return <div key={key} className="flex items-center justify-between border-b border-border/30 last:border-0 py-px"><span className="text-xs text-muted-foreground">{label}</span><span className={`text-xs font-semibold tabular-nums ${color}`}>{val !== null ? val.toFixed(0) : "--"} <span className="text-muted-foreground font-normal">{unit}</span></span></div>;
                                })}
                            </div>
                            <p className="shrink-0 text-[9px] uppercase tracking-widest text-muted-foreground mt-1 mb-0.5">Potencias</p>
                            <div className="flex-1 flex flex-col justify-evenly">
                                {[["P Act.","Generator_active_power","kW"],["P React.","Generator_reactive_power","kVAr"],["P Apar.","Generator_apparent_power","kVA"]].map(([label,key,unit]) => {
                                    const val = n(agc[key]); const color = statusColor(key, val);
                                    return <div key={key} className="flex items-center justify-between border-b border-border/30 last:border-0 py-px"><span className="text-xs text-muted-foreground">{label}</span><span className={`text-xs font-semibold tabular-nums ${color}`}>{val !== null ? val.toFixed(0) : "--"} <span className="text-muted-foreground font-normal">{unit}</span></span></div>;
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Barra Bus B */}
                <div className="rounded-lg border bg-card p-2 flex flex-col min-h-0">
                    <h3 className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-[#00ffc2]/70 mb-1">Barra Bus B</h3>
                    <div className="flex-1 grid grid-cols-2 gap-x-4 min-h-0">
                        <div className="flex flex-col min-h-0">
                            <p className="shrink-0 text-[9px] uppercase tracking-widest text-muted-foreground mb-0.5">Voltajes L-L</p>
                            <div className="flex-1 flex flex-col justify-evenly">
                                {[["V L1-L2","BusB_voltage_L1_L2","V"],["V L2-L3","BusB_voltage_L2_L3","V"],["V L3-L1","BusB_voltage_L3_L1","V"]].map(([label,key,unit]) => {
                                    const val = n(agc[key]);
                                    return <div key={key} className="flex items-center justify-between border-b border-border/30 last:border-0 py-px"><span className="text-xs text-muted-foreground">{label}</span><span className="text-xs font-semibold tabular-nums text-foreground">{val !== null ? val.toFixed(0) : "--"} <span className="text-muted-foreground font-normal">{unit}</span></span></div>;
                                })}
                            </div>
                        </div>
                        <div className="flex flex-col min-h-0">
                            <p className="shrink-0 text-[9px] uppercase tracking-widest text-muted-foreground mb-0.5">Frecuencias</p>
                            <div className="flex-1 flex flex-col justify-evenly">
                                {[["F L1","BusB_frequency_L1"],["F L2","BusB_frequency_L2"],["F L3","BusB_frequency_L3"]].map(([label,key]) => {
                                    const val = n(agc[key]);
                                    return <div key={key} className="flex items-center justify-between border-b border-border/30 last:border-0 py-px"><span className="text-xs text-muted-foreground">{label}</span><span className="text-xs font-semibold tabular-nums text-foreground">{val !== null ? (val/100).toFixed(2) : "--"} <span className="text-muted-foreground font-normal">Hz</span></span></div>;
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
