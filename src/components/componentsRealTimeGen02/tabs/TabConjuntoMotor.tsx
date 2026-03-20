"use client";

import { TagValue } from "@/context/IoTTagsContext";
import { getThresholdStatus } from "@/config/thresholds-v2";
import HalfGauge from "@/components/componentsRealTimeGen01/shared/HalfGauge";

interface Props {
    engine: Record<string, TagValue>;
    knock: Record<string, TagValue>;
}

const n = (v?: TagValue) => (v ? parseFloat(v.value) : null);

// Cilindros disponibles en GEN53 Engine_1
const CYL_NUMS = [1, 3, 4, 10, 11, 17, 19, 20];
// Todos los knock sensors (1..20)
const KNOCK_NUMS = Array.from({ length: 20 }, (_, i) => i + 1);

function cylCardColors(val: number | null, num: number) {
    if (val === null) return "border-border bg-card text-muted-foreground";
    const status = getThresholdStatus(`Tem_Cyl_${num}`, val);
    if (status === "critical") return "border-red-500/60 bg-red-500/10 text-red-400";
    if (status === "warning") return "border-yellow-500/60 bg-yellow-500/10 text-yellow-400";
    return "border-[#60a5fa]/30 bg-[#60a5fa]/5 text-[#60a5fa]";
}

function CylCard({ num, value }: { num: number; value: number | null }) {
    return (
        <div className={`rounded-lg border p-2 flex flex-col items-center gap-0.5 ${cylCardColors(value, num)}`}>
            <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                Cil {num}
            </span>
            <span className="text-sm font-bold tabular-nums">
                {value !== null ? value.toFixed(0) : "--"}
            </span>
            <span className="text-[9px] text-muted-foreground">°F</span>
        </div>
    );
}

