"use client";

import { TagValue } from "@/context/IoTTagsContext";
import { getThresholdStatus } from "@/config/thresholds-v2";
import HalfGauge from "../shared/HalfGauge";

interface Props {
    agc: Record<string, TagValue>;
    engine: Record<string, TagValue>;
    raiz: Record<string, TagValue>;
}

const n = (v?: TagValue) => (v ? parseFloat(v.value) : null);
const fmt = (v?: TagValue, dec = 1) => {
    const val = n(v);
    return val !== null ? val.toFixed(dec) : "--";
};

const STATUS_TEXT: Record<string, string> = {
    critical: "text-red-500",
    warning:  "text-yellow-400",
    info:     "text-blue-400",
    normal:   "text-[#00ffc2]",
};

function BigKpi({
    label,
    value,
    unit,
    tagName,
}: {
    label: string;
    value: string;
    unit: string;
    tagName?: string;
}) {
    const numVal = parseFloat(value);
    const status = tagName && !isNaN(numVal) ? getThresholdStatus(tagName, numVal) : "normal";
    const color = STATUS_TEXT[status] ?? "text-[#00ffc2]";
    const border =
        status === "critical"
            ? "border-red-500/40 bg-red-500/5"
            : status === "warning"
            ? "border-yellow-400/40 bg-yellow-400/5"
            : "border-[#00ffc2]/30 bg-[#00ffc2]/5";
    return (
        <div className={`rounded-xl border p-3 flex flex-col gap-1 ${border}`}>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground leading-tight truncate">
                {label}
            </p>
            <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold tabular-nums ${color}`}>{value}</span>
                <span className="text-xs text-muted-foreground">{unit}</span>
            </div>
        </div>
    );
}

function MidCard({
    label,
    value,
    unit,
    tagName,
}: {
    label: string;
    value: string;
    unit: string;
    tagName?: string;
}) {
    const numVal = parseFloat(value);
    const status = tagName && !isNaN(numVal) ? getThresholdStatus(tagName, numVal) : "normal";
    const color = STATUS_TEXT[status] ?? "text-[#00ffc2]";
    return (
        <div className="rounded-lg border bg-card px-3 py-2 flex flex-col gap-0.5">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground leading-tight truncate">
                {label}
            </p>
            <p className={`text-lg font-bold tabular-nums ${color}`}>
                {value}
                <span className="text-xs font-normal text-muted-foreground ml-0.5">{unit}</span>
            </p>
        </div>
    );
}

function BottomCard({
    label,
    value,
    unit,
    tagName,
}: {
    label: string;
    value: string;
    unit: string;
    tagName?: string;
}) {
    const numVal = parseFloat(value);
    const status = tagName && !isNaN(numVal) ? getThresholdStatus(tagName, numVal) : "normal";
    const color = STATUS_TEXT[status] ?? "text-[#00ffc2]";
    return (
        <div className="rounded-lg border bg-card px-2 py-1.5 flex flex-col gap-0.5">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground leading-tight truncate">
                {label}
            </p>
            <p className={`text-base font-bold tabular-nums ${color}`}>
                {value}
                <span className="text-xs font-normal text-muted-foreground ml-0.5">{unit}</span>
            </p>
        </div>
    );
}

export default function TabVistaGeneral({ agc, engine, raiz }: Props) {
    const rpm = n(agc["RPM"]);
    const freqRaw = n(agc["Generator_frequency_L1"]);
    const freqHz = freqRaw !== null ? freqRaw / 100 : null;

    const activePow = n(agc["Generator_active_power"]);
    const reactivePow = n(agc["Generator_reactive_power"]);
    const apparentPow = n(agc["Generator_apparent_power"]);
    const pf = n(agc["Generator_PF"]);

    const promCyl = n(engine["Promedio_tem_cyl"]);
    const presAceite = n(engine["Pres_Aceite_Motor"]);
    const tempAceite = n(engine["Temp_Aceite"]);
    const devanadoW = n(engine["Devanado_W"]);

    const energiaExp = n(agc["EnergiaExp"]);
    const vdcBattery = n(agc["VDCbattery"]);
    const iexcGen = n(agc["IexcGen"]);
    const freqEscale = n(agc["FreqEscale"]);
    const tecFlujo = n(raiz["TEC_FLUJO_CALCULADO"]);

    return (
        <div className="h-full flex flex-col gap-2 p-3 overflow-hidden">
            {/* FILA TOP: Gauges + KPIs grandes */}
            <div className="flex gap-3 items-start shrink-0">
                {/* RPM Gauge */}
                <div className="w-32 shrink-0">
                    <HalfGauge
                        label="RPM"
                        value={rpm}
                        unit="rpm"
                        min={0}
                        max={2000}
                        warning={1750}
                        danger={1900}
                        size="sm"
                    />
                </div>
                {/* Frecuencia Gauge */}
                <div className="w-32 shrink-0">
                    <HalfGauge
                        label="Frecuencia"
                        value={freqHz}
                        unit="Hz"
                        min={55}
                        max={65}
                        warning={59}
                        danger={61}
                        size="sm"
                    />
                </div>
                {/* 4 KPIs grandes */}
                <div className="flex-1 grid grid-cols-4 gap-2">
                    <BigKpi
                        label="Potencia Activa"
                        value={fmt(agc["Generator_active_power"], 0)}
                        unit="kW"
                        tagName="Generator_active_power"
                    />
                    <BigKpi
                        label="Pot. Reactiva"
                        value={fmt(agc["Generator_reactive_power"], 0)}
                        unit="kVAr"
                        tagName="Generator_reactive_power"
                    />
                    <BigKpi
                        label="Pot. Aparente"
                        value={fmt(agc["Generator_apparent_power"], 0)}
                        unit="kVA"
                        tagName="Generator_apparent_power"
                    />
                    <BigKpi
                        label="Factor Potencia"
                        value={fmt(agc["Generator_PF"], 3)}
                        unit=""
                        tagName="Generator_PF"
                    />
                </div>
            </div>

            {/* FILA MEDIO: Motor health (4 cols) */}
            <div className="grid grid-cols-4 gap-2 shrink-0">
                <MidCard
                    label="Prom. Temp Cil."
                    value={promCyl !== null ? promCyl.toFixed(0) : "--"}
                    unit="°F"
                    tagName="Promedio_tem_cyl"
                />
                <MidCard
                    label="Presión Aceite"
                    value={presAceite !== null ? presAceite.toFixed(2) : "--"}
                    unit="bar"
                    tagName="Pres_Aceite_Motor"
                />
                <MidCard
                    label="Temp. Aceite"
                    value={tempAceite !== null ? tempAceite.toFixed(1) : "--"}
                    unit="°C"
                    tagName="Temp_Aceite"
                />
                <MidCard
                    label="Devanado W"
                    value={devanadoW !== null ? devanadoW.toFixed(0) : "--"}
                    unit="°C"
                    tagName="Devanado_W"
                />
            </div>

            {/* FILA BOTTOM: Energía y extras (5 cols) */}
            <div className="grid grid-cols-5 gap-2 shrink-0">
                <BottomCard
                    label="Energía Exportada"
                    value={energiaExp !== null ? energiaExp.toFixed(0) : "--"}
                    unit="kWh"
                    tagName="EnergiaExp"
                />
                <BottomCard
                    label="VDC Battery"
                    value={vdcBattery !== null ? vdcBattery.toFixed(1) : "--"}
                    unit="VDC"
                    tagName="VDCbattery"
                />
                <BottomCard
                    label="IexcGen"
                    value={iexcGen !== null ? iexcGen.toFixed(2) : "--"}
                    unit="A"
                    tagName="IexcGen"
                />
                <BottomCard
                    label="FreqEscale"
                    value={freqEscale !== null ? freqEscale.toFixed(2) : "--"}
                    unit=""
                    tagName="FreqEscale"
                />
                <BottomCard
                    label="Flujo Calculado"
                    value={tecFlujo !== null ? tecFlujo.toFixed(2) : "--"}
                    unit="L/s"
                    tagName="TEC_FLUJO_CALCULADO"
                />
            </div>

            {/* Tabla de datos eléctricos por fase */}
            <div className="flex-1 grid grid-cols-2 gap-3 min-h-0 overflow-hidden">
                {/* Generador */}
                <div className="rounded-lg border bg-card p-3 overflow-y-auto">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#00ffc2] mb-2">
                        Generador — Datos por Fase
                    </h3>
                    <div className="grid grid-cols-2 gap-x-4">
                        <div>
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Voltajes L-N</p>
                            {[
                                ["V L1-N", "Generator_voltage_L1_N", "V"],
                                ["V L2-N", "Generator_voltage_L2_N", "V"],
                                ["V L3-N", "Generator_voltage_L3_N", "V"],
                            ].map(([label, key, unit]) => {
                                const val = n(agc[key]);
                                const status = val !== null ? getThresholdStatus(key, val) : "normal";
                                const color = STATUS_TEXT[status] ?? "text-[#00ffc2]";
                                return (
                                    <div key={key} className="flex items-center justify-between py-1 border-b border-border/40 last:border-0">
                                        <span className="text-xs text-muted-foreground">{label}</span>
                                        <span className={`text-xs font-semibold tabular-nums ${color}`}>
                                            {val !== null ? val.toFixed(0) : "--"}{" "}
                                            <span className="text-muted-foreground font-normal">{unit}</span>
                                        </span>
                                    </div>
                                );
                            })}
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mt-1.5 mb-1">Voltajes L-L</p>
                            {[
                                ["V L1-L2", "Generator_voltage_L1_L2", "V"],
                                ["V L2-L3", "Generator_voltage_L2_L3", "V"],
                                ["V L3-L1", "Generator_voltage_L3_L1", "V"],
                            ].map(([label, key, unit]) => {
                                const val = n(agc[key]);
                                const status = val !== null ? getThresholdStatus(key, val) : "normal";
                                const color = STATUS_TEXT[status] ?? "text-[#00ffc2]";
                                return (
                                    <div key={key} className="flex items-center justify-between py-1 border-b border-border/40 last:border-0">
                                        <span className="text-xs text-muted-foreground">{label}</span>
                                        <span className={`text-xs font-semibold tabular-nums ${color}`}>
                                            {val !== null ? val.toFixed(0) : "--"}{" "}
                                            <span className="text-muted-foreground font-normal">{unit}</span>
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <div>
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Corrientes</p>
                            {[
                                ["I L1", "Generator_current_L1", "A"],
                                ["I L2", "Generator_current_L2", "A"],
                                ["I L3", "Generator_current_L3", "A"],
                            ].map(([label, key, unit]) => {
                                const val = n(agc[key]);
                                const status = val !== null ? getThresholdStatus(key, val) : "normal";
                                const color = STATUS_TEXT[status] ?? "text-[#00ffc2]";
                                return (
                                    <div key={key} className="flex items-center justify-between py-1 border-b border-border/40 last:border-0">
                                        <span className="text-xs text-muted-foreground">{label}</span>
                                        <span className={`text-xs font-semibold tabular-nums ${color}`}>
                                            {val !== null ? val.toFixed(0) : "--"}{" "}
                                            <span className="text-muted-foreground font-normal">{unit}</span>
                                        </span>
                                    </div>
                                );
                            })}
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mt-1.5 mb-1">Potencias</p>
                            {[
                                ["P Act.", "Generator_active_power", "kW"],
                                ["P React.", "Generator_reactive_power", "kVAr"],
                                ["P Apar.", "Generator_apparent_power", "kVA"],
                            ].map(([label, key, unit]) => {
                                const val = n(agc[key]);
                                const status = val !== null ? getThresholdStatus(key, val) : "normal";
                                const color = STATUS_TEXT[status] ?? "text-[#00ffc2]";
                                return (
                                    <div key={key} className="flex items-center justify-between py-1 border-b border-border/40 last:border-0">
                                        <span className="text-xs text-muted-foreground">{label}</span>
                                        <span className={`text-xs font-semibold tabular-nums ${color}`}>
                                            {val !== null ? val.toFixed(0) : "--"}{" "}
                                            <span className="text-muted-foreground font-normal">{unit}</span>
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Barra Bus B */}
                <div className="rounded-lg border bg-card p-3 overflow-y-auto">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#00ffc2]/70 mb-2">
                        Barra Bus B
                    </h3>
                    <div className="grid grid-cols-2 gap-x-4">
                        <div>
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Voltajes L-L</p>
                            {[
                                ["V L1-L2", "BusB_voltage_L1_L2", "V"],
                                ["V L2-L3", "BusB_voltage_L2_L3", "V"],
                                ["V L3-L1", "BusB_voltage_L3_L1", "V"],
                            ].map(([label, key, unit]) => {
                                const val = n(agc[key]);
                                return (
                                    <div key={key} className="flex items-center justify-between py-1 border-b border-border/40 last:border-0">
                                        <span className="text-xs text-muted-foreground">{label}</span>
                                        <span className="text-xs font-semibold tabular-nums text-foreground">
                                            {val !== null ? val.toFixed(0) : "--"}{" "}
                                            <span className="text-muted-foreground font-normal">{unit}</span>
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <div>
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Frecuencias</p>
                            {[
                                ["F L1", "BusB_frequency_L1"],
                                ["F L2", "BusB_frequency_L2"],
                                ["F L3", "BusB_frequency_L3"],
                            ].map(([label, key]) => {
                                const val = n(agc[key]);
                                const hz = val !== null ? (val / 100).toFixed(2) : "--";
                                return (
                                    <div key={key} className="flex items-center justify-between py-1 border-b border-border/40 last:border-0">
                                        <span className="text-xs text-muted-foreground">{label}</span>
                                        <span className="text-xs font-semibold tabular-nums text-foreground">
                                            {hz}{" "}
                                            <span className="text-muted-foreground font-normal">Hz</span>
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
