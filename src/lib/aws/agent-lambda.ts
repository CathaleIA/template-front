/**
 * AWS Lambda Handler para Bedrock Agent
 * 
 * Este archivo contiene la lógica que el Agente de Bedrock llamará para:
 * 1. Consultar datos de IoT (Athena)
 * 2. Verificar umbrales
 * 3. Obtener datos en tiempo real
 * 4. Gestionar planes y registros de mantenimiento (DynamoDB)
 * 5. Enviar correos/recordatorios de mantenimiento (SES + EventBridge)
 * 
 * NOTA: Este archivo debe ser desplegado como una función Lambda en AWS.
 * Para desarrollo local, puedes usar SAM CLI o simplemente desplegarlo directamente.
 */

import { Handler } from 'aws-lambda';
import { AthenaClient, StartQueryExecutionCommand, GetQueryExecutionCommand, GetQueryResultsCommand } from '@aws-sdk/client-athena';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { IoTDataPlaneClient, GetThingShadowCommand } from '@aws-sdk/client-iot-data-plane';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient, ScanCommand, QueryCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { SchedulerClient, CreateScheduleCommand } from '@aws-sdk/client-scheduler';
import { v4 as uuidv4 } from 'uuid';

// Configuración de clientes AWS
const REGION = process.env.AWS_REGION || 'us-east-1';
const athenaClient = new AthenaClient({ region: REGION });
const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_BEDROCK_REGION || 'us-east-1' });
const iotDataClient = new IoTDataPlaneClient({ region: REGION });
const s3Client = new S3Client({ region: REGION });
const dynamoClient = new DynamoDBClient({ region: REGION });
const sesClient = new SESClient({ region: REGION });
const schedulerClient = new SchedulerClient({ region: REGION });

