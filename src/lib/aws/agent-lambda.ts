/**
 * AWS Lambda Handler para Bedrock Agent
 * 
 * Este archivo contiene la lógica que el Agente de Bedrock llamará para:
 * 1. Consultar datos de IoT (Athena)
 * 2. Verificar umbrales
 * 3. Obtener datos en tiempo real
 * 
 * NOTA: Este archivo debe ser desplegado como una función Lambda en AWS.
 * Para desarrollo local, puedes usar SAM CLI o simplemente desplegarlo directamente.
 */

import { Handler } from 'aws-lambda';
import { AthenaClient, StartQueryExecutionCommand, GetQueryExecutionCommand, GetQueryResultsCommand } from '@aws-sdk/client-athena';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { IoTDataPlaneClient, GetThingShadowCommand } from '@aws-sdk/client-iot-data-plane';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// Configuración de clientes AWS
const athenaClient = new AthenaClient({ region: process.env.AWS_REGION || 'us-east-1' });
const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_BEDROCK_REGION || 'us-east-1' });
const iotDataClient = new IoTDataPlaneClient({ region: process.env.AWS_REGION || 'us-east-1' });
const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

// Umbrales (deberían coincidir con src/config/thresholds.ts)
const THRESHOLDS = {
    generator: {
        voltage_L_N: { min: 100, max: 130, unit: 'V' },
        current: { max: 50, unit: 'A' },
        frequency: { min: 58, max: 62, unit: 'Hz' }
    },
    engine: {
        cylinders: { temp: { max: 600, warning: 550, unit: '°C' } },
        oil_system: {
            temp: { max: 110, unit: '°C' },
            pressure: { min: 2.5, max: 6.0, unit: 'bar' }
        },
        cooling_system: { temp_in: { max: 95, unit: '°C' } }
    }
};

interface AgentEvent {
    apiPath: string;
    httpMethod: string;
    requestBody: {
        content: {
            [key: string]: any;
        };
    };
}

/**
 * Ejecuta una consulta SQL en Athena
 */
async function executeAthenaQuery(sql: string): Promise<any[]> {
    const database = process.env.ATHENA_DATABASE || 'iot_telemetry_db';
    const outputBucket = process.env.AWS_S3_IOT_BUCKET || '';
    const outputLocation = `s3://${outputBucket}/athena-results/`;

    // Iniciar ejecución
    const startCommand = new StartQueryExecutionCommand({
        QueryString: sql,
        QueryExecutionContext: { Database: database },
        ResultConfiguration: { OutputLocation: outputLocation }
    });

    const { QueryExecutionId } = await athenaClient.send(startCommand);

    if (!QueryExecutionId) {
        throw new Error('Failed to start Athena query');
    }

    // Esperar a que complete
    let status = 'RUNNING';
    let attempts = 0;
    const maxAttempts = 400; // Aumentado a 120 segundos (400 * 300ms) para consultas pesadas

    while (status === 'RUNNING' || status === 'QUEUED') {
        if (attempts++ > maxAttempts) {
            throw new Error('Athena query timeout');
        }

        await new Promise(resolve => setTimeout(resolve, 300)); // Polling más rápido para Bedrock

        const getCommand = new GetQueryExecutionCommand({ QueryExecutionId });
        const execution = await athenaClient.send(getCommand);
        status = execution.QueryExecution?.Status?.State || 'FAILED';

        if (status === 'FAILED' || status === 'CANCELLED') {
            throw new Error(`Athena query failed: ${execution.QueryExecution?.Status?.StateChangeReason}`);
        }
    }

    // Obtener resultados
    const resultsCommand = new GetQueryResultsCommand({ QueryExecutionId });
    const results = await athenaClient.send(resultsCommand);

    const rows = results.ResultSet?.Rows || [];
    if (rows.length <= 1) return [];

    const headers = rows[0].Data?.map(d => d.VarCharValue || '') || [];
    return rows.slice(1).map(row => {
        const obj: any = {};
        row.Data?.forEach((cell, idx) => {
            obj[headers[idx]] = cell.VarCharValue;
        });
        return obj;
    });
}

