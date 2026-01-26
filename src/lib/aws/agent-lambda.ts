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

// Configuración de clientes AWS
const athenaClient = new AthenaClient({ region: process.env.AWS_REGION || 'us-east-1' });
const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_BEDROCK_REGION || 'us-east-1' });

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
    const maxAttempts = 30;

    while (status === 'RUNNING' || status === 'QUEUED') {
        if (attempts++ > maxAttempts) {
            throw new Error('Athena query timeout');
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

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

    const prompt = `Genera una consulta SQL (Presto/Athena) para responder a la pregunta: "${userQuestion}"
                 
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
- Usa "from_iso8601_timestamp(timestamp)" para el filtro de tiempo.
- CRÍTICO: Athena no permite comparar un timestamp con un string directamente. Ambas partes deben ser timestamps.
- Ejemplo correcto: WHERE from_iso8601_timestamp(timestamp) >= from_iso8601_timestamp('${yesterday}T00:00:00Z')
- Para "hoy", usa la fecha '${today}'.
- Para "ayer", usa la fecha '${yesterday}'.
- LIMIT 100 si no es una agregación específica.
- Si la pregunta menciona "fuera de umbral" o "sobre el límite", usa los umbrales proporcionados arriba en la cláusula WHERE.`;

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
    try {
        const properties = event.requestBody?.content?.['application/json']?.properties || [];
        const params: any = {};

        for (const prop of properties) {
            params[prop.name] = prop.value;
        }

        // También intentar obtener de 'parameters' (otra forma en que Bedrock envía datos)
        if (event.parameters && Array.isArray(event.parameters)) {
            for (const param of event.parameters) {
                params[param.name] = param.value;
            }
        }

        return params;
    } catch (error) {
        console.error('Error parsing agent parameters:', error);
        return {};
    }
}

/**
 * Genera una respuesta exitosa formateada para Bedrock Agent
 */
function createSuccessResponse(event: any, body: any) {
    return {
        messageVersion: '1.0',
        response: {
            actionGroup: event.actionGroup,
            apiPath: event.apiPath,
            httpMethod: event.httpMethod,
            httpStatusCode: 200,
            responseBody: {
                'application/json': {
                    body: JSON.stringify(body)
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
            actionGroup: event.actionGroup,
            apiPath: event.apiPath,
            httpMethod: event.httpMethod,
            httpStatusCode: statusCode,
            responseBody: {
                'application/json': {
                    body: JSON.stringify({ error: message })
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

        const { apiPath } = event;
        const params = parseAgentParameters(event);
        console.log('Parsed parameters:', JSON.stringify(params, null, 2));

        // Acción: Consultar datos
        if (apiPath === '/queryData') {
            const question = params.question;

            if (!question) {
                console.error('Missing question parameter');
                return createErrorResponse(event, 400, 'Missing question parameter');
            }

            console.log('Action: queryData | Question:', question);

            // 1. Generar SQL
            const sql = await generateSQL(question);
            console.log('Generated SQL:', sql);

            // 2. Ejecutar SQL
            const results = await executeAthenaQuery(sql);
            console.log('Query results count:', results.length);

            // Si no hay resultados, devolver mensaje amigable
            if (results.length === 0) {
                return createSuccessResponse(event, {
                    sql,
                    rowCount: 0,
                    data: [],
                    message: 'No se encontraron datos para el período consultado. Es posible que no haya datos históricos disponibles para esas fechas.'
                });
            }

            return createSuccessResponse(event, {
                sql,
                rowCount: results.length,
                data: results.slice(0, 50)
            });
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

        console.error(`Unknown path: ${apiPath}`);
        return createErrorResponse(event, 404, 'Unknown action');

    } catch (globalError: any) {
        console.error('CRITICAL LAMBDA ERROR:', globalError);
        console.error('Stack trace:', globalError.stack);

        // Intentar devolver un error estructurado incluso en fallo catastrófico
        return {
            messageVersion: '1.0',
            response: {
                actionGroup: event?.actionGroup || 'Unknown',
                apiPath: event?.apiPath || 'Unknown',
                httpMethod: event?.httpMethod || 'POST',
                httpStatusCode: 500,
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
