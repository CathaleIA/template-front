import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
    region: process.env.AWS_BEDROCK_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

// Tipos basados en tu estructura JSON
interface SensorValue {
    value: number | boolean;
    timestamp: string;
}

export interface GeneratorData {
    timestamp: string;
    device_id: string;
    device_type: string;
    data: {
        generator: {
            potencia_activa: SensorValue;
            potencia_aparente: SensorValue;
            potencia_reactiva: SensorValue;
            factor_potencia: SensorValue;
            frecuencia: SensorValue;
            corriente_L1: SensorValue;
            corriente_L2: SensorValue;
            corriente_L3: SensorValue;
            voltage_L1_L2: SensorValue;
            voltage_L2_L3: SensorValue;
            voltage_L1_L3: SensorValue;
            voltage_L1_N: SensorValue;
            voltage_L2_N: SensorValue;
            voltage_L3_N: SensorValue;
            promedio_corrientes: SensorValue;
            promedio_voltajes: SensorValue;
            [key: string]: SensorValue;
        };
        busbar: {
            voltage_L1_L2: SensorValue;
            voltage_L2_L3: SensorValue;
            voltage_L1_L3: SensorValue;
            frecuencia: SensorValue;
            [key: string]: SensorValue;
        };
        breaker: {
            voltage_freq_ok: SensorValue;
            opened: SensorValue;
            closed: SensorValue;
            fault: SensorValue;
            [key: string]: SensorValue;
        };
        temperature: {
            devanado_u: SensorValue;
            devanado_v: SensorValue;
            devanado_w: SensorValue;
            rodamiento_delantero: SensorValue;
            rodamiento_trasero: SensorValue;
        };
    };
    metadata: {
        variables_count: number;
        last_update: string;
    };
    ingestion_time: string;
    source: string;
}

export interface MotorData {
    timestamp: string;
    device_id: string;
    device_type: string;
    data: {
        cylinders: {
            [key: string]: SensorValue; // Tem_Cyl_1 a Tem_Cyl_20, etc.
        };
        cooling_system: {
            Temp_LT_salida: SensorValue;
            T_HT_ENTRADA: SensorValue;
            Tem_HT_ref_salida: SensorValue;
            Presion_HT: SensorValue;
        };
        oil_system: {
            Temperatura_aceite: SensorValue;
            Tempe_filtro: SensorValue;
            Presion_aceite: SensorValue;
        };
    };
    metadata: {
        variables_count: number;
        last_update: string;
    };
    ingestion_time: string;
    source: string;
}

export type IoTData = GeneratorData | MotorData;

/**
 * Construye el prefijo S3 para un rango de fechas
 */
function buildS3Prefixes(startDate: Date, endDate: Date): string[] {
    const prefixes: string[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
        const year = current.getUTCFullYear();
        const month = String(current.getUTCMonth() + 1).padStart(2, '0');
        const day = String(current.getUTCDate()).padStart(2, '0');

        prefixes.push(`telemetry/${year}/${month}/${day}/`);

        current.setDate(current.getDate() + 1);
    }

    return prefixes;
}

/**
 * Obtiene datos históricos de S3 para un rango de fechas
 */