// Configuración de mantenimiento
const MAINTENANCE_SCHEDULES_TABLE = process.env.MAINTENANCE_SCHEDULES_TABLE || 'MaintenanceSchedules';
const MAINTENANCE_LOG_TABLE = process.env.MAINTENANCE_LOG_TABLE || 'MaintenanceLog';
const SES_SENDER_EMAIL = process.env.SES_SENDER_EMAIL || 'no-reply@copower.com.co';
const DEFAULT_NOTIFY_EMAIL = process.env.DEFAULT_NOTIFY_EMAIL || 'jerson.villamizar.214@gmail.com';
const SCHEDULER_ROLE_ARN = process.env.SCHEDULER_ROLE_ARN || '';
const REMINDER_LAMBDA_ARN = process.env.REMINDER_LAMBDA_ARN || '';

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
- REPORTES: Si el usuario pide un "reporte", "resumen" o "gráfica", usa GROUP BY substr(timestamp, 1, 10).
- AGREGACIONES (CRÍTICO): SI USAS GROUP BY, TODAS las columnas del SELECT y CUALQUIER operación matemática debe estar envuelta en funciones de agregación (AVG, SUM, MAX).
- INCORRECTO: AVG(potencia) / (voltaje1 + voltaje2)
- CORRECTO: AVG(potencia) / (AVG(voltaje1) + AVG(voltaje2) + AVG(voltaje3))
- VERACIDAD: NUNCA inventes datos. Si no hay registros para una fecha, ignora ese día en los resultados o indícalo.
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

        // ==========================================
        // ACCIONES DE MANTENIMIENTO
        // ==========================================

        // Acción: Obtener planes de mantenimiento y calcular próximos
        if (apiPath === '/getMaintenanceSchedule') {
            const machineId = params.machineId;
            console.log(`Action: getMaintenanceSchedule | machineId: ${machineId || 'ALL'}`);

            try {
                // 1. Obtener planes de mantenimiento
                let schedules: any[] = [];
                if (machineId) {
                    const result = await dynamoClient.send(new QueryCommand({
                        TableName: MAINTENANCE_SCHEDULES_TABLE,
                        KeyConditionExpression: 'machineId = :mid',
                        ExpressionAttributeValues: { ':mid': { S: machineId } }
                    }));
                    schedules = result.Items || [];
                } else {
                    const result = await dynamoClient.send(new ScanCommand({
                        TableName: MAINTENANCE_SCHEDULES_TABLE
                    }));
                    schedules = result.Items || [];
                }

                // 2. Para cada plan, obtener el último mantenimiento y calcular el próximo
                const enriched = [];
                for (const schedule of schedules) {
                    const mid = schedule.machineId?.S || '';
                    const intervalDays = parseInt(schedule.intervalDays?.N || '90', 10);

                    // Obtener último mantenimiento (query descendente, limit 1)
                    const logResult = await dynamoClient.send(new QueryCommand({
                        TableName: MAINTENANCE_LOG_TABLE,
                        KeyConditionExpression: 'machineId = :mid',
                        ExpressionAttributeValues: { ':mid': { S: mid } },
                        ScanIndexForward: false,
                        Limit: 1
                    }));

                    const lastLog = logResult.Items?.[0];
                    const lastDate = lastLog?.maintenanceDate?.S || null;
                    let nextDate: string | null = null;
                    let daysRemaining: number | null = null;

                    if (lastDate) {
                        const last = new Date(lastDate);
                        const next = new Date(last.getTime() + intervalDays * 24 * 60 * 60 * 1000);
                        nextDate = next.toISOString().split('T')[0];
                        daysRemaining = Math.ceil((next.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
                    }

                    enriched.push({
                        machineId: mid,
                        machineName: schedule.machineName?.S || mid,
                        maintenanceType: schedule.maintenanceType?.S || 'preventivo',
                        intervalDays,
                        description: schedule.description?.S || '',
                        lastMaintenanceDate: lastDate,
                        lastMaintenanceNotes: lastLog?.notes?.S || null,
                        nextMaintenanceDate: nextDate,
                        daysRemaining,
                        isOverdue: daysRemaining !== null && daysRemaining < 0,
                        isUpcoming: daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 7
                    });
                }

                return createSuccessResponse(event, {
                    schedules: enriched,
                    count: enriched.length,
                    currentDate: new Date().toISOString().split('T')[0]
                });

            } catch (error: any) {
                console.error('Error in getMaintenanceSchedule:', error);
                return createErrorResponse(event, 500, `Error consultando mantenimiento: ${error.message}`);
            }
        }

        // Acción: Registrar un mantenimiento realizado
        if (apiPath === '/logMaintenance') {
            const mid = params.machineId;
            const type = params.type || 'preventivo';
            const notes = params.notes || '';
            const performedBy = params.performedBy || 'Usuario';

            console.log(`Action: logMaintenance | machineId: ${mid}`);

            if (!mid) {
                return createErrorResponse(event, 400, 'Falta el parámetro machineId');
            }

            try {
                const now = new Date().toISOString();
                await dynamoClient.send(new PutItemCommand({
                    TableName: MAINTENANCE_LOG_TABLE,
                    Item: {
                        machineId: { S: mid },
                        maintenanceDate: { S: now },
                        type: { S: type },
                        notes: { S: notes },
                        performedBy: { S: performedBy }
                    }
                }));

                return createSuccessResponse(event, {
                    status: 'registered',
                    machineId: mid,
                    maintenanceDate: now,
                    message: `Mantenimiento registrado exitosamente para ${mid} el ${now}`
                });
            } catch (error: any) {
                console.error('Error in logMaintenance:', error);
                return createErrorResponse(event, 500, `Error registrando mantenimiento: ${error.message}`);
            }
        }

        // Acción: Programar un recordatorio de mantenimiento (correo)
        if (apiPath === '/scheduleMaintenanceReminder') {
            const mid = params.machineId || 'general';
            const email = params.email || DEFAULT_NOTIFY_EMAIL;
            const scheduledDate = params.scheduledDate; // ISO date string ej: '2026-03-01'
            const reminderMessage = params.reminderMessage || `Recordatorio de mantenimiento para ${mid}`;

            console.log(`Action: scheduleMaintenanceReminder | machine: ${mid} | email: ${email} | date: ${scheduledDate}`);

            try {
                const now = new Date();
                const targetDate = scheduledDate ? new Date(scheduledDate) : null;
                const isImmediate = !targetDate || targetDate.getTime() <= now.getTime() + 60 * 60 * 1000; // dentro de 1 hora = inmediato

                if (isImmediate) {
                    // Obtener detalles de mantenimiento para el correo
                    let machineDetails = [];
                    if (mid === 'all') {
                        // Obtener todas las máquinas
                        const result = await dynamoClient.send(new ScanCommand({ TableName: MAINTENANCE_SCHEDULES_TABLE }));
                        const schedules = result.Items || [];

                        for (const s of schedules) {
                            const id = s.machineId?.S || '';
                            const name = s.machineName?.S || id;
                            const interval = parseInt(s.intervalDays?.N || '90', 10);

                            const logResult = await dynamoClient.send(new QueryCommand({
                                TableName: MAINTENANCE_LOG_TABLE,
                                KeyConditionExpression: 'machineId = :mid',
                                ExpressionAttributeValues: { ':mid': { S: id } },
                                ScanIndexForward: false,
                                Limit: 1
                            }));

                            const lastDate = logResult.Items?.[0]?.maintenanceDate?.S || 'Sin registros';
                            let nextDate = 'Consultar manual';
                            if (lastDate !== 'Sin registros') {
                                // Preferir el cálculo basado en el intervalo del registro
                                const next = new Date(new Date(lastDate).getTime() + interval * 24 * 60 * 60 * 1000);
                                nextDate = next.toISOString().split('T')[0];
                            }

                            machineDetails.push({ id, name, nextDate });
                        }
                    } else {
                        // Obtener datos de una máquina específica
                        const schedResult = await dynamoClient.send(new QueryCommand({
                            TableName: MAINTENANCE_SCHEDULES_TABLE,
                            KeyConditionExpression: 'machineId = :mid',
                            ExpressionAttributeValues: { ':mid': { S: mid } }
                        }));
                        const sched = schedResult.Items?.[0];
                        const name = sched?.machineName?.S || mid;
                        const interval = parseInt(sched?.intervalDays?.N || '90', 10);

                        const logResult = await dynamoClient.send(new QueryCommand({
                            TableName: MAINTENANCE_LOG_TABLE,
                            KeyConditionExpression: 'machineId = :mid',
                            ExpressionAttributeValues: { ':mid': { S: mid } },
                            ScanIndexForward: false,
                            Limit: 1
                        }));

                        const lastDate = logResult.Items?.[0]?.maintenanceDate?.S || 'Sin registros';
                        let nextDate = 'Consultar manual';
                        if (lastDate !== 'Sin registros') {
                            const next = new Date(new Date(lastDate).getTime() + interval * 24 * 60 * 60 * 1000);
                            nextDate = next.toISOString().split('T')[0];
                        }

                        machineDetails.push({ id: mid, name, nextDate });
                    }

                    const isSummary = mid === 'all';
                    const subject = isSummary ? '🔧 Resumen de Mantenimientos Pendientes' : `🔧 Recordatorio de Mantenimiento - ${mid}`;

                    const machinesHtml = machineDetails.map(m => `
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${m.name}</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #1a472a;">${m.nextDate}</td>
                        </tr>
                    `).join('');

                    // Envío inmediato por SES
                    await sesClient.send(new SendEmailCommand({
                        Source: SES_SENDER_EMAIL,
                        Destination: { ToAddresses: [email] },
                        Message: {
                            Subject: { Data: subject, Charset: 'UTF-8' },
                            Body: {
                                Html: {
                                    Data: `
                                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                                            <div style="background: linear-gradient(135deg, #1a472a, #2d5a3e); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
                                                <h1 style="color: white; margin: 0; font-size: 24px;">🔧 ${isSummary ? 'Resumen Operativo' : 'Recordatorio de Mantenimiento'}</h1>
                                            </div>
                                            <div style="padding: 25px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; background-color: #fcfcfc;">
                                                <p style="font-size: 16px;">Hola,</p>
                                                <p style="font-size: 16px;">${isSummary ? 'Aquí tienes el resumen de los próximos mantenimientos programados para tus equipos:' : `Este es un recordatorio para el mantenimiento de la máquina <strong>${mid}</strong>.`}</p>
                                                
                                                <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 4px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                                    <thead style="background: #f4f4f4;">
                                                        <tr>
                                                            <th style="text-align: left; padding: 12px; border-bottom: 2px solid #ddd;">Máquina / Equipo</th>
                                                            <th style="text-align: left; padding: 12px; border-bottom: 2px solid #ddd;">Próxima Fecha</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        ${machinesHtml}
                                                    </tbody>
                                                </table>

                                                ${reminderMessage && !isSummary ? `<div style="background: #eef7ee; padding: 15px; border-left: 4px solid #1a472a; margin: 20px 0;">
                                                    <strong>Mensaje:</strong> ${reminderMessage}
                                                </div>` : ''}

                                                <p style="font-size: 14px; margin-top: 30px;">Por favor, asegúrese de contar con los repuestos y personal necesario para estas fechas.</p>
                                                
                                                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                                                <p style="color: #999; font-size: 12px; text-align: center;">Generado automáticamente por el Agente Bedrock - Copower Industrial Dashboard</p>
                                            </div>
                                        </div>
                                    `,
                                    Charset: 'UTF-8'
                                }
                            }
                        }
                    }));

                    return createSuccessResponse(event, {
                        status: 'sent',
                        type: 'immediate',
                        email,
                        machineId: mid,
                        processedMachines: machineDetails,
                        message: `Correo de recordatorio enviado exitosamente a ${email} con datos de ${machineDetails.length} equipo(s).`
                    });

                } else {
                    // Programar para fecha futura con EventBridge Scheduler
                    if (!SCHEDULER_ROLE_ARN || !REMINDER_LAMBDA_ARN) {
                        // Fallback: enviar correo inmediato con aviso de la fecha
                        await sesClient.send(new SendEmailCommand({
                            Source: SES_SENDER_EMAIL,
                            Destination: { ToAddresses: [email] },
                            Message: {
                                Subject: { Data: `🔧 Mantenimiento Programado para ${scheduledDate} - ${mid}`, Charset: 'UTF-8' },
                                Body: {
                                    Html: {
                                        Data: `
                                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                                <div style="background: linear-gradient(135deg, #1a472a, #2d5a3e); padding: 20px; border-radius: 8px 8px 0 0;">
                                                    <h1 style="color: white; margin: 0;">📅 Mantenimiento Programado</h1>
                                                </div>
                                                <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
                                                    <p><strong>Máquina:</strong> ${mid}</p>
                                                    <p><strong>Fecha programada:</strong> ${scheduledDate}</p>
                                                    <p><strong>Detalle:</strong> ${reminderMessage}</p>
                                                    <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 12px; border-radius: 6px; margin: 16px 0;">
                                                        <strong>⚠️ Nota:</strong> Este correo se envió como confirmación. Recuerde realizar el mantenimiento en la fecha indicada.
                                                    </div>
                                                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                                                    <p style="color: #666; font-size: 12px;">Generado por el Agente de IA Industrial.</p>
                                                </div>
                                            </div>
                                        `,
                                        Charset: 'UTF-8'
                                    }
                                }
                            }
                        }));

                        return createSuccessResponse(event, {
                            status: 'sent_as_confirmation',
                            type: 'scheduled_fallback',
                            email,
                            scheduledDate,
                            machineId: mid,
                            message: `Correo de confirmación de mantenimiento programado enviado a ${email} para la fecha ${scheduledDate}`
                        });
                    }

                    // EventBridge Scheduler: crear schedule one-time
                    const scheduleId = `maint-reminder-${mid}-${uuidv4().substring(0, 8)}`;
                    const scheduleExpression = `at(${targetDate.toISOString().replace(/\.\d{3}Z$/, '')})`;

                    await schedulerClient.send(new CreateScheduleCommand({
                        Name: scheduleId,
                        ScheduleExpression: scheduleExpression,
                        ScheduleExpressionTimezone: 'America/Bogota',
                        FlexibleTimeWindow: { Mode: 'OFF' },
                        Target: {
                            Arn: REMINDER_LAMBDA_ARN,
                            RoleArn: SCHEDULER_ROLE_ARN,
                            Input: JSON.stringify({
                                action: 'sendReminder',
                                machineId: mid,
                                email,
                                message: reminderMessage
                            })
                        },
                        ActionAfterCompletion: 'DELETE' // Se borra automáticamente después de ejecutarse
                    }));

                    return createSuccessResponse(event, {
                        status: 'scheduled',
                        type: 'eventbridge',
                        scheduleId,
                        scheduledDate,
                        email,
                        machineId: mid,
                        message: `Recordatorio programado para ${scheduledDate}. Recibirás un correo en ${email} ese día.`
                    });
                }

            } catch (error: any) {
                console.error('Error in scheduleMaintenanceReminder:', error);
                return createErrorResponse(event, 500, `Error programando recordatorio: ${error.message}`);
            }
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
