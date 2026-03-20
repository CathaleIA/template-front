"use client";

import { useRef, useEffect } from "react";
import { TagValue } from "@/context/IoTTagsContext";
import { getThresholdStatus } from "@/config/thresholds-v2";
import HalfGauge from "../shared/HalfGauge";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Brush,
} from "recharts";

interface Props {
    agc: Record<string, TagValue>;
    engine: Record<string, TagValue>;
    raiz: Record<string, TagValue>;
}

interface PowerPoint {
    t: string;
    v: number | null;
}

const MAX_POINTS = 100; // ~5 min a 3 s/punto
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

function MidCard({ label, value, unit, tagName }: { label: string; value: string; unit: string; tagName?: string }) {
    const numVal = parseFloat(value);
    const color = tagName && !isNaN(numVal) ? statusColor(tagName, numVal) : "text-[#00ffc2]";
    return (
        <div className="rounded-lg border bg-card px-3 py-2 flex flex-col gap-0.5">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground leading-tight truncate">{label}</p>
            <p className={`text-lg font-bold tabular-nums ${color}`}>
                {value}<span className="text-xs font-normal text-muted-foreground ml-0.5">{unit}</span>
            </p>
        </div>
    );
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

// Cuántos puntos mostrar por defecto en la ventana del Brush (~30 s)
const WINDOW_POINTS = 10;

function SmallLineChart({
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

    // Brush: ventana deslizante — siempre arrancada al final (datos más recientes)
    const startIdx = Math.max(0, data.length - WINDOW_POINTS);
    const endIdx   = data.length > 0 ? data.length - 1 : 0;

    // 4 ticks visibles dentro de la ventana visible
    const tickInterval = data.length > 4 ? Math.floor(data.length / 4) : 0;

    return (
        <div className="flex items-stretch gap-3 bg-card border rounded-xl px-3 pt-2 pb-1 min-w-0 flex-1">
            {/* Valor actual */}
            <div className="shrink-0 w-20 flex flex-col justify-center">
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground leading-tight truncate">{label}</p>
                <p className={`text-xl font-bold tabular-nums leading-none mt-1 ${valColor}`}>
                    {displayVal}
                    <span className="text-[10px] font-normal text-muted-foreground ml-0.5">{unit}</span>
                </p>
            </div>
            {/* Gráfica */}
            <div className="flex-1 min-w-0 h-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 6, right: 4, bottom: 0, left: 0 }}>
                        <defs>
                            <linearGradient id={`fill-${tagName}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor={color} stopOpacity={0.35} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <YAxis domain={["auto", "auto"]} hide />
                        <XAxis
                            dataKey="t"
                            interval={tickInterval}
                            tick={{ fontSize: 8, fill: "var(--muted-foreground)", dy: 2 }}
                            tickLine={false}
                            axisLine={{ stroke: color, strokeOpacity: 0.25, strokeWidth: 1 }}
                            height={16}
                        />
                        {/* Brush: scrollbar para moverse por el historial de 5 min */}
                        {data.length > WINDOW_POINTS && (
                            <Brush
                                dataKey="t"
                                height={10}
                                startIndex={startIdx}
                                endIndex={endIdx}
                                stroke={color}
                                fill="var(--card)"
                                travellerWidth={6}
                                tickFormatter={() => ""}
                            />
                        )}
                        <Tooltip
                            contentStyle={{ background: "#0f0f0f", border: `1px solid ${color}55`, borderRadius: 8, padding: "3px 10px" }}
                            labelStyle={{ fontSize: 10, color: "#888" }}
                            formatter={(val: number) => [`${val.toFixed(0)} ${unit}`, label]}
                            itemStyle={{ color, fontSize: 11 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="v"
                            stroke={color}
                            strokeWidth={2}
                            fill={`url(#fill-${tagName})`}
                            dot={false}
                            isAnimationActive={false}
                            connectNulls
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default function TabVistaGeneral({ agc, engine, raiz }: Props) {
    const histActive   = useRef<PowerPoint[]>([]);
    const histReactive = useRef<PowerPoint[]>([]);
    const histApparent = useRef<PowerPoint[]>([]);

    const activePow   = n(agc["Generator_active_power"]);
    const reactivePow = n(agc["Generator_reactive_power"]);
    const apparentPow = n(agc["Generator_apparent_power"]);

    // Acumular historial cuando llegan nuevos datos
    useEffect(() => {
        const t = new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        const push = (ref: React.MutableRefObject<PowerPoint[]>, v: number | null) => {
            if (v === null) return;
            ref.current = [...ref.current.slice(-(MAX_POINTS - 1)), { t, v }];
        };
        push(histActive,   activePow);
        push(histReactive, reactivePow);
        push(histApparent, apparentPow);
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
        <div className="h-full flex flex-col gap-2 p-3 overflow-hidden">

            {/* FILA TOP: Gauges + 3 gráficas de potencia + PF */}
            <div className="flex gap-3 items-stretch shrink-0">
                {/* Gauges */}
                <div className="w-28 shrink-0">
                    <HalfGauge label="RPM" value={rpm} unit="rpm" min={0} max={2000} warning={1750} danger={1900} size="sm" />
                </div>
                <div className="w-28 shrink-0">
                    <HalfGauge label="Frecuencia" value={freqHz} unit="Hz" min={55} max={65} warning={59} danger={61} size="sm" />
                </div>

                {/* 3 gráficas apiladas */}
                <div className="flex-1 flex flex-col gap-1.5 min-h-70">
                    <SmallLineChart
                        data={histActive.current}
                        color="#00ffc2"
                        unit="kW"
                        label="Potencia Activa"
                        tagName="Generator_active_power"
                        currentVal={activePow}
                    />
                    <SmallLineChart
                        data={histReactive.current}
                        color="#facc15"
                        unit="kVAr"
                        label="Pot. Reactiva"
                        tagName="Generator_reactive_power"
                        currentVal={reactivePow}
                    />
                    <SmallLineChart
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

            {/* FILA MEDIO: Motor health */}
            <div className="grid grid-cols-4 gap-2 shrink-0">
                <MidCard label="Prom. Temp Cil." value={promCyl !== null ? promCyl.toFixed(0) : "--"} unit="°F" tagName="Promedio_tem_cyl" />
                <MidCard label="Presión Aceite"  value={presAceite !== null ? presAceite.toFixed(2) : "--"} unit="bar" tagName="Pres_Aceite_Motor" />
                <MidCard label="Temp. Aceite"    value={tempAceite !== null ? tempAceite.toFixed(1) : "--"} unit="°C" tagName="Temp_Aceite" />
                <MidCard label="Devanado W"       value={devanadoW !== null ? devanadoW.toFixed(0) : "--"} unit="°C" tagName="Devanado_W" />
            </div>

            {/* FILA BOTTOM: Extras */}
            <div className="grid grid-cols-5 gap-2 shrink-0">
                <BottomCard label="Energía Exportada" value={energiaExp !== null ? energiaExp.toFixed(0) : "--"} unit="kWh" tagName="EnergiaExp" />
                <BottomCard label="VDC Battery"        value={vdcBattery !== null ? vdcBattery.toFixed(1) : "--"} unit="VDC" tagName="VDCbattery" />
                <BottomCard label="IexcGen"            value={iexcGen !== null ? iexcGen.toFixed(2) : "--"} unit="A" tagName="IexcGen" />
                <BottomCard label="FreqEscale"         value={freqEscale !== null ? freqEscale.toFixed(2) : "--"} unit="" tagName="FreqEscale" />
                <BottomCard label="Flujo Calculado"    value={tecFlujo !== null ? tecFlujo.toFixed(2) : "--"} unit="L/s" tagName="TEC_FLUJO_CALCULADO" />
            </div>

            {/* TABLA ELÉCTRICA: Generador + Bus B */}
            <div className="flex-1 grid grid-cols-2 gap-3 min-h-0 overflow-hidden">
                <div className="rounded-lg border bg-card p-3 overflow-y-auto">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#00ffc2] mb-2">Generador — Datos por Fase</h3>
                    <div className="grid grid-cols-2 gap-x-4">
                        <div>
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Voltajes L-N</p>
                            {[["V L1-N","Generator_voltage_L1_N","V"],["V L2-N","Generator_voltage_L2_N","V"],["V L3-N","Generator_voltage_L3_N","V"]].map(([label,key,unit]) => {
                                const val = n(agc[key]); const color = statusColor(key, val);
                                return <div key={key} className="flex items-center justify-between py-1 border-b border-border/40 last:border-0"><span className="text-xs text-muted-foreground">{label}</span><span className={`text-xs font-semibold tabular-nums ${color}`}>{val !== null ? val.toFixed(0) : "--"} <span className="text-muted-foreground font-normal">{unit}</span></span></div>;
                            })}
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mt-1.5 mb-1">Voltajes L-L</p>
                            {[["V L1-L2","Generator_voltage_L1_L2","V"],["V L2-L3","Generator_voltage_L2_L3","V"],["V L3-L1","Generator_voltage_L3_L1","V"]].map(([label,key,unit]) => {
                                const val = n(agc[key]); const color = statusColor(key, val);
                                return <div key={key} className="flex items-center justify-between py-1 border-b border-border/40 last:border-0"><span className="text-xs text-muted-foreground">{label}</span><span className={`text-xs font-semibold tabular-nums ${color}`}>{val !== null ? val.toFixed(0) : "--"} <span className="text-muted-foreground font-normal">{unit}</span></span></div>;
                            })}
                        </div>
                        <div>
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Corrientes</p>
                            {[["I L1","Generator_current_L1","A"],["I L2","Generator_current_L2","A"],["I L3","Generator_current_L3","A"]].map(([label,key,unit]) => {
                                const val = n(agc[key]); const color = statusColor(key, val);
                                return <div key={key} className="flex items-center justify-between py-1 border-b border-border/40 last:border-0"><span className="text-xs text-muted-foreground">{label}</span><span className={`text-xs font-semibold tabular-nums ${color}`}>{val !== null ? val.toFixed(0) : "--"} <span className="text-muted-foreground font-normal">{unit}</span></span></div>;
                            })}
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mt-1.5 mb-1">Potencias</p>
                            {[["P Act.","Generator_active_power","kW"],["P React.","Generator_reactive_power","kVAr"],["P Apar.","Generator_apparent_power","kVA"]].map(([label,key,unit]) => {
                                const val = n(agc[key]); const color = statusColor(key, val);
                                return <div key={key} className="flex items-center justify-between py-1 border-b border-border/40 last:border-0"><span className="text-xs text-muted-foreground">{label}</span><span className={`text-xs font-semibold tabular-nums ${color}`}>{val !== null ? val.toFixed(0) : "--"} <span className="text-muted-foreground font-normal">{unit}</span></span></div>;
                            })}
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-3 overflow-y-auto">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#00ffc2]/70 mb-2">Barra Bus B</h3>
                    <div className="grid grid-cols-2 gap-x-4">
                        <div>
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Voltajes L-L</p>
                            {[["V L1-L2","BusB_voltage_L1_L2","V"],["V L2-L3","BusB_voltage_L2_L3","V"],["V L3-L1","BusB_voltage_L3_L1","V"]].map(([label,key,unit]) => {
                                const val = n(agc[key]);
                                return <div key={key} className="flex items-center justify-between py-1 border-b border-border/40 last:border-0"><span className="text-xs text-muted-foreground">{label}</span><span className="text-xs font-semibold tabular-nums text-foreground">{val !== null ? val.toFixed(0) : "--"} <span className="text-muted-foreground font-normal">{unit}</span></span></div>;
                            })}
                        </div>
                        <div>
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Frecuencias</p>
                            {[["F L1","BusB_frequency_L1"],["F L2","BusB_frequency_L2"],["F L3","BusB_frequency_L3"]].map(([label,key]) => {
                                const val = n(agc[key]);
                                return <div key={key} className="flex items-center justify-between py-1 border-b border-border/40 last:border-0"><span className="text-xs text-muted-foreground">{label}</span><span className="text-xs font-semibold tabular-nums text-foreground">{val !== null ? (val/100).toFixed(2) : "--"} <span className="text-muted-foreground font-normal">Hz</span></span></div>;
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
