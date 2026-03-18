/**
 * Umbrales v2 — Nueva estructura de datos IoT (tag_consumer_structure)
 * Aplica a: Generador_53 y Generador_55
 *
 * Severidades:
 *   "critical" → rojo    (operación no permitida)
 *   "warning"  → amarillo (atención requerida)
 *   "info"     → azul    (informativo)
 *   "normal"   → verde   (sin umbral, siempre OK)
 *
 * Los comentarios "// REVISAR" indican valores estimados por estándar industrial.
 * Deben ser validados contra el manual del equipo o criterio del operador.
 */

export interface TagThreshold {
    label: string;
    unit: string;
    min?: number;
    max?: number;
    warning_low?: number;
    warning_high?: number;
    critical_low?: number;
    critical_high?: number;
}

// ─────────────────────────────────────────────────────────────
// GRUPO: GD / AGC_4  (Eléctrico del generador)
// ─────────────────────────────────────────────────────────────
export const THRESHOLDS_ELECTRICO: Record<string, TagThreshold> = {
    // --- RPM ---
    RPM: {
        label: "RPM",
        unit: "rpm",
        min: 0, max: 2000,
        warning_low: 1750, warning_high: 1850,
        critical_low: 1700, critical_high: 1900,
    },
    Rx_Speed: {  // GEN53 MIC5_1
        label: "RPM",
        unit: "rpm",
        min: 0, max: 2000,
        warning_low: 1750, warning_high: 1850,
        critical_low: 1700, critical_high: 1900,
    },

    // --- Frecuencia ---
    Generator_frequency_L1: { label: "Frecuencia L1", unit: "Hz", min: 58, max: 62, critical_low: 59.5, critical_high: 60.5 },
    Generator_frequency_L2: { label: "Frecuencia L2", unit: "Hz", min: 58, max: 62, critical_low: 59.5, critical_high: 60.5 },
    Generator_frequency_L3: { label: "Frecuencia L3", unit: "Hz", min: 58, max: 62, critical_low: 59.5, critical_high: 60.5 },
    BusB_frequency_L1:      { label: "Bus B Frec L1", unit: "Hz", min: 58, max: 62, critical_low: 59.5, critical_high: 60.5 },
    BusB_frequency_L2:      { label: "Bus B Frec L2", unit: "Hz", min: 58, max: 62, critical_low: 59.5, critical_high: 60.5 },
    BusB_frequency_L3:      { label: "Bus B Frec L3", unit: "Hz", min: 58, max: 62, critical_low: 59.5, critical_high: 60.5 },
    Bus_B_frequency_L1:     { label: "Bus B Frec L1", unit: "Hz", min: 58, max: 62, critical_low: 59.5, critical_high: 60.5 },
    Bus_B_frequency_L2:     { label: "Bus B Frec L2", unit: "Hz", min: 58, max: 62, critical_low: 59.5, critical_high: 60.5 },
    Bus_B_frequency_L3:     { label: "Bus B Frec L3", unit: "Hz", min: 58, max: 62, critical_low: 59.5, critical_high: 60.5 },

    // --- Voltaje Fase-Neutro ---
    Generator_voltage_L1_N: { label: "Voltaje L1-N", unit: "V", min: 1800, max: 3000, critical_low: 2163, critical_high: 2644 },
    Generator_voltage_L2_N: { label: "Voltaje L2-N", unit: "V", min: 1800, max: 3000, critical_low: 2163, critical_high: 2644 },
    Generator_voltage_L3_N: { label: "Voltaje L3-N", unit: "V", min: 1800, max: 3000, critical_low: 2163, critical_high: 2644 },

    // --- Voltaje Fase-Fase ---
    Generator_voltage_L1_L2: { label: "Voltaje L1-L2", unit: "V", min: 3000, max: 5000, critical_low: 3748, critical_high: 4578 }, // REVISAR
    Generator_voltage_L2_L3: { label: "Voltaje L2-L3", unit: "V", min: 3000, max: 5000, critical_low: 3748, critical_high: 4578 }, // REVISAR
    Generator_voltage_L3_L1: { label: "Voltaje L3-L1", unit: "V", min: 3000, max: 5000, critical_low: 3748, critical_high: 4578 }, // REVISAR
    BusB_voltage_L1_L2:      { label: "Bus B V L1-L2", unit: "V", min: 3000, max: 5000, critical_low: 3748, critical_high: 4578 }, // REVISAR
    Bus_B_voltage_L1_L2:     { label: "Bus B V L1-L2", unit: "V", min: 3000, max: 5000, critical_low: 3748, critical_high: 4578 }, // REVISAR
    Bus_B_voltage_L2_L3:     { label: "Bus B V L2-L3", unit: "V", min: 3000, max: 5000, critical_low: 3748, critical_high: 4578 }, // REVISAR
    Bus_B_voltage_L3_L1:     { label: "Bus B V L3-L1", unit: "V", min: 3000, max: 5000, critical_low: 3748, critical_high: 4578 }, // REVISAR

    // --- Corriente ---
    Generator_current_L1: { label: "Corriente L1", unit: "A", min: 0, max: 200, warning_high: 120, critical_high: 150 },
    Generator_current_L2: { label: "Corriente L2", unit: "A", min: 0, max: 200, warning_high: 120, critical_high: 150 },
    Generator_current_L3: { label: "Corriente L3", unit: "A", min: 0, max: 200, warning_high: 120, critical_high: 150 },

    // --- Potencia ---
    Generator_active_power:    { label: "Potencia Activa", unit: "kW",   min: 0, max: 1200 },
    Generator_active_power_L1: { label: "Potencia Activa L1", unit: "kW", min: 0, max: 400 },
    Generator_active_power_L2: { label: "Potencia Activa L2", unit: "kW", min: 0, max: 400 },
    Generator_active_power_L3: { label: "Potencia Activa L3", unit: "kW", min: 0, max: 400 },
    Potencia_Generador:        { label: "Potencia Generador", unit: "kW",  min: 0, max: 1200 },
    Generator_apparent_power:    { label: "Potencia Aparente",    unit: "kVA", min: 0, max: 1500 },
    Generator_apparent_power_L1: { label: "Potencia Aparente L1", unit: "kVA", min: 0, max: 500 },
    Generator_apparent_power_L2: { label: "Potencia Aparente L2", unit: "kVA", min: 0, max: 500 },
    Generator_apparent_power_L3: { label: "Potencia Aparente L3", unit: "kVA", min: 0, max: 500 },
    Generator_reactive_power:    { label: "Potencia Reactiva",    unit: "kVAR", min: -500, max: 500 },
    Generator_reactive_power_L1: { label: "Potencia Reactiva L1", unit: "kVAR", min: -200, max: 200 },
    Generator_reactive_power_L2: { label: "Potencia Reactiva L2", unit: "kVAR", min: -200, max: 200 },
    Generator_reactive_power_L3: { label: "Potencia Reactiva L3", unit: "kVAR", min: -200, max: 200 },
    Generator_power_L1: { label: "Potencia L1", unit: "kW", min: 0, max: 400 },
    Generator_power_L2: { label: "Potencia L2", unit: "kW", min: 0, max: 400 },
    Generator_power_L3: { label: "Potencia L3", unit: "kW", min: 0, max: 400 },

    // --- Factor de potencia ---
    Generator_PF: { label: "Factor de Potencia", unit: "", min: 0, max: 1, info_low: 0.828, warning_low: 0.75 },

    // --- Energía exportada (acumulado, sin alarma) ---
    EnergiaExp: { label: "Energía Exportada", unit: "kWh", min: 0, max: 999999 },

    // --- Excitación y batería (GEN55 AGC_4) ---
    IexcGen:    { label: "Corriente Excitación", unit: "A",  min: 0,  max: 20,  warning_high: 15 },   // REVISAR
    VDCbattery: { label: "Voltaje Batería DC",   unit: "V",  min: 20, max: 30,  warning_low: 24, critical_low: 22 }, // REVISAR
    FreqEscale: { label: "Escala Frecuencia",    unit: "",   min: 0,  max: 100 },
};

