"use client";

import React, { useState, useMemo } from "react";
import { TagValue } from "@/context/IoTTagsContext";

// ─── Static tag lists (shown even before live data arrives) ───────────────────

export const ALARM_TAGS_GD: string[] = [
    // General
    "Ack_All_alarms", "Shutdown", "Warning_delta_temp", "Alarma_knocking",
    // Radiador
    "ALARM_RAD_1", "ALARM_RAD_2", "ALARM_RAD_3", "ALARM_RAD_4", "ALARM_RAD_5", "ALARM_RAD_6",
    // Temp cilindros — warning
    "Temp_Warn_C1", "Temp_Warn_C2", "Temp_Warn_C3", "Temp_Warn_C4", "Temp_Warn_C5",
    "Temp_Warn_C6", "Temp_Warn_C7", "Temp_Warn_C8", "Temp_Warn_C9", "Temp_Warn_C10",
    "Temp_Warn_C11", "Temp_Warn_C12", "Temp_Warn_C13", "Temp_Warn_C14", "Temp_Warn_C15",
    "Temp_Warn_C16", "Temp_Warn_C17", "Temp_Warn_C18", "Temp_Warn_C19", "Temp_Warn_C20",
    // Temp cilindros — shutdown
    "Temp_SD_C1", "Temp_SD_C2", "Temp_SD_C3", "Temp_SD_C4", "Temp_SD_C5",
    "Temp_SD_C6", "Temp_SD_C7", "Temp_SD_C8", "Temp_SD_C9", "Temp_SD_C10",
    "Temp_SD_C11", "Temp_SD_C12", "Temp_SD_C13", "Temp_SD_C14", "Temp_SD_C15",
    "Temp_SD_C16", "Temp_SD_C17", "Temp_SD_C18", "Temp_SD_C19", "Temp_SD_C20",
    // Temp sistema
    "Temp_Warn_LTSalida", "Temp_SD_LTSalida",
    "Temp_Warn_Aceite", "Temp_SD_Aceite",
    "Temp_Warn_HT_Salida", "Temp_SD_HT_Salida",
    "Temp_Warn_HT_Entrada", "Temp_SD_HT_Entrada",
    "Temp_Warn_Dev_U", "Temp_SD_Dev_U",
    "Temp_Warn_Dev_V", "Temp_SD_Dev_V",
    "Temp_Warn_Dev_W", "Temp_SD_Dev_W",
    "Temp_Warn_Rod_D", "Temp_SD_Rod_D",
    "Temp_Warn_Rod_T", "Temp_SD_Rod_T",
    // Presión
    "Pres_Warn_Aceite", "Pres_SD_Aceite",
    "Pres_Warn_Ref_HT", "Pres_SD_Ref_HT",
    // Potencia generador
    "GP_1_Potencia_Inversa_Warn", "GP_2_Potencia_Inversa_SD",
    "GP_1_Sobre_Carga_Warn", "GP_2_Sobre_Carga_SD",
    // Corriente generador
    "GI_1_Sobre_Corriente_Warn", "GI_2_Sobre_Corriente_SD",
    "GI_inv_Corriente_Inversa_SD",
    "GI_1_Sobre_Corriente_Rapida_Warn", "GI_2_Sobre_Corriente_Rapida_SD",
    // Voltaje generador
    "GU_1_Sobre_Voltaje_Warn", "GU_2_Sobre_Voltaje_SD",
    "GU_1_Bajo_Voltaje_Warn", "GU_2_Bajo_Voltaje_SD",
    // Frecuencia generador
    "Gf_1_Sobre_Frecuencia_Warn", "Gf_2_Sobre_Frecuencia_SD",
    "Gf_1_Baja_Frecuencia_Warn", "Gf_2_Baja_Frecuencia_SD",
    // Bus B — voltaje
    "BBU_1_Sobre_Voltaje_Bus_Warn", "BBU_2_Sobre_Voltaje_Bus_SD",
    "BBU_1_Bajo_Voltaje_Bus_Warn", "BBU_2_Bajo_Voltaje_Bus_SD",
    // Bus B — frecuencia
    "BBf_1_Sobre_Frecuencia_Warn", "BBf_2_Sobre_Frecuencia_SD",
    "BBf_1_Baja_Frecuencia_Warn", "BBf_2_Baja_Frecuencia_SD",
    // Eléctrico generador
    "ROCOF_Shutdown", "Vector_Jump", "BB_Pos_Seq_Volt_Low",
    "Unbalance_Curr_1_SD", "Unbalance_Volt_SD",
    "G_Reactivos_Inversos_Warn", "G_Sobre_Reactivos_Warn",
    "Gen_Neg_Seq_I_Warn", "Gen_Neg_Seq_U_Warn", "Gen_Zero_Seq_I_Warn",
    // Interruptor GB
    "GB_Ext_Trip_Warn", "GB_Sync_Window_Warn", "GB_Sync_Fail_GB_Warn",
    "GB_Open_Fail_Warn", "GB_Close_Fail_Warn", "GB_Pos_Fail_Warn",
    // AVR / Deload
    "Governor_Regulation_Fail_SD", "Deload_Error_SD", "AVR_Regulation_Fail_SD",
    // Comunicación
    "Digital_Alarm_Input_39", "Digital_Alarm_Input_40",
    "Trip_GB_Switchgear_SD", "Communication_Error_SD",
    // Motor / Arranque
    "Overspeed_1_Warn", "Overspeed_2_SD", "Over_speed_Warn",
    "Crank_failure_Warn", "MPU_wire_failure_SD",
    "Running_feedback_failure_Warn", "HzV_failure_Warn",
    "Start_failure_Warn", "Stop_failure_SD", "Underspeed_1_Warn",
];

