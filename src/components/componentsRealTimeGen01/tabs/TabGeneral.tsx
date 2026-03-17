"use client";

import { TagValue } from "@/context/IoTTagsContext";
import HalfGauge from "../shared/HalfGauge";
import KpiCard from "../shared/KpiCard";

interface Props {
    agc: Record<string, TagValue>;
}

const n = (v?: TagValue) => v ? parseFloat(v.value) : null;
const fmt = (v?: TagValue, dec = 1) => {
    const val = n(v);
    return val !== null ? val.toFixed(dec) : "--";
};

function ElecRow({ label, value, unit }: { label: string; value: string; unit: string }) {
    return (
        <div className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-xs font-semibold tabular-nums text-foreground">
                {value} <span className="text-muted-foreground font-normal">{unit}</span>
            </span>
        </div>
    );
}

export default function TabGeneral({ agc }: Props) {
    const rpm = n(agc["RPM"]);
    const freq = n(agc["Generator_frequency_L1"]);

    return (
        <div className="h-full flex flex-col gap-3 p-3 overflow-hidden">
            {/* TOP ROW: Gauges + KPIs */}
            <div className="flex gap-3 items-start shrink-0">
                {/* RPM gauge */}
                <div className="w-36 shrink-0">
                    <HalfGauge label="RPM" value={rpm} unit="rpm"
                        min={0} max={2000} warning={1700} danger={1900} size="sm" />
                </div>
                {/* Freq gauge */}
                <div className="w-36 shrink-0">
                    <HalfGauge label="Frecuencia" value={freq !== null ? freq / 100 : null}
                        unit="Hz" min={55} max={65} warning={59} danger={61} size="sm" />
                </div>
                {/* KPI cards */}
                <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-2">
                    <KpiCard label="Pot. Activa" value={n(agc["Generator_active_power"])} unit="kW" />
                    <KpiCard label="Pot. Reactiva" value={n(agc["Generator_reactive_power"])} unit="kVAr" />
                    <KpiCard label="Pot. Aparente" value={n(agc["Generator_apparent_power"])} unit="kVA" />
                    <KpiCard label="Factor Potencia" value={n(agc["Generator_PF"])} unit="" />
                    <KpiCard label="Batería" value={n(agc["VDCbattery"])} unit="VDC" size="sm" />
                    <KpiCard label="Energía Exp." value={n(agc["EnergiaExp"])} unit="kWh" size="sm" />
                    <KpiCard label="Reactiva Exp." value={n(agc["ReactivaExp"])} unit="kVArh" size="sm" />
                    <KpiCard label="FreqEscale" value={n(agc["FreqEscale"])} unit="" size="sm" />
                </div>
            </div>

            {/* BOTTOM: Generator + Busbar tables */}
            <div className="flex-1 grid grid-cols-2 gap-3 min-h-0 overflow-hidden">
                {/* GENERADOR */}
                <div className="rounded-lg border bg-card p-3 overflow-y-auto">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#00ffc2] mb-2">
                        Generador
                    </h3>
                    <div className="grid grid-cols-2 gap-x-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Voltajes L-L</p>
                            <ElecRow label="V L1-L2" value={fmt(agc["Generator_voltage_L1_L2"], 0)} unit="V" />
                            <ElecRow label="V L2-L3" value={fmt(agc["Generator_voltage_L2_L3"], 0)} unit="V" />
                            <ElecRow label="V L3-L1" value={fmt(agc["Generator_voltage_L3_L1"], 0)} unit="V" />
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2 mb-1">Voltajes L-N</p>
                            <ElecRow label="V L1-N" value={fmt(agc["Generator_voltage_L1_N"], 0)} unit="V" />
                            <ElecRow label="V L2-N" value={fmt(agc["Generator_voltage_L2_N"], 0)} unit="V" />
                            <ElecRow label="V L3-N" value={fmt(agc["Generator_voltage_L3_N"], 0)} unit="V" />
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2 mb-1">Ángulos de fase</p>
                            <ElecRow label="A L2-L3" value={fmt(agc["Generator_voltage_phase_angle_L2_L3"], 1)} unit="°" />
                            <ElecRow label="A L3-L1" value={fmt(agc["Generator_voltage_phase_angle_L3_L1"], 1)} unit="°" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Corrientes</p>
                            <ElecRow label="I L1" value={fmt(agc["Generator_current_L1"], 0)} unit="A" />
                            <ElecRow label="I L2" value={fmt(agc["Generator_current_L2"], 0)} unit="A" />
                            <ElecRow label="I L3" value={fmt(agc["Generator_current_L3"], 0)} unit="A" />
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2 mb-1">Potencias por fase</p>
                            <ElecRow label="P L1" value={fmt(agc["Generator_active_power_L1"], 0)} unit="kW" />
                            <ElecRow label="P L2" value={fmt(agc["Generator_active_power_L2"], 0)} unit="kW" />
                            <ElecRow label="P L3" value={fmt(agc["Generator_active_power_L3"], 0)} unit="kW" />
                            <ElecRow label="Q L1" value={fmt(agc["Generator_reactive_power_L1"], 0)} unit="kVAr" />
                            <ElecRow label="Q L2" value={fmt(agc["Generator_reactive_power_L2"], 0)} unit="kVAr" />
                            <ElecRow label="Q L3" value={fmt(agc["Generator_reactive_power_L3"], 0)} unit="kVAr" />
                        </div>
                    </div>
                </div>

                {/* BARRA */}
                <div className="rounded-lg border bg-card p-3 overflow-y-auto">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#72bfaf] mb-2">
                        Barra (BusB)
                    </h3>
                    <div className="grid grid-cols-2 gap-x-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Voltajes L-L</p>
                            <ElecRow label="V L1-L2" value={fmt(agc["BusB_voltage_L1_L2"], 0)} unit="V" />
                            <ElecRow label="V L2-L3" value={fmt(agc["BusB_voltage_L2_L3"], 0)} unit="V" />
                            <ElecRow label="V L3-L1" value={fmt(agc["BusB_voltage_L3_L1"], 0)} unit="V" />
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2 mb-1">Voltajes L-N</p>
                            <ElecRow label="V L1-N" value={fmt(agc["BusB_voltage_L1_N"], 0)} unit="V" />
                            <ElecRow label="V L2-N" value={fmt(agc["BusB_voltage_L2_N"], 0)} unit="V" />
                            <ElecRow label="V L3-N" value={fmt(agc["BusB_voltage_L3_N"], 0)} unit="V" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Frecuencias</p>
                            <ElecRow label="F L1" value={fmt(agc["BusB_frequency_L1"], 0)} unit="×10⁻² Hz" />
                            <ElecRow label="F L2" value={fmt(agc["BusB_frequency_L2"], 0)} unit="×10⁻² Hz" />
                            <ElecRow label="F L3" value={fmt(agc["BusB_frequency_L3"], 0)} unit="×10⁻² Hz" />
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2 mb-1">Ángulos de fase</p>
                            <ElecRow label="A L1-L2" value={fmt(agc["BusB_voltage_phase_angle_L1_L2"], 1)} unit="°" />
                            <ElecRow label="A L2-L3" value={fmt(agc["BusB_voltage_phase_angle_L2_L3"], 1)} unit="°" />
                            <ElecRow label="A L3-L1" value={fmt(agc["BusB_voltage_phase_angle_L3_L1"], 1)} unit="°" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