// ─────────────────────────────────────────────────────────────
// GRUPO: Engine_1  (Motor / Mecánico)
// ─────────────────────────────────────────────────────────────
export const THRESHOLDS_MOTOR: Record<string, TagThreshold> = {
    // --- Temperatura cilindros (°F — Waukesha F18 referencia) ---
    ...Object.fromEntries(
        Array.from({ length: 20 }, (_, i) => [
            `Tem_Cyl_${i + 1}`,
            { label: `Temp Cilindro ${i + 1}`, unit: "°F", min: 300, max: 750, warning_high: 590, critical_high: 620 }
        ])
    ),
    Promedio_tem_cyl:       { label: "Promedio Temp Cilindros", unit: "°F", min: 300, max: 750, warning_high: 580, critical_high: 610 },
    delta_temp_cylinders:   { label: "Delta Temp Cilindros",    unit: "°F", min: 0,   max: 100, warning_high: 35,  critical_high: 50  },

    // --- Temperatura devanados (°C) ---
    Devanado_U: { label: "Devanado U", unit: "°C", min: 0, max: 120, warning_high: 75, critical_high: 85 },
    Devanado_V: { label: "Devanado V", unit: "°C", min: 0, max: 120, warning_high: 75, critical_high: 85 },
    Devanado_W: { label: "Devanado W", unit: "°C", min: 0, max: 120, warning_high: 75, critical_high: 85 },

    // --- Aceite ---
    Temp_Aceite:       { label: "Temp Aceite",      unit: "°C",  min: 20, max: 120, warning_high: 80, critical_high: 90 },
    Temperatura_aceite:{ label: "Temp Aceite",      unit: "°C",  min: 20, max: 120, warning_high: 80, critical_high: 90 },
    Pres_Aceite_Motor: { label: "Presión Aceite",   unit: "bar", min: 0,  max: 8,   warning_low: 1.0, critical_low: 0.8 },
    Presion_aceite:    { label: "Presión Aceite",   unit: "bar", min: 0,  max: 8,   warning_low: 1.0, critical_low: 0.8 },

    // --- Refrigerante HT ---
    Temp_Refrigerante_HT_Salida:  { label: "Refrigerante HT Salida",  unit: "°C", min: 40, max: 110, warning_high: 88, critical_high: 95 },
    Temp_Refrigerante_HT_Entrada: { label: "Refrigerante HT Entrada", unit: "°C", min: 30, max: 100, warning_high: 70, critical_high: 80 }, // REVISAR
    Tem_HT_ref_salida:            { label: "Refrigerante HT Salida",  unit: "°C", min: 40, max: 110, warning_high: 88, critical_high: 95 },
    T_HT_ENTREDA:                 { label: "Refrigerante HT Entrada", unit: "°C", min: 30, max: 100, warning_high: 70, critical_high: 80 }, // REVISAR

    // --- Refrigerante LT ---
    Temp_Refrigerante_LT_Salida:  { label: "Refrigerante LT Salida",  unit: "°C", min: 20, max: 80, warning_high: 55, critical_high: 65 }, // REVISAR
    Temp_Refrigerante_LT_Entrada: { label: "Refrigerante LT Entrada", unit: "°C", min: 10, max: 70, warning_high: 48, critical_high: 58 }, // REVISAR
    Temp_LT_salida:               { label: "Refrigerante LT Salida",  unit: "°C", min: 20, max: 80, warning_high: 55, critical_high: 65 }, // REVISAR

    // --- Gas ---
    Pres_Gas_Entrada_Motor: { label: "Presión Gas Entrada", unit: "bar", min: 0, max: 10, warning_low: 2.0, critical_low: 1.5 },
    Pres_Gas_Entrada_PSI:   { label: "Presión Gas Entrada", unit: "PSI", min: 0, max: 150, warning_low: 29,  critical_low: 22  },
    Temp_Gas_Entrada:       { label: "Temp Gas Entrada",    unit: "°C",  min: 0, max: 60,  warning_high: 45, critical_high: 55 }, // REVISAR

    // --- Aire ---
    Temp_Aire_Blower:       { label: "Temp Aire Blower",       unit: "°C", min: 0, max: 100, warning_high: 60, critical_high: 75 }, // REVISAR
    Temp_Aire_Filtro_Motor: { label: "Temp Aire Filtro Motor", unit: "°C", min: 0, max: 80,  warning_high: 50, critical_high: 65 }, // REVISAR
    Tempe_filtro:           { label: "Temp Filtro",            unit: "°C", min: 0, max: 80,  warning_high: 50, critical_high: 65 }, // REVISAR
    MAT:                    { label: "Temp Aire Admisión",     unit: "°C", min: 0, max: 80,  warning_high: 55, critical_high: 65 }, // REVISAR (Manifold Air Temp)

    // --- MAP (Manifold Air Pressure) ---
    MAP:    { label: "MAP",    unit: "mbar", min: 800, max: 2500, warning_low: 1100, critical_low: 1000 }, // REVISAR
    MAP_P1: { label: "MAP P1", unit: "mbar", min: 800, max: 2500, warning_low: 1100, critical_low: 1000 }, // REVISAR
    MAP_P2: { label: "MAP P2", unit: "mbar", min: 800, max: 2500, warning_low: 1100, critical_low: 1000 }, // REVISAR

    // --- Presión LT ---
    Presion_LT: { label: "Presión LT", unit: "bar", min: 0, max: 5, warning_low: 0.3, critical_low: 0.2 }, // REVISAR

    // --- Diferencial presión filtro ---
    PresDiff: { label: "Presión Diferencial", unit: "mbar", min: 0, max: 200, warning_high: 80, critical_high: 120 }, // REVISAR

    // --- Feedback / Posiciones (%) — sin alarma de proceso, solo rango ---
    Feedback_Throttle:   { label: "Feedback Throttle",    unit: "%", min: 0, max: 100 },
    Feedback_TBypass_1:  { label: "Feedback T-Bypass 1",  unit: "%", min: 0, max: 100 },
    Feedback_TBypass_2:  { label: "Feedback T-Bypass 2",  unit: "%", min: 0, max: 100 },
    feedback_3_vias:     { label: "Feedback Válvula 3 Vías", unit: "%", min: 0, max: 100 },
    pos_bypass:          { label: "Posición Bypass",      unit: "%", min: 0, max: 100 },
    pos_throttle:        { label: "Posición Throttle",    unit: "%", min: 0, max: 100 },
    MandoMixer:          { label: "Mando Mixer",          unit: "%", min: 0, max: 100 },
};