export async function getHistoricalData(
    startDate: Date,
    endDate: Date,
    dataType?: 'generator' | 'motor'
): Promise<IoTData[]> {
    const bucket = process.env.S3_IOT_BUCKET!;
    const prefixes = buildS3Prefixes(startDate, endDate);

    const allData: IoTData[] = [];

    // Ahora que usamos prefijos por día, tomamos los últimos 5 días si la lista es muy larga
    let prefixesToSearch = prefixes;
    if (prefixes.length > 5) {
        prefixesToSearch = prefixes.slice(-5);
    }

    console.log(`🔍 Searching ${prefixesToSearch.length} S3 prefixes (day-level)...`);

    for (const prefix of prefixesToSearch) {
        console.log(`📂 Checking prefix: ${prefix}`);
        try {
            const listCommand = new ListObjectsV2Command({
                Bucket: bucket,
                Prefix: prefix,
                MaxKeys: 1000, // Aumentar límite para capturar más archivos por día
            });

            const { Contents } = await s3Client.send(listCommand);

            if (!Contents || Contents.length === 0) {
                console.log(`📭 No files found in prefix: ${prefix}`);
                continue;
            }

            console.log(`📦 Found ${Contents.length} objects in ${prefix}`);

            // Limitar archivos para evitar timeout (tomar muestra representativa)
            const MAX_FILES_TO_PROCESS = 200;
            let filesToProcess = Contents.filter(obj => obj.Key?.endsWith('.json'));

            if (filesToProcess.length > MAX_FILES_TO_PROCESS) {
                // Tomar muestra distribuida uniformemente
                const step = Math.floor(filesToProcess.length / MAX_FILES_TO_PROCESS);
                filesToProcess = filesToProcess.filter((_, index) => index % step === 0).slice(0, MAX_FILES_TO_PROCESS);
                console.log(`⚠️ Sampling ${filesToProcess.length} files from ${Contents.length} total (every ${step}th file)`);
            }

            // Leer archivos JSON
            for (const obj of filesToProcess) {

                try {
                    const getCommand = new GetObjectCommand({
                        Bucket: bucket,
                        Key: obj.Key,
                    });

                    const response = await s3Client.send(getCommand);
                    const bodyString = await response.Body?.transformToString();

                    if (!bodyString) continue;

                    const jsonData = JSON.parse(bodyString);

                    // Filtrar por tipo si se especifica
                    const isGenerator = 'generator' in (jsonData.data || {});
                    const isMotor = 'cylinders' in (jsonData.data || {});

                    if (dataType === 'generator' && !isGenerator) continue;
                    if (dataType === 'motor' && !isMotor) continue;

                    // Filtrar por rango de fechas (con margen de 24h para compensar zonas horarias)
                    const dataTimestamp = new Date(jsonData.timestamp);
                    const adjustedStart = new Date(startDate.getTime() - 24 * 60 * 60 * 1000); // 24h antes
                    const adjustedEnd = new Date(endDate.getTime() + 24 * 60 * 60 * 1000); // 24h después

                    if (dataTimestamp >= adjustedStart && dataTimestamp <= adjustedEnd) {
                        allData.push(jsonData);

                        // Log solo los primeros 3 para debug
                        if (allData.length <= 3) {
                            console.log(`✅ Added record with timestamp: ${jsonData.timestamp}`);
                        }
                    }
                } catch (err) {
                    console.error(`Error reading file ${obj.Key}: `, err);
                }
            }
        } catch (err) {
            console.error(`Error listing prefix ${prefix}: `, err);
        }
    }

    return allData;
}

/**
 * Crea un resumen inteligente de los datos para el contexto de Bedrock
 */
