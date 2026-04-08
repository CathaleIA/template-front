"use client";

import { TagValue } from "@/context/IoTTagsContext";
import { getThresholdStatus } from "@/config/thresholds-v2";

interface Props {
    mic5: Record<string, TagValue>;
}

const n = (v?: TagValue) => v ? parseFloat(v.value) : null;

function bobColor(val: number | null, tagName: string) {
    if (val === null) return "border-border bg-card text-muted-foreground";
    const status = getThresholdStatus(tagName, val);
    if (status === "critical") return "border-red-500/60 bg-red-500/10 text-red-400";
    if (status === "warning")  return "border-yellow-500/60 bg-yellow-500/10 text-yellow-400";
    return "border-[#60a5fa]/30 bg-[#60a5fa]/5 text-[#60a5fa]";
}

function BobinaCard({ id, value, tagName }: { id: string; value: number | null; tagName: string }) {
    return (
        <div className={`rounded-lg border p-2 flex flex-col items-center gap-0.5 ${bobColor(value, tagName)}`}>
            <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">{id}</span>
            <span className="text-sm font-bold tabular-nums">{value !== null ? value.toFixed(1) : "--"}</span>
            <span className="text-[9px] text-muted-foreground">kV</span>
        </div>
    );
}

function MiniBarChart({ data, label }: { data: { id: string; value: number | null }[]; label: string }) {
    const max = Math.max(...data.map(d => d.value ?? 0), 1);
    return (
        <div className="rounded-xl border bg-card p-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#60a5fa] mb-3">{label}</h3>
            <div className="flex items-end gap-1 h-16">
                {data.map(({ id, value }) => {
                    const pct = value !== null ? (value / max) * 100 : 0;
                    const tagKey = `Rx_Est_Sec_Volt_${id}`;
                    const s = value !== null ? getThresholdStatus(tagKey, value) : "normal";
                    const color = value === null ? "bg-muted/20"
                        : s === "critical" ? "bg-red-500"
                        : s === "warning"  ? "bg-yellow-400"
                        : "bg-[#60a5fa]";
                    return (
                        <div key={id} className="flex-1 flex flex-col items-center gap-0.5">
                            <div className="w-full bg-muted/20 rounded-sm relative" style={{ height: "48px" }}>
                                <div
                                    className={`absolute bottom-0 left-0 right-0 rounded-sm transition-all ${color}`}
                                    style={{ height: `${pct}%` }}
                                />
                            </div>
                            <span className="text-[8px] text-muted-foreground">{id.replace("A", "").replace("B", "")}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function TabBobinas({ mic5 }: Props) {
    const speed = n(mic5["Rx_Speed"]);

    const grupoA = Array.from({ length: 10 }, (_, i) => ({
        id: `A${i + 1}`,
        value: n(mic5[`Rx_Est_Sec_Volt_A${i + 1}`]),
    }));

    const grupoB = Array.from({ length: 10 }, (_, i) => ({
        id: `B${i + 1}`,
        value: n(mic5[`Rx_Est_Sec_Volt_B${i + 1}`]),
    }));

    const allVals = [...grupoA, ...grupoB].map(d => d.value).filter(v => v !== null) as number[];
    const maxVal  = allVals.length ? Math.max(...allVals) : null;
    const minVal  = allVals.length ? Math.min(...allVals) : null;
    const avgVal  = allVals.length ? allVals.reduce((s, v) => s + v, 0) / allVals.length : null;

    return (
        <div className="h-full flex flex-col gap-3 p-3 overflow-hidden">

            {/* Header stats */}
            <div className="grid grid-cols-4 gap-2 shrink-0">
                {[
                    ["Velocidad (MIC5)", speed, "rpm"],
                    ["Voltaje Máx.",     maxVal, "kV"],
                    ["Voltaje Mín.",     minVal, "kV"],
                    ["Voltaje Prom.",    avgVal, "kV"],
                ].map(([label, val, unit]) => (
                    <div key={label as string} className="rounded-xl border bg-card px-3 py-2">
                        <p className="text-[9px] uppercase tracking-widest text-muted-foreground">{label as string}</p>
                        <p className="text-lg font-bold tabular-nums text-[#60a5fa]">
                            {(val as number | null) !== null ? (val as number).toFixed(1) : "--"}
                            <span className="text-xs font-normal text-muted-foreground ml-0.5">{unit as string}</span>
                        </p>
                    </div>
                ))}
            </div>

            {/* Grids A y B */}
            <div className="flex-1 grid grid-rows-2 gap-3 min-h-0">

                {/* Grupo A */}
                <div className="rounded-xl border bg-card p-3 flex flex-col gap-2 overflow-hidden">
                    <div className="flex items-center justify-between shrink-0">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#60a5fa]">Grupo A — Bobinas Secundarias</h3>
                        <span className="text-[9px] text-muted-foreground">A1 – A10</span>
                    </div>
                    <div className="grid grid-cols-10 gap-1.5 flex-1">
                        {grupoA.map(({ id, value }) => (
                            <BobinaCard key={id} id={id} value={value} tagName={`Rx_Est_Sec_Volt_${id}`} />
                        ))}
                    </div>
                </div>

                {/* Grupo B */}
                <div className="rounded-xl border bg-card p-3 flex flex-col gap-2 overflow-hidden">
                    <div className="flex items-center justify-between shrink-0">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#93c5fd]">Grupo B — Bobinas Secundarias</h3>
                        <span className="text-[9px] text-muted-foreground">B1 – B10</span>
                    </div>
                    <div className="grid grid-cols-10 gap-1.5 flex-1">
                        {grupoB.map(({ id, value }) => (
                            <BobinaCard key={id} id={id} value={value} tagName={`Rx_Est_Sec_Volt_${id}`} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Charts comparativos */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
                <MiniBarChart data={grupoA} label="Comparativo Grupo A" />
                <MiniBarChart data={grupoB} label="Comparativo Grupo B" />
            </div>
        </div>
    );
}