// ─────────────────────────────────────────────────────────────
// GRUPO: GVL_HMI_3  (Vibraciones + Bobinas — GEN55)
// ─────────────────────────────────────────────────────────────
export const THRESHOLDS_VIBRACIONES: Record<string, TagThreshold> = {
    // Vibración cilindros (mm/s — ISO 10816 referencia Clase II)
    ...Object.fromEntries(
        [1,2,3,5,6,7,8,11,12,13,14,15,16,17,18,19,20].map(i => [
            `rVib_Cil_${i}`,
            { label: `Vibración Cil ${i}`, unit: "mm/s", min: 0, max: 30, warning_high: 7.1, critical_high: 11.2 } // REVISAR
        ])
    ),

    // Voltaje bobinas secundarias (V — REVISAR rango real del equipo)
    ...Object.fromEntries([
        ...Array.from({ length: 10 }, (_, i) => [`rVolt_Bob_A${i+1}`, { label: `Voltaje Bob A${i+1}`, unit: "V", min: 0, max: 120, warning_low: 30, warning_high: 80 }]),
        ...Array.from({ length: 10 }, (_, i) => [`rVolt_Bob_B${i+1}`, { label: `Voltaje Bob B${i+1}`, unit: "V", min: 0, max: 120, warning_low: 30, warning_high: 80 }]),
    ]),
};