/**
 * Genera SQL usando Bedrock (igual que route.ts actual)
 */
async function generateSQL(userQuestion: string): Promise<string> {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(now.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    const currentDateStr = now.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

    const prompt = `Genera una consulta SQL (Presto/Athena) para responder a la pregunta: "${userQuestion}"
                 
CONVENCIÓN TEMPORAL:
- La fecha de HOY es: ${today} (${currentDateStr})
- Si el usuario dice "enero", se refiere al año ${now.getFullYear()}.

TABLA: iot_telemetry_db.iot_data
COLUMNAS IMPORTANTES (Usar .value para el valor):
- timestamp (string ISO8601, ej: '2026-01-21T16:45:34.477925Z')
- data.generator (voltage_L1_N.value, voltage_L2_N.value, voltage_L3_N.value, corriente_L1.value, corriente_L2.value, corriente_L3.value, potencia_activa.value, frecuencia.value)
- data.cylinders (Tem_Cyl_1.value hasta Tem_Cyl_20.value, Promedio_tem_cyl.value)
- data.oil_system (Temperatura_aceite.value, Presion_aceite.value)
- data.cooling_system (T_HT_ENTRADA.value, Temp_LT_salida.value)

UMBRALES PARA COMPARACIÓN:
${JSON.stringify(THRESHOLDS, null, 2)}

REGLAS:
- Devuelve SOLO el código SQL, nada de explicación.
- IMPORTANTE: Debes acceder al campo .value para obtener el número. Ejemplo: data.generator.voltage_L1_N.value
- USA SOLO las columnas listadas arriba. SI el usuario pide algo que NO está en la lista, ignóralo.
- FILTRO DE TIEMPO: La columna 'timestamp' es un STRING. USA COMPARACIÓN DE STRINGS DIRECTA para que sea rápido.
- Ejemplo correcto: WHERE timestamp >= '${yesterday}T00:00:00Z' AND timestamp <= '${yesterday}T23:59:59Z'
- REPORTES: Si el usuario pide un "informe", "resumen" o "gráfico" de un mes o semana, GROUP BY substr(timestamp, 1, 10) (para días) o substr(timestamp, 1, 13) (para horas) para obtener una serie de tiempo real.
- Año: Si estamos en ${now.getFullYear()} y pide "diciembre", usa el rango "${now.getFullYear() - 1}-12-01T00:00:00Z" al "${now.getFullYear() - 1}-12-31T23:59:59Z".
- LIMIT 50 si no es una agregación específica.
- Si la pregunta menciona "fuera de umbral", usa los umbrales proporcionados arriba.`;

    const payload = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 2048,
        temperature: 0.3,
        messages: [{ role: 'user', content: prompt }]
    };

    const command = new InvokeModelCommand({
        modelId: process.env.AWS_BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload)
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    if (responseBody.content && responseBody.content.length > 0) {
        const sql = responseBody.content[0].text;
        return sql.replace(/```sql/g, '').replace(/```/g, '').trim();
    }

    throw new Error('No SQL generated by Bedrock');
}


/**
 * Parsea los parámetros del formato de Bedrock Agent
 */
function parseAgentParameters(event: any): any {
    const params: any = {};
    try {
        // 1. Intentar obtener de parameters (formato estándar GET/POST simple)
        if (event.parameters && Array.isArray(event.parameters)) {
            for (const param of event.parameters) {
                params[param.name] = param.value;
            }
        }

        // 2. Intentar obtener de requestBody (formato POST con JSON)
        const content = event.requestBody?.content?.['application/json'];
        if (content) {
            // A veces es un array de {name, type, value}
            if (Array.isArray(content)) {
                for (const item of content) {
                    params[item.name] = item.value;
                }
            }
            // A veces es un objeto directo con properties
            else if (content.properties && Array.isArray(content.properties)) {
                for (const prop of content.properties) {
                    params[prop.name] = prop.value;
                }
            }
        }
    } catch (error) {
        console.error('Error parsing agent parameters:', error);
    }
    return params;
}

/**
 * Genera una respuesta exitosa formateada para Bedrock Agent
 */
function createSuccessResponse(event: any, body: any) {
    return {
        messageVersion: '1.0',
        response: {
            actionGroup: event.actionGroup || 'IndustrialDataQuery',
            apiPath: event.apiPath || '/unknown',
            httpMethod: event.httpMethod || 'POST',
            httpStatusCode: 200,
            responseBody: {
                'application/json': {
                    body: typeof body === 'string' ? body : JSON.stringify(body)
                }
            }
        }
    };
}

/**
 * Genera una respuesta de error formateada para Bedrock Agent
 */
function createErrorResponse(event: any, statusCode: number, message: string) {
    return {
        messageVersion: '1.0',
        response: {
            actionGroup: event.actionGroup || 'IndustrialDataQuery',
            apiPath: event.apiPath || '/error',
            httpMethod: event.httpMethod || 'POST',
            httpStatusCode: 200, // Siempre 200 para que el Agente no "muera" y pueda dar feedback
            responseBody: {
                'application/json': {
                    body: JSON.stringify({
                        status: 'error',
                        error: message,
                        message: 'Lo siento, hubo un problema técnico. ' + message
                    })
                }
            }
        }
    };
}

/**
 * Handler principal que Bedrock Agent llamará
 */
export const handler: Handler = async (event: any) => {
    try {
        console.log('--- Agent Execution Start ---');
        console.log('Event structure:', JSON.stringify(event, null, 2));

        const { apiPath: rawPath } = event;
        const apiPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
        const params = parseAgentParameters(event);
        console.log(`Action: ${apiPath} | Parsed parameters:`, JSON.stringify(params, null, 2));

        // Acción: Consultar datos
        if (apiPath === '/queryData') {
            const question = params.question;

            if (!question) {
                console.error('Missing question parameter');
                return createErrorResponse(event, 400, 'Missing question parameter');
            }

            console.log('Action: queryData | Question:', question);

            try {
                // 1. Generar SQL
                const sql = await generateSQL(question);
                console.log('Generated SQL:', sql);

                // 2. Ejecutar SQL
                const results = await executeAthenaQuery(sql);
                console.log('Query results count:', results.length);

                return createSuccessResponse(event, {
                    sql,
                    rowCount: results.length,
                    data: results.slice(0, 20)
                });
            } catch (queryError: any) {
                console.error('Error in queryData execution:', queryError);
                // Devolvemos una estructura que Bedrock NO rechace (campos esperados)
                return createSuccessResponse(event, {
                    sql: 'Error en consulta',
                    rowCount: 0,
                    data: [],
                    error: queryError.message,
                    status: 'error'
                });
            }
        }

        // Acción: Obtener estado en tiempo real (Simulado via Athena/S3)
        if (apiPath === '/getRealTimeStatus') {
            console.log(`Action: getRealTimeStatus (via Athena)`);

            try {
                // Consulta para obtener el ÚLTIMO registro insertado en S3
                // Usamos LIMIT 1 ordenado por timestamp descendente
                const sql = "SELECT * FROM iot_telemetry_db.iot_data ORDER BY timestamp DESC LIMIT 1";
                console.log('Executing RealTime Athena Query:', sql);

                const results = await executeAthenaQuery(sql);

                if (results.length === 0) {
                    return createSuccessResponse(event, {
                        message: "No se encontraron datos recientes en el histórico."
                    });
                }

                // Tomamos el primer (y único) registro
                const latestRecord = results[0];

                return createSuccessResponse(event, {
                    thingName: params.thingName || 'qnap-gateway-001',
                    timestamp: latestRecord.timestamp || new Date().toISOString(),
                    state: latestRecord, // Devolvemos todo el registro plano como el estado
                    source: 'Athena/S3 (Historical Data)'
                });

            } catch (athenaError: any) {
                console.error('Error fetching RealTime status via Athena:', athenaError);
                return createErrorResponse(event, 500, `Failed to fetch latest status from S3: ${athenaError.message}`);
            }
        }

        // Acción: Obtener umbrales
        if (apiPath === '/getThresholds') {
            console.log('Action: getThresholds');
            return createSuccessResponse(event, { thresholds: THRESHOLDS });
        }

        // Acción: Verificar si un valor está fuera de umbral
        if (apiPath === '/checkThreshold') {
            const variable = params.variable;
            const value = params.value;

            console.log(`Action: checkThreshold | Variable: ${variable} | Value: ${value}`);

            if (!variable || value === undefined) {
                return createErrorResponse(event, 400, 'Missing variable or value');
            }

            // Navegar el objeto de umbrales
            const parts = variable.split('.');
            let threshold: any = THRESHOLDS;
            for (const part of parts) {
                threshold = threshold?.[part];
            }

            if (!threshold) {
                return createErrorResponse(event, 404, 'Threshold not found for variable');
            }

            const numValue = parseFloat(value);
            const status = {
                value: numValue,
                threshold,
                isOutOfRange: false,
                isNearLimit: false,
                message: 'Valor normal'
            };

            if (threshold.max && numValue > threshold.max) {
                status.isOutOfRange = true;
                status.message = `Valor ${numValue} excede el límite máximo de ${threshold.max} ${threshold.unit}`;
            } else if (threshold.min && numValue < threshold.min) {
                status.isOutOfRange = true;
                status.message = `Valor ${numValue} está por debajo del límite mínimo de ${threshold.min} ${threshold.unit}`;
            } else if (threshold.warning && numValue > threshold.warning) {
                status.isNearLimit = true;
                status.message = `Valor ${numValue} está cerca del límite de advertencia (${threshold.warning} ${threshold.unit})`;
            }

            return createSuccessResponse(event, status);
        }

        // Acción: Crear un reporte web dinámico
        if (apiPath === '/createReport') {
            const reportData = params.reportData || event.requestBody?.content?.['application/json']?.body;

            console.log('Action: createReport');

            if (!reportData) {
                return createErrorResponse(event, 400, 'Missing report data');
            }

            const reportId = uuidv4();
            const bucket = process.env.S3_IOT_BUCKET || process.env.AWS_S3_IOT_BUCKET || '';
            const key = `web-reports/${reportId}.json`;

            await s3Client.send(new PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: typeof reportData === 'string' ? reportData : JSON.stringify(reportData),
                ContentType: 'application/json'
            }));

            console.log(`✅ Web report saved to S3: ${key}`);

            return createSuccessResponse(event, {
                reportId,
                status: 'created',
                link: `/reports/${reportId}`,
                message: 'Reporte generado con éxito. El usuario puede acceder mediante el link proporcionado.'
            });
        }

        console.error(`Unknown path: ${apiPath}`);
        return createErrorResponse(event, 404, 'Unknown action');

    } catch (globalError: any) {
        console.error('CRITICAL LAMBDA ERROR:', globalError);
        return {
            messageVersion: '1.0',
            response: {
                actionGroup: event?.actionGroup || 'IndustrialDataQuery',
                apiPath: event?.apiPath || '/error',
                httpMethod: event?.httpMethod || 'POST',
                httpStatusCode: 200,
                responseBody: {
                    'application/json': {
                        body: JSON.stringify({
                            error: 'Internal handler error',
                            details: globalError.message
                        })
                    }
                }
            }
        };
    } finally {
        console.log('--- Agent Execution End ---');
    }
};
