"use client";

import { TagValue } from "@/context/IoTTagsContext";

interface Props {
    hmi: Record<string, TagValue>;
}

const n = (v?: TagValue) => v ? parseFloat(v.value) : null;

const VIB_WARN = 5;
const VIB_DANGER = 10;

function vibColor(val: number | null) {
    if (val === null) return "border-border bg-card text-muted-foreground";
    if (val >= VIB_DANGER) return "border-red-500/60 bg-red-500/10 text-red-400";
    if (val >= VIB_WARN) return "border-yellow-500/60 bg-yellow-500/10 text-yellow-400";
    return "border-[#00ffc2]/30 bg-[#00ffc2]/5 text-[#00ffc2]";
}

function VibCard({ num, value }: { num: number; value: number | null }) {
    return (
        <div className={`rounded-lg border p-2 flex flex-col items-center gap-0.5 ${vibColor(value)}`}>
            <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                Cil {num}
            </span>
            <span className="text-sm font-bold tabular-nums">
                {value !== null ? value.toFixed(2) : "--"}
            </span>
            <span className="text-[9px] text-muted-foreground">mm/s</span>
        </div>
    );
}

function VoltCard({ label, value }: { label: string; value: number | null }) {
    return (
        <div className="rounded border bg-card p-1.5 flex flex-col items-center gap-0.5">
            <span className="text-[8px] uppercase tracking-widest text-muted-foreground">{label}</span>
            <span className="text-xs font-bold tabular-nums text-foreground">
                {value !== null ? value.toFixed(0) : "--"}
            </span>
            <span className="text-[8px] text-muted-foreground">V</span>
        </div>
    );
}

export default function TabVibraciones({ hmi }: Props) {
    const vibs = Array.from({ length: 20 }, (_, i) => ({
        num: i + 1,
        value: n(hmi[`rVib_Cil_${i + 1}`]),
    }));

    const voltsA = Array.from({ length: 10 }, (_, i) => ({
        label: `A${i + 1}`,
        value: n(hmi[`rVolt_Bob_A${i + 1}`]),
    }));
    const voltsB = Array.from({ length: 10 }, (_, i) => ({
        label: `B${i + 1}`,
        value: n(hmi[`rVolt_Bob_B${i + 1}`]),
    }));

    return (
        <div className="h-full flex flex-col gap-3 p-3 overflow-hidden">
            {/* Legend */}
            <div className="flex gap-4 shrink-0 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" /> Normal (&lt;{VIB_WARN} mm/s)
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> Atención ({VIB_WARN}–{VIB_DANGER} mm/s)
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Alarma (&gt;{VIB_DANGER} mm/s)
                </span>
            </div>

            {/* Vibrations grid 2×10 */}
            <div className="flex-1 min-h-0">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#72bfaf] mb-1.5">
                    Vibraciones Cilindros
                </h3>
                <div className="grid grid-cols-10 gap-1.5">
                    {vibs.map(({ num, value }) => (
                        <VibCard key={num} num={num} value={value} />
                    ))}
                </div>
            </div>

            {/* Coil voltages */}
            <div className="shrink-0">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#72bfaf] mb-1.5">
                    Voltajes de Bobinas
                </h3>
                <div className="grid grid-cols-10 gap-1 mb-1">
                    {voltsA.map(({ label, value }) => (
                        <VoltCard key={label} label={label} value={value} />
                    ))}
                </div>
                <div className="grid grid-cols-10 gap-1">
                    {voltsB.map(({ label, value }) => (
                        <VoltCard key={label} label={label} value={value} />
                    ))}
                </div>
            </div>
        </div>
    );
}
