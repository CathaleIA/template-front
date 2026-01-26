/**
 * Umbrales de operación para equipos industriales.
 * Estos valores se usarán para detectar anomalías y estados cercanos al límite.
 */
export const INDUSTRIAL_THRESHOLDS = {
    generator: {
        voltage_L_N: {
            min: 100, // Voltios
            max: 130,
            unit: 'V',
            label: 'Voltaje Fase-Neutro'
        },
        current: {
            max: 50, // Amperios (Ejemplo)
            unit: 'A',
            label: 'Corriente'
        },
        frequency: {
            min: 58,
            max: 62,
            unit: 'Hz',
            label: 'Frecuencia'
        }
    },
    engine: {
        cylinders: {
            temp: {
                max: 600, // Celsius
                warning: 550,
                unit: '°C',
                label: 'Temperatura de Cilindro'
            }
        },
        oil_system: {
            temp: {
                max: 110,
                unit: '°C',
                label: 'Temperatura de Aceite'
            },
            pressure: {
                min: 2.5,
                max: 6.0,
                unit: 'bar',
                label: 'Presión de Aceite'
            }
        },
        cooling_system: {
            temp_in: {
                max: 95,
                unit: '°C',
                label: 'Temperatura Entrada HT'
            }
        }
    }
};

export type Thresholds = typeof INDUSTRIAL_THRESHOLDS;
