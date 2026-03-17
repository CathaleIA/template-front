"use client";

import { TagValue } from "@/context/IoTTagsContext";

interface Props {
    knock: Record<string, TagValue>;
    mic5:  Record<string, TagValue>;
}

const n = (v?: TagValue) => v ? parseFloat(v.value) : null;

const KNOCK_WARN   = 30;
const KNOCK_DANGER = 60;
const KNOCK_MAX    = 100;

function knockColor(val: number | null) {
    if (val === null) return { bar: "bg-muted/30", text: "text-muted-foreground" };
    if (val >= KNOCK_DANGER) return { bar: "bg-red-500",     text: "text-red-400" };
    if (val >= KNOCK_WARN)   return { bar: "bg-yellow-400",  text: "text-yellow-400" };
    return { bar: "bg-[#60a5fa]", text: "text-[#60a5fa]" };
}

function KnockBar({ num, value }: { num: number; value: number | null }) {
    const pct = value !== null ? Math.min(100, (value / KNOCK_MAX) * 100) : 0;
    const { bar, text } = knockColor(value);

    return (
        <div className="flex flex-col items-center gap-1">
            <span className={`text-xs font-bold tabular-nums ${text}`}>
                {value !== null ? value.toFixed(0) : "--"}
            </span>
            {/* Vertical bar */}
            <div className="w-full flex-1 min-h-0 rounded bg-muted/20 relative overflow-hidden" style={{ height: "120px" }}>
                <div
                    className={`absolute bottom-0 left-0 right-0 rounded transition-all duration-500 ${bar}`}
                    style={{ height: `${pct}%` }}
                />
            </div>
            <span className="text-[9px] text-muted-foreground font-medium">C{num}</span>
        </div>
    );
}

export default function TabVibraciones({ knock, mic5 }: Props) {
    const speed = n(mic5["Rx_Speed"]);

    const knockData = Array.from({ length: 20 }, (_, i) => ({
        num: i + 1,
        value: n(knock[`Rx_Knc_Int_${i + 1}`]),
    }));

    const activeKnocks = knockData.filter(k => k.value !== null && k.value >= KNOCK_WARN);
    const maxKnock     = knockData.reduce((max, k) => (k.value ?? 0) > (max.value ?? 0) ? k : max, { num: 0, value: null as number | null });

    return (
        <div className="h-full flex flex-col gap-3 p-3 overflow-hidden">

            {/* Header KPIs */}
            <div className="flex gap-3 shrink-0">
                {/* Speed */}
                <div className="rounded-xl border border-[#60a5fa]/30 bg-[#60a5fa]/5 px-4 py-3 flex flex-col items-center justify-center min-w-[100px]">
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Velocidad</p>
                    <p className="text-2xl font-bold tabular-nums text-[#60a5fa]">
                        {speed !== null ? speed.toFixed(0) : "--"}
                    </p>
                    <p className="text-xs text-muted-foreground">rpm</p>
                </div>

                {/* Alertas knock */}
                <div className={`flex-1 rounded-xl border px-4 py-3 flex items-center gap-4 ${activeKnocks.length > 0 ? "border-yellow-500/40 bg-yellow-500/5" : "border-border bg-card"}`}>
                    <span className={`w-3 h-3 rounded-full shrink-0 ${activeKnocks.length > 0 ? "bg-yellow-400 animate-pulse" : "bg-[#22c55e]"}`} />
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Estado Knock</p>
                        <p className={`text-sm font-bold ${activeKnocks.length > 0 ? "text-yellow-400" : "text-[#60a5fa]"}`}>
                            {activeKnocks.length > 0
                                ? `${activeKnocks.length} cilindro(s) sobre umbral`
                                : "Normal — sin detección"}
                        </p>
                    </div>
                    {maxKnock.value !== null && maxKnock.value > 0 && (
                        <div className="ml-auto text-right">
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Máximo (Cil {maxKnock.num})</p>
                            <p className={`text-lg font-bold tabular-nums ${knockColor(maxKnock.value).text}`}>
                                {maxKnock.value.toFixed(0)}
                            </p>
                        </div>
                    )}
                </div>

                {/* Leyenda */}
                <div className="rounded-xl border bg-card px-4 py-3 flex flex-col gap-1.5 justify-center shrink-0">
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-0.5">Umbrales</p>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-2 rounded bg-[#60a5fa]" />
                        <span className="text-[10px] text-muted-foreground">Normal (&lt;{KNOCK_WARN})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-2 rounded bg-yellow-400" />
                        <span className="text-[10px] text-muted-foreground">Alerta ({KNOCK_WARN}–{KNOCK_DANGER})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-2 rounded bg-red-500" />
                        <span className="text-[10px] text-muted-foreground">Crítico (&gt;{KNOCK_DANGER})</span>
                    </div>
                </div>
            </div>

            {/* Barras de knock */}
            <div className="flex-1 min-h-0 rounded-xl border bg-card p-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#60a5fa] mb-3">
                    Intensidad Knock — 20 Cilindros
                </h3>
                <div className="grid grid-cols-20 gap-1 h-[calc(100%-28px)]" style={{ gridTemplateColumns: "repeat(20, 1fr)" }}>
                    {knockData.map(({ num, value }) => (
                        <KnockBar key={num} num={num} value={value} />
                    ))}
                </div>
            </div>
        </div>
    );
}