function SectionRow({
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
    const colorMap: Record<string, string> = {
        critical: "text-red-500",
        warning: "text-yellow-400",
        info: "text-blue-400",
        normal: "text-[#60a5fa]",
    };
    return (
        <div className="flex items-center justify-between py-1 border-b border-border/40 last:border-0">
            <span className="text-xs text-muted-foreground truncate mr-2">{label}</span>
            <span className={`text-xs font-semibold tabular-nums whitespace-nowrap ${colorMap[status] ?? "text-foreground"}`}>
                {value} <span className="text-muted-foreground font-normal">{unit}</span>
            </span>
        </div>
    );
}

function BarActuator({
    label,
    value,
    max = 100,
    unit = "%",
}: {
    label: string;
    value: number | null;
    max?: number;
    unit?: string;
}) {
    const pct = value !== null ? Math.min(100, (value / max) * 100) : 0;
    const barColor = pct > 90 ? "bg-red-500" : pct > 70 ? "bg-yellow-400" : "bg-[#60a5fa]";
    return (
        <div className="flex flex-col gap-0.5">
            <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest truncate">{label}</span>
                <span className="text-xs font-semibold tabular-nums text-foreground ml-1 whitespace-nowrap">
                    {value !== null ? value.toFixed(1) : "--"}{" "}
                    <span className="text-muted-foreground font-normal">{unit}</span>
                </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted/30">
                <div className={`h-1.5 rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

function KnockBar({ num, value }: { num: number; value: number | null }) {
    const status = value !== null ? getThresholdStatus(`Rx_Knc_Int_${num}`, value) : "normal";
    const barColor =
        status === "critical" ? "bg-red-500" : status === "warning" ? "bg-yellow-400" : "bg-[#60a5fa]";
    const textColor =
        status === "critical"
            ? "text-red-500"
            : status === "warning"
            ? "text-yellow-400"
            : "text-[#60a5fa]";
    const pct = value !== null ? Math.min(100, (value / 100) * 100) : 0;
    return (
        <div className="flex flex-col items-center gap-0.5">
            <span className={`text-[8px] font-bold tabular-nums ${textColor}`}>
                {value !== null ? value.toFixed(0) : "--"}
            </span>
            <div className="w-full bg-muted/20 rounded-sm relative overflow-hidden flex-1">
                <div
                    className={`absolute bottom-0 left-0 right-0 rounded-sm transition-all duration-500 ${barColor}`}
                    style={{ height: `${pct}%` }}
                />
            </div>
            <span className="text-[7px] text-muted-foreground">C{num}</span>
        </div>
    );
}

export default function TabConjuntoMotor({ engine, knock }: Props) {
    const promedio = n(engine["Promedio_tem_cyl"]);

    return (
        <div className="h-full flex flex-col gap-2 p-3 overflow-hidden">
            {/* SECCION SUPERIOR: Gauge + cilindros + devanados */}
            <div className="flex gap-3 items-start shrink-0">
                {/* Gauge promedio */}
                <div className="w-28 shrink-0">
                    <HalfGauge
                        label="Prom. Cil."
                        value={promedio}
                        unit="°F"
                        min={400}
                        max={650}
                        warning={580}
                        danger={610}
                        size="sm"
                    />
                </div>
                {/* Cilindros 8 cards */}
                <div className="flex-1 grid grid-cols-8 gap-1.5">
                    {CYL_NUMS.map((num) => (
                        <CylCard key={num} num={num} value={n(engine[`Tem_Cyl_${num}`])} />
                    ))}
                </div>
                {/* Devanados U/V/W */}
                <div className="flex flex-col gap-1.5 shrink-0">
                    {(["U", "V", "W"] as const).map((d) => {
                        const val = n(engine[`Devanado_${d}`]);
                        const status = val !== null ? getThresholdStatus(`Devanado_${d}`, val) : "normal";
                        const color =
                            status === "critical"
                                ? "text-red-500"
                                : status === "warning"
                                ? "text-yellow-400"
                                : val === null
                                ? "text-foreground"
                                : "text-[#60a5fa]";
                        return (
                            <div key={d} className="rounded-lg border bg-card px-2 py-1 min-w-[68px]">
                                <p className="text-[8px] uppercase tracking-widest text-muted-foreground">Dev. {d}</p>
                                <p className={`text-sm font-bold tabular-nums ${color}`}>
                                    {val !== null ? val.toFixed(0) : "--"}{" "}
                                    <span className="text-xs font-normal text-muted-foreground">°C</span>
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* SISTEMA: grid 4 secciones */}
            <div className="shrink-0 grid grid-cols-4 gap-2">
                {/* Refrigeración */}
                <div className="rounded-lg border bg-card p-2">
                    <h3 className="text-[9px] font-bold uppercase tracking-widest text-[#60a5fa] mb-1">
                        Refrigeración
                    </h3>
                    <SectionRow
                        label="HT Entrada"
                        value={n(engine["T_HT_ENTREDA"])?.toFixed(1) ?? "--"}
                        unit="°C"
                        tagName="T_HT_ENTREDA"
                    />
                    <SectionRow
                        label="HT Salida"
                        value={n(engine["Tem_HT_ref_salida"])?.toFixed(1) ?? "--"}
                        unit="°C"
                        tagName="Tem_HT_ref_salida"
                    />
                    <SectionRow
                        label="LT Salida"
                        value={n(engine["Temp_LT_salida"])?.toFixed(1) ?? "--"}
                        unit="°C"
                        tagName="Temp_LT_salida"
                    />
                </div>
                {/* Aceite */}
                <div className="rounded-lg border bg-card p-2">
                    <h3 className="text-[9px] font-bold uppercase tracking-widest text-[#60a5fa] mb-1">
                        Aceite
                    </h3>
                    <SectionRow
                        label="Temp. Aceite"
                        value={n(engine["Temperatura_aceite"])?.toFixed(1) ?? "--"}
                        unit="°C"
                        tagName="Temperatura_aceite"
                    />
                    <SectionRow
                        label="Pres. Aceite"
                        value={n(engine["Presion_aceite"])?.toFixed(2) ?? "--"}
                        unit="bar"
                        tagName="Presion_aceite"
                    />
                </div>
                {/* Gas */}
                <div className="rounded-lg border bg-card p-2">
                    <h3 className="text-[9px] font-bold uppercase tracking-widest text-[#60a5fa] mb-1">
                        Gas
                    </h3>
                    <SectionRow
                        label="Gas Entrada"
                        value={n(engine["Pres_Gas_Entrada_Motor"])?.toFixed(2) ?? "--"}
                        unit="bar"
                        tagName="Pres_Gas_Entrada_Motor"
                    />
                    <SectionRow
                        label="MAP"
                        value={n(engine["MAP"])?.toFixed(1) ?? "--"}
                        unit="mbar"
                        tagName="MAP"
                    />
                </div>
                {/* Filtro */}
                <div className="rounded-lg border bg-card p-2">
                    <h3 className="text-[9px] font-bold uppercase tracking-widest text-[#60a5fa] mb-1">
                        Filtro / Aire
                    </h3>
                    <SectionRow
                        label="Temp. Filtro"
                        value={n(engine["Tempe_filtro"])?.toFixed(1) ?? "--"}
                        unit="°C"
                        tagName="Tempe_filtro"
                    />
                </div>
            </div>

            {/* ACTUADORES */}
            <div className="shrink-0 rounded-lg border bg-card p-2.5">
                <h3 className="text-[9px] font-bold uppercase tracking-widest text-[#60a5fa] mb-1.5">
                    Actuadores
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    <BarActuator label="Throttle (pos)" value={n(engine["pos_throttle"])} max={100} unit="%" />
                    <BarActuator label="Bypass (pos)" value={n(engine["pos_bypass"])} max={100} unit="%" />
                    <BarActuator label="3 Vías (fbk)" value={n(engine["feedback_3_vias"])} max={100} unit="%" />
                    <BarActuator label="Mando Mixer" value={n(engine["MandoMixer"])} max={100} unit="%" />
                </div>
            </div>

            {/* KNOCK SENSORS */}
            <div className="flex-1 rounded-lg border bg-card p-2.5 min-h-0 overflow-hidden flex flex-col">
                <h3 className="text-[9px] font-bold uppercase tracking-widest text-[#60a5fa] mb-1.5 shrink-0">
                    Knock Sensors — 20 Cilindros
                </h3>
                <div
                    className="grid gap-1 flex-1"
                    style={{ gridTemplateColumns: "repeat(20, 1fr)" }}
                >
                    {KNOCK_NUMS.map((num) => (
                        <KnockBar key={num} num={num} value={n(knock[`Rx_Knc_Int_${num}`])} />
                    ))}
                </div>
            </div>
        </div>
    );
}