// ─────────────────────────────────────────────────────────────
// GRUPO: MIC5_1  (Bobinas secundarias — GEN53)
// ─────────────────────────────────────────────────────────────
export const THRESHOLDS_BOBINAS_GEN53: Record<string, TagThreshold> = {
    ...Object.fromEntries([
        ...Array.from({ length: 10 }, (_, i) => [`Rx_Est_Sec_Volt_A${i+1}`, { label: `Voltaje Bob A${i+1}`, unit: "V", min: 0, max: 120, warning_low: 20, warning_high: 80 }]), // REVISAR
        ...Array.from({ length: 10 }, (_, i) => [`Rx_Est_Sec_Volt_B${i+1}`, { label: `Voltaje Bob B${i+1}`, unit: "V", min: 0, max: 120, warning_low: 20, warning_high: 80 }]), // REVISAR
    ]),
};

// ─────────────────────────────────────────────────────────────
// GRUPO: Detcon20_1  (Detección de gas — GEN53)
// ─────────────────────────────────────────────────────────────
export const THRESHOLDS_GAS_DETCON: Record<string, TagThreshold> = {
    // Rx_Knc_Int: concentración de gas (% LEL típico — REVISAR con Detcon20)
    ...Object.fromEntries(
        Array.from({ length: 20 }, (_, i) => [
            `Rx_Knc_Int_${i+1}`,
            { label: `Gas Sensor ${i+1}`, unit: "% LEL", min: 0, max: 100, warning_high: 20, critical_high: 40 } // REVISAR
        ])
    ),
};

