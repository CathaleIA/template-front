"use client";

import { TagValue } from "@/context/IoTTagsContext";
import HalfGauge from "../shared/HalfGauge";

interface Props {
    engine: Record<string, TagValue>;
    raiz: Record<string, TagValue>;
}

const n = (v?: TagValue) => v ? parseFloat(v.value) : null;

function SectionRow({ label, value, unit }: { label: string; value: string; unit: string }) {
    return (
        <div className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
            <span className="text-xs text-muted-foreground truncate mr-2">{label}</span>
            <span className="text-xs font-semibold tabular-nums whitespace-nowrap text-foreground">
                {value} <span className="text-muted-foreground font-normal">{unit}</span>
            </span>
        </div>
    );
}

function fmt(v?: TagValue, dec = 2) {
    const val = n(v);
    return val !== null ? val.toFixed(dec) : "--";
}

export default function TabSistema({ engine, raiz }: Props) {
    const presAceite = n(engine["Pres_Aceite_Motor"]);
    const presHT = n(engine["Presion_HT"]);
    const presLT = n(engine["Presion_LT"]);
    const flujo = n(raiz["TEC_FLUJO_CALCULADO"]);

    return (
        <div className="h-full flex flex-col gap-3 p-3 overflow-hidden">
            {/* TOP gauges */}
            <div className="flex gap-4 shrink-0 items-start">
                <div className="w-36 shrink-0">
                    <HalfGauge label="Pres. Aceite" value={presAceite}
                        unit="bar" min={0} max={8} warning={2} danger={6} size="sm" />
                </div>
                <div className="w-36 shrink-0">
                    <HalfGauge label="Presión HT" value={presHT}
                        unit="bar" min={0} max={5} warning={3} danger={4.5} size="sm" />
                </div>
                <div className="w-36 shrink-0">
                    <HalfGauge label="Presión LT" value={presLT}
                        unit="bar" min={0} max={5} warning={3} danger={4.5} size="sm" />
                </div>
                {flujo !== null && (
                    <div className="flex-1 rounded-lg border bg-card px-4 py-3">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Flujo Calculado</p>
                        <p className="text-2xl font-bold tabular-nums text-[#00ffc2]">
                            {flujo.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">L/s</span>
                        </p>
                    </div>
                )}
            </div>

            {/* Sections grid */}
            <div className="flex-1 grid grid-cols-3 gap-3 min-h-0 overflow-hidden">
                {/* Refrigeración */}
                <div className="rounded-lg border bg-card p-3 overflow-y-auto">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#72bfaf] mb-2">
                        Refrigeración
                    </h3>
                    <SectionRow label="T. Ref. HT Entrada"  value={fmt(engine["Temp_Refrigerante_HT_Entrada"])} unit="°C" />
                    <SectionRow label="T. Ref. HT Salida"   value={fmt(engine["Temp_Refrigerante_HT_Salida"])}  unit="°C" />
                    <SectionRow label="T. Ref. LT Entrada"  value={fmt(engine["Temp_Refrigerante_LT_Entrada"])} unit="°C" />
                    <SectionRow label="T. Ref. LT Salida"   value={fmt(engine["Temp_Refrigerante_LT_Salida"])}  unit="°C" />
                    <SectionRow label="Presión HT"          value={fmt(engine["Presion_HT"])}                   unit="bar" />
                    <SectionRow label="Presión LT"          value={fmt(engine["Presion_LT"])}                   unit="bar" />
                </div>

                {/* Aceite y Aire */}
                <div className="rounded-lg border bg-card p-3 overflow-y-auto">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#72bfaf] mb-2">
                        Aceite y Aire
                    </h3>
                    <SectionRow label="Pres. Aceite Motor"  value={fmt(engine["Pres_Aceite_Motor"])}            unit="bar" />
                    <SectionRow label="Temp. Aceite"        value={fmt(engine["Temp_Aceite"])}                  unit="°C" />
                    <SectionRow label="Temp. Aire Blower"   value={fmt(engine["Temp_Aire_Blower"])}             unit="°C" />
                    <SectionRow label="Temp. Aire Filtro"   value={fmt(engine["Temp_Aire_Filtro_Motor"])}       unit="°C" />
                </div>

                {/* Gas y Control */}
                <div className="rounded-lg border bg-card p-3 overflow-y-auto">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#72bfaf] mb-2">
                        Gas y Control
                    </h3>
                    <SectionRow label="Pres. Gas Entrada"   value={fmt(engine["Pres_Gas_Entrada_Motor"])}       unit="bar" />
                    <SectionRow label="Pres. Gas (PSI)"     value={fmt(engine["Pres_Gas_Entrada_PSI"])}         unit="PSI" />
                    <SectionRow label="MAP P1"              value={fmt(engine["MAP_P1"])}                       unit="mbar" />
                    <SectionRow label="MAP P2"              value={fmt(engine["MAP_P2"])}                       unit="mbar" />
                    <SectionRow label="Pres. Diferencial"   value={fmt(engine["PresDiff"])}                     unit="mbar" />
                    <SectionRow label="Throttle"            value={fmt(engine["Feedback_Throttle"], 1)}         unit="%" />
                    <SectionRow label="T. Bypass 1"         value={fmt(engine["Feedback_TBypass_1"], 1)}        unit="%" />
                    <SectionRow label="T. Bypass 2"         value={fmt(engine["Feedback_TBypass_2"], 1)}        unit="%" />
                </div>
            </div>
        </div>
    );
}
