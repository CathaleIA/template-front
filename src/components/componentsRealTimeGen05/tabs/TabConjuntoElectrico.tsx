"use client";

import { TagValue } from "@/context/IoTTagsContext";
import { getThresholdStatus } from "@/config/thresholds-v2";

interface Props {
    agc: Record<string, TagValue>;
    hmi: Record<string, TagValue>;
}

const n = (v?: TagValue) => (v ? parseFloat(v.value) : null);
const fmt = (v?: TagValue, dec = 0) => {
    const val = n(v);
    return val !== null ? val.toFixed(dec) : "--";
};

const COLOR_MAP: Record<string, string> = {
    critical: "text-red-500",
    warning:  "text-yellow-400",
    info:     "text-blue-400",
    normal:   "text-[#00ffc2]",
};

function ElecRow({ label, value, unit, tagName }: { label: string; value: string; unit: string; tagName?: string }) {
    const numVal = parseFloat(value);
    const status = tagName && !isNaN(numVal) ? getThresholdStatus(tagName, numVal) : "normal";
    return (
        <div className="flex items-center justify-between py-1 border-b border-border/40 last:border-0">
            <span className="text-xs text-muted-foreground truncate mr-2">{label}</span>
            <span className={`text-xs font-semibold tabular-nums whitespace-nowrap ${COLOR_MAP[status] ?? "text-foreground"}`}>
                {value} <span className="text-muted-foreground font-normal">{unit}</span>
            </span>
        </div>
    );
}