// ─────────────────────────────────────────────────────────────
// GRUPO: raiz  (GEN55)
// ─────────────────────────────────────────────────────────────
export const THRESHOLDS_RAIZ: Record<string, TagThreshold> = {
    TEC_FLUJO_CALCULADO: { label: "Flujo Calculado", unit: "m³/h", min: 0, max: 5000 }, // REVISAR
};

// ─────────────────────────────────────────────────────────────
// Mapa unificado — para lookup por displayName
// ─────────────────────────────────────────────────────────────
export const ALL_THRESHOLDS: Record<string, TagThreshold> = {
    ...THRESHOLDS_ELECTRICO,
    ...THRESHOLDS_MOTOR,
    ...THRESHOLDS_VIBRACIONES,
    ...THRESHOLDS_BOBINAS_GEN53,
    ...THRESHOLDS_GAS_DETCON,
    ...THRESHOLDS_RAIZ,
};

/**
 * Evalúa el estado de un valor según sus umbrales.
 * Retorna: "critical" | "warning" | "info" | "normal"
 */
export type ThresholdStatus = "critical" | "warning" | "info" | "normal";

export function getThresholdStatus(displayName: string, value: number): ThresholdStatus {
    const t = ALL_THRESHOLDS[displayName];
    if (!t) return "normal";

    if (
        (t.critical_high !== undefined && value >= t.critical_high) ||
        (t.critical_low  !== undefined && value <= t.critical_low)
    ) return "critical";

    if (
        (t.warning_high !== undefined && value >= t.warning_high) ||
        (t.warning_low  !== undefined && value <= t.warning_low)
    ) return "warning";

    if (
        ((t as Record<string,number>).info_low  !== undefined && value <= (t as Record<string,number>).info_low) ||
        ((t as Record<string,number>).info_high !== undefined && value >= (t as Record<string,number>).info_high)
    ) return "info";

    return "normal";
}

/**
 * Retorna el color Tailwind correspondiente al estado.
 */
export function getStatusColor(status: ThresholdStatus) {
    switch (status) {
        case "critical": return { text: "text-red-500",    bg: "bg-red-500/10",    border: "border-red-500" };
        case "warning":  return { text: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400" };
        case "info":     return { text: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400" };
        default:         return { text: "text-[#00ffc2]",  bg: "bg-[#00ffc2]/10",  border: "border-[#00ffc2]" };
    }
}