export const ALARM_TAGS_GEN55: string[] = [
    // General
    "Shutdown", "Warning_delta_temp",
    // Fallas
    "Falla_1F3", "Falla_1F4", "Falla_1F12",
    "Falla_DD01", "Falla_DD02", "Falla_DD03", "Falla_DD04", "Falla_DD09",
    // Temp cilindros — warning
    "Temp_Warn_C3", "Temp_Warn_C4", "Temp_Warn_C5", "Temp_Warn_C6", "Temp_Warn_C7",
    "Temp_Warn_C12", "Temp_Warn_C13", "Temp_Warn_C14", "Temp_Warn_C15", "Temp_Warn_C16",
    "Temp_Warn_C18", "Temp_Warn_C19",
    // Temp cilindros — shutdown
    "Temp_SD_C1", "Temp_SD_C2", "Temp_SD_C3", "Temp_SD_C4", "Temp_SD_C5",
    "Temp_SD_C6", "Temp_SD_C7", "Temp_SD_C8", "Temp_SD_C9", "Temp_SD_C10",
    "Temp_SD_C11", "Temp_SD_C12", "Temp_SD_C13", "Temp_SD_C14", "Temp_SD_C15",
    "Temp_SD_C16", "Temp_SD_C17", "Temp_SD_C20",
    // Temp sistema
    "Temp_SD_LT_Salida", "Temp_SD_LT_Entrada",
    "Temp_SD_HT_Salida", "Temp_SD_HT_Entrada",
    "Temp_SD_Dev_U", "Temp_SD_Dev_V", "Temp_SD_Dev_W",
    "Temp_SD_Rod_D", "Temp_SD_Rod_T",
    "Temp_SD_Gas_Entrada", "Temp_SD_Aceite",
    "Temp_SD_Aire_Blower", "Temp_SD_Gases_Escape_Post_Turbo",
    "Temp_SD_Cabina_Delantera", "Temp_SD_Aire_Filtro_Motor",
    "Temp_Shutdown_Manifold_MAT",
    "Temp_Warn_LT_Salida", "Temp_Warn_LT_Entrada",
    "Temp_Warn_HT_Salida", "Temp_Warn_HT_Entrada",
    "Temp_Warn_Rod_T", "Temp_Warn_Cabina_Delantera",
    "Temp_Warning_Manifold_MAT",
    // Presión
    "Pres_Warn_Aceite", "Pres_SD_Aceite", "Pres_Warn_AceiteMax", "Pres_SD_AceiteMax",
    "Pres_Warn_Gas_Entrada", "Pres_SD_Gas_Entrada",
    "Pres_Warn_Ref_HT", "Pres_SD_Ref_HT", "Pres_Warn_Ref_HTMax", "Pres_SD_Ref_HTMax",
    "Pres_Warn_Ref_LT", "Pres_SD_Ref_LT",
    "Pres_Warning_MAP_P1", "Pres_Shutdown_MAP_P1",
    "Pres_Warning_MAP_P2", "Pres_Shutdown_MAP_P2",
    // Potencia / Corriente / Voltaje / Frecuencia generador
    "GP_2_Potencia_Inversa_SD",
    "GI_1_Sobre_Corriente_Warn", "GI_inv_Corriente_Inversa_SD", "GI_1_Sobre_Corriente_Rapida_Warn",
    "GU_1_Sobre_Voltaje_Warn", "GU_2_Sobre_Voltaje_SD",
    "Gf_1_Sobre_Frecuencia_Warn", "Gf_1_Baja_Frecuencia_Warn",
    "Gf_2_Sobre_Frecuencia_SD", "Gf_2_Baja_Frecuencia_SD",
    // Bus B
    "BBU_1_Sobre_Voltaje_Bus_Warn", "BBU_2_Sobre_Voltaje_Bus_SD",
    "BBU_1_Bajo_Voltaje_Bus_Warn", "BBU_2_Bajo_Voltaje_Bus_SD",
    "BBf_1_Sobre_Frecuencia_Warn", "BBf_2_Sobre_Frecuencia_SD",
    "BBf_1_Baja_Frecuencia_Warn", "BBf_2_Baja_Frecuencia_SD",
    "BB_Pos_Seq_Volt_Low",
    // Eléctrico generador
    "Vector_Jump",
    "Unbalance_Curr_1_SD", "Unbalance_Volt_SD",
    "G_Reactivos_Inversos_Warn", "G_Sobre_Reactivos_Warn",
    "Gen_Neg_Seq_I_Warn", "Gen_Neg_Seq_U_Warn", "Gen_Zero_Seq_I_Warn",
    // Interruptor GB
    "GB_Ext_Trip_Warn", "GB_Sync_Window_Warn", "GB_Sync_Fail_GB_Warn", "GB_Sync_Fail_MB_Warn",
    "GB_Open_Fail_Warn", "GB_Close_Fail_Warn", "GB_Pos_Fail_Warn",
    // AVR / Deload / Governor
    "Governor_Regulation_Fail_SD", "Deload_Error_SD", "AVR_Regulation_Fail_SD",
    // Comunicación
    "Communication_Error_SD", "Communication_error_ext",
    "Digital_AVR_Communication_Error", "Digital_AVR_Warning", "Digital_AVR_Trip",
    "Trip_GB_Switchgear_SD",
    // Motor / Arranque
    "Overspeed_1_Warn", "Overspeed_2_SD", "Over_speed_Warn",
    "Crank_failure_Warn", "MPU_wire_failure_SD",
    "Running_feedback_failure_Warn", "HzV_failure_Warn",
    "Start_failure_Warn", "Stop_failure_SD", "Underspeed_1_Warn",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface Props {
    alarmas: Record<string, TagValue>;
    defaultTags?: string[];
}

function getSeverity(tag: string): "shutdown" | "warning" | "info" {
    const t = tag.toLowerCase();
    if (t.includes("_sd") || t.includes("shutdown") || t.includes("trip") || t.includes("falla") || t.includes("rocof")) return "shutdown";
    if (t.includes("_warn") || t.includes("warning") || t.includes("alarm") || t.includes("error") || t.includes("failure") || t.includes("jump") || t.includes("rocof")) return "warning";
    return "info";
}

function getCategory(tag: string): string {
    const t = tag.toLowerCase();
    if (t.startsWith("falla_")) return "Fallas";
    if (t.startsWith("alarm_rad")) return "Radiador";
    if (t.startsWith("temp_warn_c") || t.startsWith("temp_sd_c")) return "Temp. Cilindros";
    if (t.startsWith("temp_")) return "Temperatura Sistema";
    if (t.startsWith("pres_")) return "Presión";
    if (t.startsWith("gp_")) return "Potencia Generador";
    if (t.startsWith("gi_")) return "Corriente Generador";
    if (t.startsWith("gu_")) return "Voltaje Generador";
    if (t.startsWith("gf_")) return "Frecuencia Generador";
    if (t.startsWith("g_")) return "Eléctrico Generador";
    if (t.startsWith("gen_")) return "Eléctrico Generador";
    if (t.startsWith("bbu_") || t.startsWith("bbf_") || t.startsWith("bb_")) return "Bus B";
    if (t.startsWith("gb_")) return "Interruptor (GB)";
    if (t.startsWith("avr_") || t.startsWith("digital_avr")) return "AVR";
    if (t.startsWith("communication") || t.startsWith("digital_")) return "Comunicación";
    if (t.startsWith("overspeed") || t.startsWith("over_speed") || t.startsWith("underspeed") || t.startsWith("crank") || t.startsWith("mpu") || t.startsWith("start_") || t.startsWith("stop_") || t.startsWith("running") || t.startsWith("hzv")) return "Motor / Arranque";
    if (t.startsWith("deload")) return "Deload";
    return "General";
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TabAlarmas({ alarmas, defaultTags }: Props) {
    const [filter, setFilter] = useState<"all" | "active">("all");
    const [search, setSearch] = useState("");

    const rows = useMemo(() => {
        // Merge: start with defaultTags (placeholders), override with live data
        const tagSet = new Set<string>([...(defaultTags ?? []), ...Object.keys(alarmas)]);

        return Array.from(tagSet)
            .map(tag => {
                const tv = alarmas[tag];
                const hasData = !!tv;
                // Falla_* tags: true = normal, false = falla activa (logic inverted)
                // All other alarm tags: true = active alarm, false = normal
                const isFalla = tag.toLowerCase().startsWith("falla_");
                const active = hasData && (
                    isFalla ? (tv.value === "false" || tv.value === "0")
                            : (tv.value === "true"  || tv.value === "1")
                );
                return {
                    tag,
                    active,
                    hasData,
                    severity: getSeverity(tag),
                    category: getCategory(tag),
                    quality: hasData ? tv.quality : "—",
                    value: hasData ? tv.value : "—",
                };
            })
            .filter(r => {
                if (filter === "active" && !r.active) return false;
                if (search && !r.tag.toLowerCase().includes(search.toLowerCase())) return false;
                return true;
            })
            .sort((a, b) => {
                if (a.active !== b.active) return a.active ? -1 : 1;
                const sevOrder = { shutdown: 0, warning: 1, info: 2 };
                if (sevOrder[a.severity] !== sevOrder[b.severity]) return sevOrder[a.severity] - sevOrder[b.severity];
                return a.tag.localeCompare(b.tag);
            });
    }, [alarmas, defaultTags, filter, search]);

    const grouped = useMemo(() => {
        const map = new Map<string, typeof rows>();
        for (const row of rows) {
            if (!map.has(row.category)) map.set(row.category, []);
            map.get(row.category)!.push(row);
        }
        return Array.from(map.entries()).sort(([, a], [, b]) => {
            const aActive = a.some(r => r.active) ? 0 : 1;
            const bActive = b.some(r => r.active) ? 0 : 1;
            return aActive - bActive;
        });
    }, [rows]);

    const totalActive = useMemo(() =>
        Object.entries(alarmas).filter(([tag, tv]) => {
            const isFalla = tag.toLowerCase().startsWith("falla_");
            return isFalla ? (tv.value === "false" || tv.value === "0")
                           : (tv.value === "true"  || tv.value === "1");
        }).length,
        [alarmas]
    );

    const total = Object.keys(alarmas).length;

    return (
        <div className="h-full flex flex-col gap-2 p-3 overflow-hidden">

            {/* Header */}
            <div className="shrink-0 flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${totalActive > 0 ? "bg-red-500/20 text-red-400 border border-red-500/40" : "bg-green-500/10 text-green-400 border border-green-500/30"}`}>
                        {totalActive > 0 ? `${totalActive} ACTIVA${totalActive > 1 ? "S" : ""}` : "SIN ALARMAS"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                        {total > 0 ? `${total} tags recibidos` : "Esperando datos..."}
                    </span>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                    <input
                        className="border border-border bg-card rounded px-2 py-1 text-[10px] w-44"
                        placeholder="Buscar tag..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <button
                        onClick={() => setFilter("all")}
                        className="rounded px-2 py-1 text-[9px] font-semibold transition-all"
                        style={{
                            background: filter === "all" ? "rgba(96,165,250,0.15)" : "transparent",
                            color: filter === "all" ? "#60a5fa" : "#9ca3af",
                            border: `1px solid ${filter === "all" ? "rgba(96,165,250,0.4)" : "rgba(96,165,250,0.15)"}`,
                        }}
                    >Todas</button>
                    <button
                        onClick={() => setFilter("active")}
                        className="rounded px-2 py-1 text-[9px] font-semibold transition-all"
                        style={{
                            background: filter === "active" ? "rgba(239,68,68,0.15)" : "transparent",
                            color: filter === "active" ? "#f87171" : "#9ca3af",
                            border: `1px solid ${filter === "active" ? "rgba(239,68,68,0.4)" : "rgba(239,68,68,0.15)"}`,
                        }}
                    >Solo activas</button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 min-h-0 overflow-auto rounded-lg border border-border">
                <table className="w-full text-[11px] border-collapse">
                    <thead className="sticky top-0 bg-card z-10">
                        <tr className="border-b border-border">
                            <th className="text-left px-3 py-2 text-[9px] uppercase tracking-widest text-muted-foreground font-semibold w-8">Est.</th>
                            <th className="text-left px-3 py-2 text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">Tag</th>
                            <th className="text-left px-3 py-2 text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">Categoría</th>
                            <th className="text-left px-3 py-2 text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">Severidad</th>
                            <th className="text-left px-3 py-2 text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">Valor</th>
                            <th className="text-left px-3 py-2 text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">Calidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground text-xs">
                                    No hay alarmas activas
                                </td>
                            </tr>
                        )}
                        {grouped.map(([category, catRows]) => (
                            <React.Fragment key={`group-${category}`}>
                                <tr className="bg-muted/10">
                                    <td colSpan={6} className="px-3 py-1 text-[8px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border/30">
                                        {category}
                                        {catRows.some(r => r.active) && (
                                            <span className="ml-2 text-red-400">● {catRows.filter(r => r.active).length} activa{catRows.filter(r => r.active).length > 1 ? "s" : ""}</span>
                                        )}
                                    </td>
                                </tr>
                                {catRows.map(row => {
                                    const dotColor = row.active
                                        ? row.severity === "shutdown" ? "bg-red-500"
                                        : row.severity === "warning"  ? "bg-yellow-400"
                                        : "bg-blue-400"
                                        : row.hasData ? "bg-muted-foreground/30" : "bg-muted-foreground/15";

                                    const rowBg = row.active
                                        ? row.severity === "shutdown" ? "bg-red-500/5 hover:bg-red-500/10"
                                        : row.severity === "warning"  ? "bg-yellow-400/5 hover:bg-yellow-400/10"
                                        : "bg-blue-400/5 hover:bg-blue-400/10"
                                        : "hover:bg-muted/10";

                                    const tagColor = row.active
                                        ? row.severity === "shutdown" ? "text-red-400 font-semibold"
                                        : row.severity === "warning"  ? "text-yellow-400 font-semibold"
                                        : "text-blue-400 font-semibold"
                                        : row.hasData ? "text-muted-foreground" : "text-muted-foreground/50";

                                    const sevLabel = row.severity === "shutdown" ? "Shutdown"
                                        : row.severity === "warning" ? "Warning"
                                        : "Info";

                                    const sevColor = row.severity === "shutdown"
                                        ? "text-red-400"
                                        : row.severity === "warning"
                                        ? "text-yellow-400"
                                        : "text-blue-400/60";

                                    const qualityColor = row.quality === "Good"
                                        ? "text-green-400/60"
                                        : row.quality === "—"
                                        ? "text-muted-foreground/40"
                                        : "text-red-400";

                                    return (
                                        <tr key={row.tag} className={`border-b border-border/20 transition-colors ${rowBg}`}>
                                            <td className="px-3 py-1.5">
                                                <span className={`inline-block w-2 h-2 rounded-full ${dotColor}`} />
                                            </td>
                                            <td className={`px-3 py-1.5 font-mono ${tagColor}`}>{row.tag}</td>
                                            <td className="px-3 py-1.5 text-muted-foreground">{row.category}</td>
                                            <td className={`px-3 py-1.5 ${sevColor} text-[9px] uppercase tracking-wider`}>{sevLabel}</td>
                                            <td className={`px-3 py-1.5 text-[9px] font-mono ${row.value === "—" ? "text-muted-foreground/40" : row.active ? tagColor : "text-muted-foreground/70"}`}>{row.value}</td>
                                            <td className={`px-3 py-1.5 text-[9px] ${qualityColor}`}>{row.quality}</td>
                                        </tr>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
