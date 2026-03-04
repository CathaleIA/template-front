/**
 * Umbrales de operación para equipos industriales (Basados en AWS Alarm Processors).
 * Estos valores se usarán para detectar anomalías y estados críticos.
 */
export const INDUSTRIAL_THRESHOLDS = {
    generator: {
        breaker: {
            fault: { threshold: true, operator: '==', severity: 'critical', message: 'Falla en Breaker detectada' }
        },
        voltage_L_N: {
            critical_high: 2644,
            critical_low: 2163,
            unit: 'V',
            label: 'Voltaje Fase-Neutro'
        },
        current: {
            warning_high: 110,
            unit: 'A',
            label: 'Corriente por Fase'
        },
        frequency: {
            critical_high: 60.5,
            critical_low: 59.5,
            unit: 'Hz',
            label: 'Frecuencia'
        },
        temperature: {
            windings: {
                critical_high: 85,
                unit: '°C',
                label: 'Temperatura Devanados (U/V/W)'
            },
            bearings: {
                warning_high: 72,
                unit: '°C',
                label: 'Temperatura Rodamientos'
            }
        },
        metrics: {
            current_imbalance: { warning_high: 10.67, unit: '%', label: 'Desbalance de Corriente' },
            power_factor_low: { info_low: 0.828, label: 'Factor de Potencia Bajo' },
            delta_voltage: { warning_limit: 5, unit: 'V', label: 'Delta Voltaje Barra' }
        }
    },
    // Reglas literales extraídas de la Lambda para el Agente Bedrock
    ALARM_RULES: [
        // CRÍTICAS
        { id: 'breaker_fault', path: 'data.breaker.fault.value', operator: '==', threshold: true, severity: 'critical', message: 'Falla en Breaker detectada' },
        { id: 'freq_high', path: 'data.generator.frecuencia.value', operator: '>', threshold: 60.5, severity: 'critical', message: 'Frecuencia fuera de rango (alta)' },
        { id: 'freq_low', path: 'data.generator.frecuencia.value', operator: '<', threshold: 59.5, severity: 'critical', message: 'Frecuencia fuera de rango (baja)' },

        // TEMPERATURAS
        { id: 'temp_devanado_u', path: 'data.temperature.devanado_u.value', operator: '>', threshold: 85, severity: 'critical', message: 'Temperatura Devanado U excesiva' },
        { id: 'temp_devanado_v', path: 'data.temperature.devanado_v.value', operator: '>', threshold: 85, severity: 'critical', message: 'Temperatura Devanado V excesiva' },
        { id: 'temp_devanado_w', path: 'data.temperature.devanado_w.value', operator: '>', threshold: 85, severity: 'critical', message: 'Temperatura Devanado W excesiva' },
        { id: 'temp_rodamiento_delantero', path: 'data.temperature.rodamiento_delantero.value', operator: '>', threshold: 72, severity: 'warning', message: 'Temperatura Rodamiento Delantero alta' },
        { id: 'temp_rodamiento_trasero', path: 'data.temperature.rodamiento_trasero.value', operator: '>', threshold: 72, severity: 'warning', message: 'Temperatura Rodamiento Trasero alta' },

        // CORRIENTES
        { id: 'corriente_L1_high', path: 'data.generator.corriente_L1.value', operator: '>', threshold: 110, severity: 'warning', message: 'Corriente L1 elevada' },
        { id: 'corriente_L2_high', path: 'data.generator.corriente_L2.value', operator: '>', threshold: 110, severity: 'warning', message: 'Corriente L2 elevada' },
        { id: 'corriente_L3_high', path: 'data.generator.corriente_L3.value', operator: '>', threshold: 110, severity: 'warning', message: 'Corriente L3 elevada' },

        // VOLTAJES
        { id: 'voltage_L1_N_high', path: 'data.generator.voltage_L1_N.value', operator: '>', threshold: 2644, severity: 'warning', message: 'Voltaje L1-N alto' },
        { id: 'voltage_L1_N_low', path: 'data.generator.voltage_L1_N.value', operator: '<', threshold: 2163, severity: 'warning', message: 'Voltaje L1-N bajo' },
        { id: 'voltage_L2_N_high', path: 'data.generator.voltage_L2_N.value', operator: '>', threshold: 2644, severity: 'warning', message: 'Voltaje L2-N alto' },
        { id: 'voltage_L2_N_low', path: 'data.generator.voltage_L2_N.value', operator: '<', threshold: 2163, severity: 'warning', message: 'Voltaje L2-N bajo' },
        { id: 'voltage_L3_N_high', path: 'data.generator.voltage_L3_N.value', operator: '>', threshold: 2644, severity: 'warning', message: 'Voltaje L3-N alto' },
        { id: 'voltage_L3_N_low', path: 'data.generator.voltage_L3_N.value', operator: '<', threshold: 2163, severity: 'warning', message: 'Voltaje L3-N bajo' },

        /*
        // MOTOR - ACEITE Y REFRIGERACIÓN
        { id: 'motor_temp_aceite_high', path: 'data.oil_system.Temperatura_aceite.value', operator: '>', threshold: 90.0, severity: 'critical', message: 'Temperatura de aceite crítica' },
        { id: 'motor_presion_aceite_low', path: 'data.oil_system.Presion_aceite.value', operator: '<', threshold: 0.8, severity: 'critical', message: 'Presión de aceite insuficiente' },
        { id: 'motor_temp_ht_salida_high', path: 'data.cooling_system.Tem_HT_ref_salida.value', operator: '>', threshold: 95.0, severity: 'critical', message: 'Sobrecalentamiento Refrigerante HT' },
        { id: 'motor_presion_ht_low', path: 'data.cooling_system.Presion_HT.value', operator: '<', threshold: 0.3, severity: 'warning', message: 'Baja presión de refrigerante HT' },

        // MOTOR - CILINDROS (Muestra de reglas críticas)
        { id: 'motor_promedio_temp_cyl_high', path: 'data.cylinders.Promedio_tem_cyl.value', operator: '>', threshold: 610.0, severity: 'critical', message: 'Temperatura promedio de cilindros crítica' },
        { id: 'motor_diff_temp_cyl_high', path: 'data.cylinders.Diferencia_temp_clynders.value', operator: '>', threshold: 35.0, severity: 'warning', message: 'Desbalance térmico entre cilindros' },

        // DINÁMICO: Reglas para los 20 cilindros (Ejemplo de mapeo)
        ...Array.from({ length: 20 }, (_, i) => ({
            id: `motor_cyl_${i + 1}_high`,
            path: `data.cylinders.Tem_Cyl_${i + 1}.value`,
            operator: '>',
            threshold: 620.0,
            severity: 'critical' as const,
            message: `Temperatura excesiva en Cilindro ${i + 1}`
        })),
        */

        // OTROS
        { id: 'desbalance_corriente', path: 'data.generator.desbalance_corriente.value', operator: '>', threshold: 10.67, severity: 'warning', message: 'Desbalance de corriente elevado' },
        { id: 'factor_potencia_low', path: 'data.generator.factor_potencia.value', operator: '<', threshold: 0.828, severity: 'info', message: 'Factor de potencia bajo' }
    ]
};

export type Thresholds = typeof INDUSTRIAL_THRESHOLDS;

