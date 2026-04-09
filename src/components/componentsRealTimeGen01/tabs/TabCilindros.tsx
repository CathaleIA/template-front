"use client";

import { TagValue } from "@/context/IoTTagsContext";
import { getThresholdStatus } from "@/config/thresholds-v2";
import HalfGauge from "../shared/HalfGauge";

interface Props {
    engine: Record<string, TagValue>;
    alarmas: Record<string, TagValue>;
}

const n = (v?: TagValue) => v ? parseFloat(v.value) : null;

function cylColor(val: number | null, num: number) {
    if (val === null) return "border-border bg-card text-muted-foreground";
    const status = getThresholdStatus(`Tem_Cyl_${num}`, val);
    if (status === "critical") return "border-red-500/60 bg-red-500/10 text-red-400";
    if (status === "warning")  return "border-yellow-500/60 bg-yellow-500/10 text-yellow-400";
    return "border-[#00ffc2]/30 bg-[#00ffc2]/5 text-[#00ffc2]";
}

function CylCard({ num, value }: { num: number; value: number | null }) {
    return (
        <div className={`rounded-lg border p-2 flex flex-col items-center gap-0.5 ${cylColor(value, num)}`}>
            <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                Cil {num}
            </span>
            <span className="text-sm font-bold tabular-nums">
                {value !== null ? value.toFixed(0) : "--"}
            </span>
            <span className="text-[9px] text-muted-foreground">°C</span>
        </div>
    );
}

export default function TabCilindros({ engine, alarmas }: Props) {
    const promedio = n(engine["Promedio_tem_cyl"]);
    const delta = n(engine["delta_temp_cylinders"]);
    const warning = alarmas["Warning_delta_temp"]?.value;
    const hasAlarm = warning === "true" || warning === "1";

    const cylinders = Array.from({ length: 20 }, (_, i) => ({
        num: i + 1,
        value: n(engine[`Tem_Cyl_${i + 1}`]),
    }));

    return (
        <div className="h-full flex flex-col gap-3 p-3 overflow-hidden">
            {/* TOP: KPIs + alarm */}
            <div className="flex gap-3 items-start shrink-0">
                <div className="w-36 shrink-0">
                    <HalfGauge label="Prom. Temp Cil." value={promedio}
                        unit="°C" min={400} max={650} warning={580} danger={610} size="sm" />
                </div>
                <div className="w-36 shrink-0">
                    <HalfGauge label="Delta Temp Cil." value={delta}
                        unit="°C" min={0} max={80} warning={30} danger={50} size="sm" />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                    <div className={`rounded-lg border px-4 py-3 flex items-center gap-3 ${hasAlarm ? "border-red-500/60 bg-red-500/10" : "border-border bg-card"}`}>
                        <span className={`w-3 h-3 rounded-full shrink-0 ${hasAlarm ? "bg-red-500 animate-pulse" : "bg-[#22c55e]"}`} />
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Warning Delta Temp</p>
                            <p className={`text-sm font-bold ${hasAlarm ? "text-red-400" : "text-[#00ffc2]"}`}>
                                {hasAlarm ? "ALARMA ACTIVA" : "Normal"}
                            </p>
                        </div>
                    </div>
                    {/* Winding temps */}
                    <div className="grid grid-cols-3 gap-2">
                        {[["Devanado U", "Devanado_U"], ["Devanado V", "Devanado_V"], ["Devanado W", "Devanado_W"]].map(([label, key]) => {
                            const val = n(engine[key]);
                            const s = val !== null ? getThresholdStatus(key, val) : "normal";
                            const color = s === "critical" ? "text-red-500" : s === "warning" ? "text-yellow-400" : val === null ? "text-foreground" : "text-[#00ffc2]";
                            return (
                                <div key={key} className="rounded-lg border bg-card px-2 py-1.5">
                                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</p>
                                    <p className={`text-base font-bold tabular-nums ${color}`}>
                                        {val !== null ? val.toFixed(0) : "--"} <span className="text-xs font-normal text-muted-foreground">°C</span>
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Cylinder grid */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <div className="grid grid-cols-10 gap-1.5 h-full content-start">
                    {cylinders.map(({ num, value }) => (
                        <CylCard key={num} num={num} value={value} />
                    ))}
                </div>
            </div>

            {/* Bottom: extra temps */}
            <div className="shrink-0 grid grid-cols-4 gap-2">
                {[
                    ["MAT", "MAT", "°C"],
                    ["T. Gas Entrada", "Temp_Gas_Entrada", "°C"],
                    ["T. Aire Blower", "Temp_Aire_Blower", "°C"],
                    ["T. Aire Filtro", "Temp_Aire_Filtro_Motor", "°C"],
                ].map(([label, key, unit]) => {
                    const val = n(engine[key]);
                    const s = val !== null ? getThresholdStatus(key, val) : "normal";
                    const color = s === "critical" ? "text-red-500" : s === "warning" ? "text-yellow-400" : "text-foreground";
                    return (
                        <div key={key} className="rounded-lg border bg-card px-3 py-2">
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</p>
                            <p className={`text-lg font-bold tabular-nums ${color}`}>
                                {val !== null ? val.toFixed(1) : "--"} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