function BigKpi({ label, value, unit, tagName }: { label: string; value: string; unit: string; tagName?: string }) {
    const numVal = parseFloat(value);
    const status = tagName && !isNaN(numVal) ? getThresholdStatus(tagName, numVal) : "normal";
    const color = COLOR_MAP[status] ?? "text-[#00ffc2]";
    const border = status === "critical" ? "border-red-500/40 bg-red-500/5" : status === "warning" ? "border-yellow-400/40 bg-yellow-400/5" : "border-[#00ffc2]/30 bg-[#00ffc2]/5";
    return (
        <div className={`rounded-xl border p-3 flex flex-col gap-1 ${border}`}>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground leading-tight truncate">{label}</p>
            <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold tabular-nums ${color}`}>{value}</span>
                <span className="text-xs text-muted-foreground">{unit}</span>
            </div>
        </div>
    );
}

function BobinaCard({ id, value, tagName }: { id: string; value: number | null; tagName: string }) {
    const status = value !== null ? getThresholdStatus(tagName, value) : "normal";
    const border = status === "critical" ? "border-red-500/60 bg-red-500/10 text-red-400"
        : status === "warning" ? "border-yellow-500/60 bg-yellow-500/10 text-yellow-400"
        : value === null ? "border-border bg-card text-muted-foreground"
        : "border-[#00ffc2]/30 bg-[#00ffc2]/5 text-[#00ffc2]";
    return (
        <div className={`rounded-lg border p-1.5 flex flex-col items-center gap-0 ${border}`}>
            <span className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">{id}</span>
            <span className="text-sm font-bold tabular-nums leading-tight">{value !== null ? value.toFixed(1) : "--"}</span>
            <span className="text-[8px] text-muted-foreground">V</span>
        </div>
    );
}

export default function TabConjuntoElectrico({ agc, hmi }: Props) {
    const iL1 = n(agc["Generator_current_L1"]);
    const iL2 = n(agc["Generator_current_L2"]);
    const iL3 = n(agc["Generator_current_L3"]);
    const iMax = [iL1, iL2, iL3].filter((v) => v !== null).reduce((a, b) => Math.max(a!, b!), null as number | null);
    const iMaxStr = iMax !== null ? iMax.toFixed(0) : "--";

    const busbFreqRaw = n(agc["BusB_frequency_L1"]);
    const busbFreqHz = busbFreqRaw !== null ? (busbFreqRaw / 100).toFixed(2) : "--";

    const bobA = Array.from({ length: 10 }, (_, i) => ({ id: `A${i + 1}`, key: `rVolt_Bob_A${i + 1}`, value: n(hmi[`rVolt_Bob_A${i + 1}`]) }));
    const bobB = Array.from({ length: 10 }, (_, i) => ({ id: `B${i + 1}`, key: `rVolt_Bob_B${i + 1}`, value: n(hmi[`rVolt_Bob_B${i + 1}`]) }));

    return (
        <div className="h-full flex flex-col gap-2 p-3 overflow-hidden">
            <div className="grid grid-cols-4 gap-2 shrink-0">
                <BigKpi label="Corriente Máx. (L1/L2/L3)" value={iMaxStr} unit="A" tagName="Generator_current_L1" />
                <BigKpi label="Factor Potencia" value={fmt(agc["Generator_PF"], 3)} unit="" tagName="Generator_PF" />
                <BigKpi label="Frecuencia Bus B" value={busbFreqHz} unit="Hz" />
                <BigKpi label="Energía Exportada" value={fmt(agc["EnergiaExp"], 0)} unit="kWh" tagName="EnergiaExp" />
            </div>

            <div className="flex-1 grid grid-cols-2 gap-3 min-h-0 overflow-hidden">
                <div className="rounded-lg border bg-card p-3 flex flex-col min-h-0">
                    <h3 className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-[#00ffc2] mb-1">Generador</h3>
                    <div className="flex-1 grid grid-cols-2 gap-x-4 min-h-0">
                        <div className="flex flex-col min-h-0">
                            <p className="shrink-0 text-[9px] uppercase tracking-widest text-muted-foreground mb-0.5">Voltajes L-L</p>
                            <div className="flex-1 flex flex-col justify-evenly">
                                <ElecRow label="V L1-L2" value={fmt(agc["Generator_voltage_L1_L2"])} unit="V" tagName="Generator_voltage_L1_L2" />
                                <ElecRow label="V L2-L3" value={fmt(agc["Generator_voltage_L2_L3"])} unit="V" tagName="Generator_voltage_L2_L3" />
                                <ElecRow label="V L3-L1" value={fmt(agc["Generator_voltage_L3_L1"])} unit="V" tagName="Generator_voltage_L3_L1" />
                            </div>
                            <p className="shrink-0 text-[9px] uppercase tracking-widest text-muted-foreground mt-1 mb-0.5">Voltajes L-N</p>
                            <div className="flex-1 flex flex-col justify-evenly">
                                <ElecRow label="V L1-N" value={fmt(agc["Generator_voltage_L1_N"])} unit="V" tagName="Generator_voltage_L1_N" />
                                <ElecRow label="V L2-N" value={fmt(agc["Generator_voltage_L2_N"])} unit="V" tagName="Generator_voltage_L2_N" />
                                <ElecRow label="V L3-N" value={fmt(agc["Generator_voltage_L3_N"])} unit="V" tagName="Generator_voltage_L3_N" />
                            </div>
                            <p className="shrink-0 text-[9px] uppercase tracking-widest text-muted-foreground mt-1 mb-0.5">Corrientes</p>
                            <div className="flex-1 flex flex-col justify-evenly">
                                <ElecRow label="I L1" value={fmt(agc["Generator_current_L1"])} unit="A" tagName="Generator_current_L1" />
                                <ElecRow label="I L2" value={fmt(agc["Generator_current_L2"])} unit="A" tagName="Generator_current_L2" />
                                <ElecRow label="I L3" value={fmt(agc["Generator_current_L3"])} unit="A" tagName="Generator_current_L3" />
                            </div>
                        </div>
                        <div className="flex flex-col min-h-0">
                            <p className="shrink-0 text-[9px] uppercase tracking-widest text-muted-foreground mb-0.5">Potencias Activas/Fase</p>
                            <div className="flex-1 flex flex-col justify-evenly">
                                <ElecRow label="P L1" value={fmt(agc["Generator_active_power_L1"])} unit="kW" tagName="Generator_active_power_L1" />
                                <ElecRow label="P L2" value={fmt(agc["Generator_active_power_L2"])} unit="kW" tagName="Generator_active_power_L2" />
                                <ElecRow label="P L3" value={fmt(agc["Generator_active_power_L3"])} unit="kW" tagName="Generator_active_power_L3" />
                            </div>
                            <p className="shrink-0 text-[9px] uppercase tracking-widest text-muted-foreground mt-1 mb-0.5">Potencias Reactivas/Fase</p>
                            <div className="flex-1 flex flex-col justify-evenly">
                                <ElecRow label="Q L1" value={fmt(agc["Generator_reactive_power_L1"])} unit="kVAr" tagName="Generator_reactive_power_L1" />
                                <ElecRow label="Q L2" value={fmt(agc["Generator_reactive_power_L2"])} unit="kVAr" tagName="Generator_reactive_power_L2" />
                                <ElecRow label="Q L3" value={fmt(agc["Generator_reactive_power_L3"])} unit="kVAr" tagName="Generator_reactive_power_L3" />
                            </div>
                            <p className="shrink-0 text-[9px] uppercase tracking-widest text-muted-foreground mt-1 mb-0.5">Potencias Aparentes/Fase</p>
                            <div className="flex-1 flex flex-col justify-evenly">
                                <ElecRow label="S L1" value={fmt(agc["Generator_apparent_power_L1"])} unit="kVA" tagName="Generator_apparent_power_L1" />
                                <ElecRow label="S L2" value={fmt(agc["Generator_apparent_power_L2"])} unit="kVA" tagName="Generator_apparent_power_L2" />
                                <ElecRow label="S L3" value={fmt(agc["Generator_apparent_power_L3"])} unit="kVA" tagName="Generator_apparent_power_L3" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-3 flex flex-col min-h-0">
                    <h3 className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-[#00ffc2]/70 mb-1">Barra Bus B</h3>
                    <div className="flex-1 flex flex-col min-h-0">
                        <p className="shrink-0 text-[9px] uppercase tracking-widest text-muted-foreground mb-0.5">Voltajes L-L</p>
                        <div className="flex-1 flex flex-col justify-evenly">
                            <ElecRow label="V L1-L2" value={fmt(agc["BusB_voltage_L1_L2"])} unit="V" tagName="BusB_voltage_L1_L2" />
                            <ElecRow label="V L2-L3" value={fmt(agc["BusB_voltage_L2_L3"])} unit="V" tagName="BusB_voltage_L2_L3" />
                            <ElecRow label="V L3-L1" value={fmt(agc["BusB_voltage_L3_L1"])} unit="V" tagName="BusB_voltage_L3_L1" />
                        </div>
                        <p className="shrink-0 text-[9px] uppercase tracking-widest text-muted-foreground mt-1 mb-0.5">Frecuencias</p>
                        <div className="flex-1 flex flex-col justify-evenly">
                            {[["F L1","BusB_frequency_L1"],["F L2","BusB_frequency_L2"],["F L3","BusB_frequency_L3"]].map(([label, key]) => {
                                const raw = n(agc[key]);
                                const hz = raw !== null ? (raw / 100).toFixed(2) : "--";
                                return (
                                    <div key={key} className="flex items-center justify-between border-b border-border/30 last:border-0 py-px">
                                        <span className="text-xs text-muted-foreground">{label}</span>
                                        <span className="text-xs font-semibold tabular-nums text-foreground">{hz} <span className="text-muted-foreground font-normal">Hz</span></span>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="shrink-0 text-[9px] uppercase tracking-widest text-muted-foreground mt-1 mb-0.5">Otros</p>
                        <div className="flex-1 flex flex-col justify-evenly">
                            <ElecRow label="IexcGen"     value={fmt(agc["IexcGen"], 2)}    unit="A"   tagName="IexcGen" />
                            <ElecRow label="VDC Battery" value={fmt(agc["VDCbattery"], 1)} unit="VDC" tagName="VDCbattery" />
                            <ElecRow label="FreqEscale"  value={fmt(agc["FreqEscale"], 2)} unit=""    tagName="FreqEscale" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="shrink-0">
                <h3 className="text-[9px] font-bold uppercase tracking-widest text-[#00ffc2] mb-1.5">Voltajes Bobinas (GVL_HMI)</h3>
                <div className="grid grid-cols-10 gap-1 mb-1">
                    {bobA.map(({ id, key, value }) => <BobinaCard key={id} id={id} value={value} tagName={key} />)}
                </div>
                <div className="grid grid-cols-10 gap-1">
                    {bobB.map(({ id, key, value }) => <BobinaCard key={id} id={id} value={value} tagName={key} />)}
                </div>
            </div>
        </div>
    );
}
