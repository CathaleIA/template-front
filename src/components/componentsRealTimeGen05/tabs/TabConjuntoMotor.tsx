"use client";

import { TagValue } from "@/context/IoTTagsContext";
import { getThresholdStatus } from "@/config/thresholds-v2";
import HalfGauge from "@/components/componentsRealTimeGen01/shared/HalfGauge";
import { VibTrendsChart } from "@/components/componentsRealTimeGen01/shared/VibTrendsChart";

interface Props {
    engine: Record<string, TagValue>;
    hmi: Record<string, TagValue>;
    alarmas: Record<string, TagValue>;
}

const n = (v?: TagValue) => (v ? parseFloat(v.value) : null);

const ALL_CYLS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

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
            <span className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">C{num}</span>
            <span className="text-sm font-bold tabular-nums leading-tight">{value !== null ? value.toFixed(0) : "--"}</span>
        </div>
    );
}

function SectionRow({ label, value, unit, tagName }: { label: string; value: string; unit: string; tagName?: string }) {
    const numVal = parseFloat(value);
    const status = tagName && !isNaN(numVal) ? getThresholdStatus(tagName, numVal) : "normal";
    const colorMap: Record<string, string> = { critical: "text-red-500", warning: "text-yellow-400", info: "text-blue-400", normal: "text-[#00ffc2]" };
    return (
        <div className="flex items-center justify-between py-1 border-b border-border/40 last:border-0">
            <span className="text-xs text-muted-foreground truncate mr-2">{label}</span>
            <span className={`text-xs font-semibold tabular-nums whitespace-nowrap ${colorMap[status] ?? "text-foreground"}`}>
                {value} <span className="text-muted-foreground font-normal">{unit}</span>
            </span>
        </div>
    );
}

