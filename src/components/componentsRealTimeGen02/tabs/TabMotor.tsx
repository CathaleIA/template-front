"use client";

import { TagValue } from "@/context/IoTTagsContext";
import { getThresholdStatus } from "@/config/thresholds-v2";

interface Props {
    engine: Record<string, TagValue>;
}

const n = (v?: TagValue) => v ? parseFloat(v.value) : null;

function cylColor(val: number | null, num: number) {
    if (val === null) return "border-border bg-card text-muted-foreground";
    const status = getThresholdStatus(`Tem_Cyl_${num}`, val);
    if (status === "critical") return "border-red-500/60 bg-red-500/10 text-red-400";
    if (status === "warning")  return "border-yellow-500/60 bg-yellow-500/10 text-yellow-400";
    return "border-[#60a5fa]/30 bg-[#60a5fa]/5 text-[#60a5fa]";
}

function CylCell({ num, value }: { num: number; value: number | null }) {
    return (
        <div className={`rounded-lg border p-2 flex flex-col items-center gap-0.5 ${cylColor(value, num)}`}>
            <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Cil {num}</span>
            <span className="text-sm font-bold tabular-nums">{value !== null ? value.toFixed(0) : "--"}</span>
            <span className="text-[9px] text-muted-foreground">°C</span>
        </div>
    );
}

function TempCard({ label, value, unit = "°C", tagName }: {
    label: string; value: number | null; unit?: string; tagName?: string;
}) {
    const status = tagName && value !== null ? getThresholdStatus(tagName, value) : "normal";
    const color = status === "critical" ? "text-red-500"
        : status === "warning" ? "text-yellow-400"
        : value === null ? "text-foreground" : "text-[#60a5fa]";
    return (
        <div className="rounded-lg border bg-card px-3 py-2 flex flex-col gap-0.5">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground leading-tight">{label}</p>
            <p className={`text-base font-bold tabular-nums ${color}`}>
                {value !== null ? value.toFixed(1) : "--"}
                <span className="text-xs font-normal text-muted-foreground ml-0.5">{unit}</span>
            </p>
        </div>
    );
}

function BarIndicator({ label, value, max = 100, unit = "%" }: {
    label: string; value: number | null; max?: number; unit?: string;
}) {
    const pct = value !== null ? Math.min(100, (value / max) * 100) : 0;
    const color = pct > 90 ? "bg-red-500" : pct > 70 ? "bg-yellow-400" : "bg-[#60a5fa]";
    return (
        <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{label}</span>
                <span className="text-xs font-semibold tabular-nums text-foreground">
                    {value !== null ? value.toFixed(1) : "--"} <span className="text-muted-foreground font-normal">{unit}</span>
                </span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted/30">
                <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

export default function TabMotor({ engine }: Props) {
    const promedio = n(engine["Promedio_tem_cyl"]);
    const cylNums = [1, 3, 4, 10, 11, 17, 19, 20];

    return (
        <div className="h-full flex flex-col gap-3 p-3 overflow-hidden">

            {/* TOP: Cilindros + Promedio */}
            <div className="flex gap-3 shrink-0 items-start">
                {/* Promedio KPI */}
                <div className="rounded-xl border bg-[#60a5fa]/5 border-[#60a5fa]/30 px-4 py-3 flex flex-col items-center justify-center shrink-0 w-28">
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground text-center leading-tight">Prom. Temp Cil.</p>
                    <p className="text-2xl font-bold tabular-nums text-[#60a5fa] mt-1">
                        {promedio !== null ? promedio.toFixed(0) : "--"}
                    </p>
                    <p className="text-xs text-muted-foreground">°C</p>
                </div>

                {/* Cilindros heatmap */}
                <div className="flex-1 grid grid-cols-8 gap-1.5">
                    {cylNums.map(num => (
                        <CylCell key={num} num={num} value={n(engine[`Tem_Cyl_${num}`])} />
                    ))}
                </div>

                {/* Devanados */}
                <div className="flex flex-col gap-1.5 shrink-0">
                    {(["U", "V", "W"] as const).map(d => {
                        const val = n(engine[`Devanado_${d}`]);
                        const s = val !== null ? getThresholdStatus(`Devanado_${d}`, val) : "normal";
                        const color = s === "critical" ? "text-red-500" : s === "warning" ? "text-yellow-400" : val === null ? "text-foreground" : "text-[#60a5fa]";
                        return (
                            <div key={d} className="rounded-lg border bg-card px-3 py-1.5 min-w-[80px]">
                                <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Dev. {d}</p>
                                <p className={`text-sm font-bold tabular-nums ${color}`}>
                                    {val !== null ? val.toFixed(0) : "--"} <span className="text-xs font-normal text-muted-foreground">°C</span>
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* MIDDLE: Temperaturas del sistema */}
            <div className="shrink-0">
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1.5 px-0.5">Temperaturas Sistema</p>
                <div className="grid grid-cols-5 gap-2">
                    <TempCard label="Refrig. HT Entrada"  value={n(engine["T_HT_ENTREDA"])}      tagName="T_HT_ENTREDA" />
                    <TempCard label="Refrig. HT Salida"   value={n(engine["Tem_HT_ref_salida"])}  tagName="Tem_HT_ref_salida" />
                    <TempCard label="Refrig. LT Salida"   value={n(engine["Temp_LT_salida"])}     tagName="Temp_LT_salida" />
                    <TempCard label="Temp. Aceite"        value={n(engine["Temperatura_aceite"])} tagName="Temperatura_aceite" />
                    <TempCard label="Temp. Filtro"        value={n(engine["Tempe_filtro"])}       tagName="Tempe_filtro" />
                </div>
            </div>

            {/* BOTTOM: Presiones + Actuadores */}
            <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">

                {/* Presiones */}
                <div className="rounded-xl border bg-card p-3 flex flex-col gap-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#60a5fa] mb-1">Presiones</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            ["MAP",            "MAP",                    "mbar"],
                            ["Pres. Aceite",   "Presion_aceite",         "bar" ],
                            ["Gas Entrada",    "Pres_Gas_Entrada_Motor", "bar" ],
                        ].map(([label, key, unit]) => {
                            const val = n(engine[key as string]);
                            const s = val !== null ? getThresholdStatus(key as string, val) : "normal";
                            const color = s === "critical" ? "text-red-500"
                                : s === "warning" ? "text-yellow-400"
                                : val === null ? "text-foreground" : "text-[#60a5fa]";
                            return (
                                <div key={key as string} className="rounded-lg border bg-muted/20 px-3 py-2">
                                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground">{label as string}</p>
                                    <p className={`text-lg font-bold tabular-nums ${color}`}>
                                        {val !== null ? val.toFixed(1) : "--"}
                                        <span className="text-xs font-normal text-muted-foreground ml-0.5">{unit as string}</span>
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Actuadores */}
                <div className="rounded-xl border bg-card p-3 flex flex-col gap-3">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#60a5fa] mb-1">Actuadores</h3>
                    <BarIndicator label="Throttle (pos)"  value={n(engine["pos_throttle"])}    max={100} unit="%" />
                    <BarIndicator label="Bypass (pos)"    value={n(engine["pos_bypass"])}      max={100} unit="%" />
                    <BarIndicator label="3 Vías (fbk)"    value={n(engine["feedback_3_vias"])} max={100} unit="%" />
                    <BarIndicator label="Mando Mixer"     value={n(engine["MandoMixer"])}      max={100} unit="%" />
                </div>
            </div>
        </div>
    );
}
