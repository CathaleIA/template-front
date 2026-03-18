"use client";

import { TagValue } from "@/context/IoTTagsContext";
import { getThresholdStatus } from "@/config/thresholds-v2";
import HalfGauge from "@/components/componentsRealTimeGen01/shared/HalfGauge";

interface Props {
    gd: Record<string, TagValue>;
}

const n = (v?: TagValue) => v ? parseFloat(v.value) : null;
const fmt = (v?: TagValue, dec = 1) => {
    const val = n(v);
    return val !== null ? val.toFixed(dec) : "--";
};

const STATUS_TEXT: Record<string, string> = {
    critical: "text-red-500",
    warning:  "text-yellow-400",
    info:     "text-blue-400",
    normal:   "text-foreground",
};

function StatRow({ label, value, unit, tagName }: { label: string; value: string; unit: string; tagName?: string }) {
    const numVal = parseFloat(value);
    const status = tagName && !isNaN(numVal) ? getThresholdStatus(tagName, numVal) : "normal";
    return (
        <div className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className={`text-xs font-semibold tabular-nums ${STATUS_TEXT[status]}`}>
                {value} <span className="text-muted-foreground font-normal">{unit}</span>
            </span>
        </div>
    );
}

function BigKpi({ label, value, unit, tagName }: { label: string; value: string; unit: string; tagName?: string }) {
    const numVal = parseFloat(value);
    const status = tagName && !isNaN(numVal) ? getThresholdStatus(tagName, numVal) : "normal";
    const color = status === "critical" ? "text-red-500"
        : status === "warning" ? "text-yellow-400"
        : "text-[#60a5fa]";
    const border = status === "critical" ? "border-red-500/40 bg-red-500/5"
        : status === "warning" ? "border-yellow-400/40 bg-yellow-400/5"
        : "border-[#60a5fa]/40 bg-[#60a5fa]/5";
    return (
        <div className={`rounded-xl border p-3 flex flex-col gap-1 ${tagName ? border : "bg-card"}`}>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
            <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold tabular-nums ${color}`}>{value}</span>
                <span className="text-xs text-muted-foreground">{unit}</span>
            </div>
        </div>
    );
}

export default function TabElectrico({ gd }: Props) {
    const rpm  = n(gd["RPM"]);
    const freq = n(gd["Generator_frequency_L1"]);

    return (
        <div className="h-full flex flex-col gap-3 p-3 overflow-hidden">

            {/* TOP: KPIs principales */}
            <div className="grid grid-cols-5 gap-2 shrink-0">
                <BigKpi label="Potencia Activa"    value={fmt(gd["Potencia_Generador"], 0)}       unit="kW"   tagName="Potencia_Generador" />
                <BigKpi label="Pot. Reactiva"      value={fmt(gd["Generator_reactive_power"], 0)} unit="kVAr" tagName="Generator_reactive_power" />
                <BigKpi label="Pot. Aparente"      value={fmt(gd["Generator_apparent_power"], 0)} unit="kVA"  tagName="Generator_apparent_power" />
                <BigKpi label="Factor de Potencia" value={fmt(gd["Generator_PF"], 3)}             unit=""     tagName="Generator_PF" />
                <BigKpi label="Energía Exportada"  value={fmt(gd["EnergiaExp"], 0)}               unit="kWh" />
            </div>

            {/* MIDDLE: Gauges + tablas */}
            <div className="flex-1 grid grid-cols-3 gap-3 min-h-0 overflow-hidden">

                {/* Gauges */}
                <div className="flex flex-col gap-3 items-center justify-center rounded-xl border bg-card p-3">
                    <HalfGauge label="RPM" value={rpm} unit="rpm"
                        min={0} max={2000} warning={1700} danger={1900} size="md" />
                    <HalfGauge label="Frecuencia" value={freq !== null ? freq / 100 : null}
                        unit="Hz" min={55} max={65} warning={59} danger={61} size="md" />
                </div>

                {/* Generador tabla */}
                <div className="rounded-xl border bg-card p-3 overflow-y-auto">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#60a5fa] mb-2">Generador</h3>
                    <div className="grid grid-cols-2 gap-x-4">
                        <div>
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Voltajes L-L</p>
                            <StatRow label="V L1-L2" value={fmt(gd["Generator_voltage_L1_L2"], 0)} unit="V" tagName="Generator_voltage_L1_L2" />
                            <StatRow label="V L2-L3" value={fmt(gd["Generator_voltage_L2_L3"], 0)} unit="V" tagName="Generator_voltage_L2_L3" />
                            <StatRow label="V L3-L1" value={fmt(gd["Generator_voltage_L3_L1"], 0)} unit="V" tagName="Generator_voltage_L3_L1" />
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mt-2 mb-1">Voltajes L-N</p>
                            <StatRow label="V L1-N" value={fmt(gd["Generator_voltage_L1_N"], 0)} unit="V" tagName="Generator_voltage_L1_N" />
                            <StatRow label="V L2-N" value={fmt(gd["Generator_voltage_L2_N"], 0)} unit="V" tagName="Generator_voltage_L2_N" />
                            <StatRow label="V L3-N" value={fmt(gd["Generator_voltage_L3_N"], 0)} unit="V" tagName="Generator_voltage_L3_N" />
                        </div>
                        <div>
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Corrientes</p>
                            <StatRow label="I L1" value={fmt(gd["Generator_current_L1"], 0)} unit="A" tagName="Generator_current_L1" />
                            <StatRow label="I L2" value={fmt(gd["Generator_current_L2"], 0)} unit="A" tagName="Generator_current_L2" />
                            <StatRow label="I L3" value={fmt(gd["Generator_current_L3"], 0)} unit="A" tagName="Generator_current_L3" />
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mt-2 mb-1">Potencias/fase</p>
                            <StatRow label="P L1" value={fmt(gd["Generator_power_L1"], 0)} unit="kW" tagName="Generator_power_L1" />
                            <StatRow label="P L2" value={fmt(gd["Generator_power_L2"], 0)} unit="kW" tagName="Generator_power_L2" />
                            <StatRow label="P L3" value={fmt(gd["Generator_power_L3"], 0)} unit="kW" tagName="Generator_power_L3" />
                            <StatRow label="Q L1" value={fmt(gd["Generator_reactive_power_L1"], 0)} unit="kVAr" tagName="Generator_reactive_power_L1" />
                            <StatRow label="Q L2" value={fmt(gd["Generator_reactive_power_L2"], 0)} unit="kVAr" tagName="Generator_reactive_power_L2" />
                            <StatRow label="Q L3" value={fmt(gd["Generator_reactive_power_L3"], 0)} unit="kVAr" tagName="Generator_reactive_power_L3" />
                        </div>
                    </div>
                </div>

                {/* BusB tabla */}
                <div className="rounded-xl border bg-card p-3 overflow-y-auto">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#93c5fd] mb-2">Barra (Bus B)</h3>
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Voltajes L-L</p>
                    <StatRow label="V L1-L2" value={fmt(gd["Bus_B_voltage_L1_L2"], 0)} unit="V" tagName="Bus_B_voltage_L1_L2" />
                    <StatRow label="V L2-L3" value={fmt(gd["Bus_B_voltage_L2_L3"], 0)} unit="V" tagName="Bus_B_voltage_L2_L3" />
                    <StatRow label="V L3-L1" value={fmt(gd["Bus_B_voltage_L3_L1"], 0)} unit="V" tagName="Bus_B_voltage_L3_L1" />
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground mt-2 mb-1">Frecuencias</p>
                    <StatRow label="F L1" value={fmt(gd["Bus_B_frequency_L1"], 1)} unit="Hz" tagName="Bus_B_frequency_L1" />
                    <StatRow label="F L2" value={fmt(gd["Bus_B_frequency_L2"], 1)} unit="Hz" tagName="Bus_B_frequency_L2" />
                    <StatRow label="F L3" value={fmt(gd["Bus_B_frequency_L3"], 1)} unit="Hz" tagName="Bus_B_frequency_L3" />
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground mt-2 mb-1">Potencias aparentes/fase</p>
                    <StatRow label="S L1" value={fmt(gd["Generator_apparent_power_L1"], 0)} unit="kVA" tagName="Generator_apparent_power_L1" />
                    <StatRow label="S L2" value={fmt(gd["Generator_apparent_power_L2"], 0)} unit="kVA" tagName="Generator_apparent_power_L2" />
                    <StatRow label="S L3" value={fmt(gd["Generator_apparent_power_L3"], 0)} unit="kVA" tagName="Generator_apparent_power_L3" />
                </div>
            </div>
        </div>
    );
}