export function summarizeData(data: IoTData[]): string {
    if (data.length === 0) return 'No hay datos disponibles para el período solicitado.';

    const generatorData = data.filter(d => 'generator' in (d.data || {})) as GeneratorData[];
    const motorData = data.filter(d => 'cylinders' in (d.data || {})) as MotorData[];

    let summary = `Resumen de ${data.length} registros: \n\n`;

    // Resumen de datos del generador
    if (generatorData.length > 0) {
        summary += `📊 GENERADOR(${generatorData.length} registros): \n`;

        const potencias = generatorData.map(d => d.data.generator.potencia_activa.value as number);
        const voltajes = generatorData.map(d => d.data.generator.promedio_voltajes.value as number);
        const corrientes = generatorData.map(d => d.data.generator.promedio_corrientes.value as number);
        const frecuencias = generatorData.map(d => d.data.generator.frecuencia.value as number);
        const tempDevanados = generatorData.map(d => d.data.temperature.devanado_u.value as number);

        summary += `  • Potencia Activa: ${Math.min(...potencias).toFixed(1)} - ${Math.max(...potencias).toFixed(1)} kW(Promedio: ${(potencias.reduce((a, b) => a + b, 0) / potencias.length).toFixed(1)} kW) \n`;
        summary += `  • Voltaje Promedio: ${Math.min(...voltajes).toFixed(1)} - ${Math.max(...voltajes).toFixed(1)} V(Promedio: ${(voltajes.reduce((a, b) => a + b, 0) / voltajes.length).toFixed(1)} V) \n`;
        summary += `  • Corriente Promedio: ${Math.min(...corrientes).toFixed(1)} - ${Math.max(...corrientes).toFixed(1)} A(Promedio: ${(corrientes.reduce((a, b) => a + b, 0) / corrientes.length).toFixed(1)} A) \n`;
        summary += `  • Frecuencia: ${Math.min(...frecuencias).toFixed(2)} - ${Math.max(...frecuencias).toFixed(2)} Hz\n`;
        summary += `  • Temperatura Devanados: ${Math.min(...tempDevanados).toFixed(1)} - ${Math.max(...tempDevanados).toFixed(1)} °C\n`;

        // Estado del breaker (último registro)
        const lastGen = generatorData[generatorData.length - 1];
        summary += `  • Breaker: ${lastGen.data.breaker.closed.value ? 'CERRADO' : 'ABIERTO'} `;
        if (lastGen.data.breaker.fault.value) summary += ' ⚠️ FALLA DETECTADA';
        summary += '\n';
    }

    // Resumen de datos del motor
    if (motorData.length > 0) {
        summary += `\n🔧 MOTOR(${motorData.length} registros): \n`;

        const tempCilindros = motorData.flatMap(d =>
            Object.entries(d.data.cylinders)
                .filter(([key]) => key.startsWith('Tem_Cyl_'))
                .map(([_, val]) => val.value as number)
        );
        const tempAceite = motorData.map(d => d.data.oil_system.Temperatura_aceite.value as number);
        const presionAceite = motorData.map(d => d.data.oil_system.Presion_aceite.value as number);
        const tempLT = motorData.map(d => d.data.cooling_system.Temp_LT_salida.value as number);

        summary += `  • Temperatura Cilindros: ${Math.min(...tempCilindros).toFixed(1)} - ${Math.max(...tempCilindros).toFixed(1)} °C(Promedio: ${(tempCilindros.reduce((a, b) => a + b, 0) / tempCilindros.length).toFixed(1)} °C) \n`;
        summary += `  • Temperatura Aceite: ${Math.min(...tempAceite).toFixed(1)} - ${Math.max(...tempAceite).toFixed(1)} °C\n`;
        summary += `  • Presión Aceite: ${Math.min(...presionAceite).toFixed(2)} - ${Math.max(...presionAceite).toFixed(2)} bar\n`;
        summary += `  • Temperatura LT Salida: ${Math.min(...tempLT).toFixed(1)} - ${Math.max(...tempLT).toFixed(1)} °C\n`;

        // Diferencia de temperatura entre cilindros (último registro)
        const lastMotor = motorData[motorData.length - 1];
        if (lastMotor.data.cylinders.Diferencia_temp_clynders) {
            summary += `  • Diferencia Temp.Cilindros: ${lastMotor.data.cylinders.Diferencia_temp_clynders.value} °C\n`;
        }
    }

    // Período de tiempo
    const timestamps = data.map(d => new Date(d.timestamp));
    const firstTime = new Date(Math.min(...timestamps.map(t => t.getTime())));
    const lastTime = new Date(Math.max(...timestamps.map(t => t.getTime())));

    summary += `\n⏱️ Período: ${firstTime.toLocaleString('es-ES')} - ${lastTime.toLocaleString('es-ES')} `;

    return summary;
}

/**
 * Obtiene el último dato disponible (más reciente)
 */
export async function getLatestData(): Promise<IoTData[]> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    return getHistoricalData(oneHourAgo, now);
}