function BarActuator({ label, value, max = 100, unit = "%" }: { label: string; value: number | null; max?: number; unit?: string }) {
    const pct = value !== null ? Math.min(100, (value / max) * 100) : 0;
    const barColor = pct > 90 ? "bg-red-500" : pct > 70 ? "bg-yellow-400" : "bg-[#00ffc2]";
    return (
        <div className="flex flex-col gap-0.5">
            <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest truncate">{label}</span>
                <span className="text-xs font-semibold tabular-nums text-foreground ml-1 whitespace-nowrap">
                    {value !== null ? value.toFixed(1) : "--"}{" "}<span className="text-muted-foreground font-normal">{unit}</span>
                </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted/30">
                <div className={`h-1.5 rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

const GEN05_VIB_SHAPES = [
    { type: "line", xref: "paper", x0: 0, x1: 1, y0: 7.1,  y1: 7.1,  line: { color: "rgba(250,204,21,0.65)", width: 1.5, dash: "dash" } },
    { type: "line", xref: "paper", x0: 0, x1: 1, y0: 11.2, y1: 11.2, line: { color: "rgba(239,68,68,0.65)",  width: 1.5, dash: "dot"  } },
];

export default function TabConjuntoMotor({ engine, hmi, alarmas }: Props) {
    const promedio = n(engine["Promedio_tem_cyl"]);
    const delta = n(engine["delta_temp_cylinders"]);
    const warning = alarmas["Warning_delta_temp"]?.value;
    const hasAlarm = warning === "true" || warning === "1";

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

            <div className="flex gap-2 items-stretch shrink-0">
                <div className="w-24 shrink-0">
                    <HalfGauge label="Prom. Cil." value={promedio} unit="°C" min={400} max={650} warning={580} danger={610} size="sm" />
                </div>
                <div className="w-24 shrink-0">
                    <HalfGauge label="Delta Temp" value={delta} unit="°C" min={0} max={80} warning={30} danger={50} size="sm" />
                </div>

                <div className="flex gap-1 items-center shrink-0">
                    <div className={`rounded-lg border px-2 py-1.5 flex items-center gap-1.5 ${hasAlarm ? "border-red-500/60 bg-red-500/10" : "border-border bg-card"}`}>
                        <span className={`w-2 h-2 rounded-full shrink-0 ${hasAlarm ? "bg-red-500 animate-pulse" : "bg-[#22c55e]"}`} />
                        <div>
                            <p className="text-[8px] uppercase tracking-widest text-muted-foreground leading-none">Δ Temp</p>
                            <p className={`text-xs font-bold ${hasAlarm ? "text-red-400" : "text-[#00ffc2]"}`}>{hasAlarm ? "ALARMA" : "Normal"}</p>
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card px-2 py-1.5">
                        <p className="text-[8px] uppercase tracking-widest text-muted-foreground leading-none mb-0.5">Dev. W</p>
                        <p className={`text-sm font-bold tabular-nums ${colorDev}`}>
                            {devanadoW !== null ? devanadoW.toFixed(0) : "--"}
                            <span className="text-[10px] font-normal text-muted-foreground ml-0.5">°C</span>
                        </p>
                    </div>
                </div>

                <div className="flex gap-1 items-center shrink-0">
                    {airTags.map(([label, key, unit]) => {
                        const val = n(engine[key]);
                        const status = val !== null ? getThresholdStatus(key, val) : "normal";
                        const c = status === "critical" ? "text-red-500" : status === "warning" ? "text-yellow-400" : "text-[#00ffc2]";
                        return (
                            <div key={key} className="rounded-lg border bg-card px-2 py-1.5">
                                <p className="text-[8px] uppercase tracking-widest text-muted-foreground leading-none mb-0.5 truncate">{label}</p>
                                <p className={`text-sm font-bold tabular-nums ${c}`}>
                                    {val !== null ? val.toFixed(1) : "--"}
                                    <span className="text-[10px] font-normal text-muted-foreground ml-0.5">{unit}</span>
                                </p>
                            </div>
                        );
                    })}
                </div>

                <div className="flex-1 rounded-lg border bg-card px-3 py-1.5 flex items-center gap-4">
                    <h3 className="text-[9px] font-bold uppercase tracking-widest text-[#00ffc2] shrink-0">Actuadores</h3>
                    <div className="flex-1 grid grid-cols-3 gap-x-4">
                        <BarActuator label="Throttle"    value={n(engine["Feedback_Throttle"])}  max={100} unit="%" />
                        <BarActuator label="T. Bypass 1" value={n(engine["Feedback_TBypass_1"])} max={100} unit="%" />
                        <BarActuator label="T. Bypass 2" value={n(engine["Feedback_TBypass_2"])} max={100} unit="%" />
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 flex gap-2">

                <div className="w-72 shrink-0 flex flex-col gap-2 min-h-0">

                    <div className="shrink-0">
                        <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">
                            Temperatura Cilindros <span className="normal-case font-normal">(°C)</span>
                        </p>
                        <div className="grid grid-cols-5 gap-1">
                            {ALL_CYLS.map(num => <CylCard key={num} num={num} value={n(engine[`Tem_Cyl_${num}`])} />)}
                        </div>
                    </div>

                    <div className="flex-1 min-h-0 grid grid-cols-2 gap-1.5">
                        <div className="rounded-lg border bg-card p-2 flex flex-col min-h-0">
                            <h3 className="shrink-0 text-[9px] font-bold uppercase tracking-widest text-[#00ffc2] mb-1">Refrigeración</h3>
                            <div className="flex-1 flex flex-col justify-evenly">
                                <SectionRow label="HT Entrada" value={n(engine["Temp_Refrigerante_HT_Entrada"])?.toFixed(1) ?? "--"} unit="°C" tagName="Temp_Refrigerante_HT_Entrada" />
                                <SectionRow label="HT Salida"  value={n(engine["Temp_Refrigerante_HT_Salida"])?.toFixed(1)  ?? "--"} unit="°C" tagName="Temp_Refrigerante_HT_Salida" />
                                <SectionRow label="LT Entrada" value={n(engine["Temp_Refrigerante_LT_Entrada"])?.toFixed(1) ?? "--"} unit="°C" tagName="Temp_Refrigerante_LT_Entrada" />
                                <SectionRow label="LT Salida"  value={n(engine["Temp_Refrigerante_LT_Salida"])?.toFixed(1)  ?? "--"} unit="°C" tagName="Temp_Refrigerante_LT_Salida" />
                            </div>
                        </div>
                        <div className="rounded-lg border bg-card p-2 flex flex-col min-h-0">
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
                </div>

                <div className="flex-1 min-h-0 min-w-0 rounded-lg border bg-card p-2.5 flex flex-col">
                    <h3 className="shrink-0 text-[9px] font-bold uppercase tracking-widest text-[#00ffc2] mb-0.5">
                        Vibraciones Cilindros
                    </h3>
                    <VibTrendsChart data={hmi} historyKey="gen05_vibrations" accentColor="#00ffc2" extraShapes={GEN05_VIB_SHAPES} />
                </div>
            </div>
        </div>
    );
}
