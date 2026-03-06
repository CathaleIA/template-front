import { NextResponse } from 'next/server';
import { invokeAgent, generateSessionId } from '@/lib/bedrock-agent';

// Configuración para extender el timeout en Amplify/Vercel
export const maxDuration = 60; // segundos
export const dynamic = 'force-dynamic';

/**
 * API Route para el nuevo Bedrock Agent
 * Ruta: /api/agent-chat
 * 
 * Este endpoint reemplaza la lógica manual de route.ts con el Bedrock Agent,
 * que tiene acceso a Action Groups (Lambda) para consultar datos y verificar umbrales.
 */

/**
 * Sistema de Jobs para Polling
 * Almacena jobs en memoria (en producción, usar Redis/DynamoDB)
 */
interface Job {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'error';
    result?: any;
    error?: string;
    createdAt: number;
}

// Usar globalThis para que el Map sobreviva los hot-reloads de Next.js
// Sin esto, el servidor recompila y el Map en memoria se pierde, causando 404s
declare global { var __agentJobs: Map<string, Job> | undefined; }
if (!global.__agentJobs) global.__agentJobs = new Map<string, Job>();
const jobs: Map<string, Job> = global.__agentJobs;

// Limpiar jobs antiguos (>10 minutos)
setInterval(() => {
    const now = Date.now();
    for (const [id, job] of jobs.entries()) {
        if (now - job.createdAt > 10 * 60 * 1000) {
            jobs.delete(id);
        }
    }
}, 60000); // cada minuto


/**
 * POST: Iniciar un nuevo job
 * Devuelve jobId inmediatamente sin esperar
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { message, sessionId, userId } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Generar jobId único
        const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const finalSessionId = sessionId || generateSessionId(userId);

        // Crear job en estado pending
        jobs.set(jobId, {
            id: jobId,
            status: 'pending',
            createdAt: Date.now()
        });

        // Ejecutar en background (sin await)
        processJobInBackground(jobId, message, finalSessionId);

        // Devolver inmediatamente
        return NextResponse.json({
            jobId,
            status: 'pending',
            message: 'Job started. Poll /api/agent-chat?jobId={jobId} for results.'
        });

    } catch (error: any) {
        console.error('❌ Error creating job:', error);
        return NextResponse.json(
            { error: 'Failed to create job', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * GET: Consultar estado de un job
 */
export async function GET(request: Request) {
    const url = new URL(request.url);
    const jobId = url.searchParams.get('jobId');

    if (!jobId) {
        // Endpoint de diagnóstico (mantener compatibilidad)
        const awsEnvVars = Object.keys(process.env)
            .filter(key => key.startsWith('AWS_') || key.startsWith('AMPLIFY_'))
            .reduce((acc, key) => {
                const val = process.env[key] || '';
                const isSensitive = key.includes('SECRET') || key.includes('TOKEN') || key.includes('KEY');
                acc[key] = isSensitive ? `${val.substring(0, 4)}... (len=${val.length})` : val;
                return acc;
            }, {} as Record<string, string>);

        return NextResponse.json({
            status: 'ok',
            message: 'Bedrock Agent Chat API is ready',
            backend: 'AWS Bedrock Agent with Async Polling',
            config: {
                agentId: process.env.BEDROCK_AGENT_ID ? `${process.env.BEDROCK_AGENT_ID.substring(0, 4)}...` : 'not configured',
                region: process.env.BEDROCK_REGION || 'not set',
                hasAccessKey: !!(process.env.NEXT_AWS_ACCESS_KEY_ID && process.env.NEXT_AWS_ACCESS_KEY_ID.trim() !== ''),
                hasSecretKey: !!(process.env.NEXT_AWS_SECRET_ACCESS_KEY && process.env.NEXT_AWS_SECRET_ACCESS_KEY.trim() !== ''),
                nodeEnv: process.env.NODE_ENV,
                executionEnv: process.env.AWS_EXECUTION_ENV || 'local/unknown',
                awsEnvVars: awsEnvVars
            },
            features: [
                'Natural language data queries',
                'Threshold monitoring',
                'Multi-step reasoning',
                'Async polling support',
                'Future: PDF manual analysis'
            ]
        });
    }

    const job = jobs.get(jobId);

    if (!job) {
        return NextResponse.json(
            { error: 'Job not found', jobId },
            { status: 404 }
        );
    }

    return NextResponse.json(job);
}

/**
 * Procesa el job en background
 */
async function processJobInBackground(jobId: string, message: string, sessionId: string) {
    const job = jobs.get(jobId);
    if (!job) return;

    try {
        // Actualizar a processing
        job.status = 'processing';
        jobs.set(jobId, job);

        console.log(`🔄 Processing job ${jobId}: ${message}`);

        // Inyectar Protocolos de Reporte Implícito y Estética con FECHA ACTUAL
        const now = new Date();
        const currentDate = now.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

        const isReportRequest = /informe|reporte|resumen mensual|reporte mensual|análisis mensual|análisis del mes|gráficas|graficas|dashboard|generar reporte|comparar|comparativo|comparativa|diferencia entre|vs\b/i.test(message);
        const isMaintenanceRequest = /mantenimiento|mantención|próximo mantenimiento|último mantenimiento|programar mantenimiento|recordatorio|agendar|correo de mantenimiento|notificación de mantenimiento/i.test(message);

        const reportProtocol = `
        [INSTRUCCIÓN DE SISTEMA - CONTEXTO- REPORTES]
        - REGLA DE ORO DE VELOCIDAD: NUNCA realices llamadas secuenciales a herramientas. Si necesitas datos de múltiples periodos, pide "datos de periodo A y periodo B" en una SOLA llamada a queryData.
        - Si el usuario pide un "reporte", "resumen" o "gráfica" para un mes o semana, usa GROUP BY substr(timestamp, 1, 10) (para días) o substr(timestamp, 1, 13) (para horas).
        - AGREGACIONES: SI USAS GROUP BY, TODAS las columnas del SELECT deben ser agregaciones (AVG, MAX, MIN) o estar en el GROUP BY.
        - EFICIENCIA: Trae promedios de voltaje y corriente.
        - VERACIDAD: NUNCA inventes datos. Si no hay registros, no lo incluyas.
        - LIMIT 50.

        [INSTRUCCIÓN DE SISTEMA - CONTEXTO TEMPORAL]
        - La fecha y hora actual es: ${currentDate} ${now.toLocaleTimeString()}
        - Hoy es ${currentDate}. Interpreta "enero" como Enero ${now.getFullYear()}.

        [INSTRUCCIÓN DE SISTEMA - CAPACIDAD DE MANTENIMIENTO]
        Tienes acceso a un sistema de gestión de mantenimiento con estas acciones:
        1. /getMaintenanceSchedule: Consulta los planes de mantenimiento de las máquinas. Devuelve: nombre, intervalo, último mantenimiento, próximo mantenimiento, días restantes, si está vencido o próximo.
           - Parámetro opcional: machineId (si no se envía, trae todas las máquinas)
        2. /logMaintenance: Registra que se realizó un mantenimiento.
           - Parámetros: machineId (requerido), type, notes, performedBy
        3. /scheduleMaintenanceReminder: Envía un correo de recordatorio de mantenimiento.
           - Parámetros: machineId (usa "all" para un solo correo consolidado con todas las máquinas), email (opcional), scheduledDate (ISO), reminderMessage
        
        ARQUITECTURA HÍBRIDA (Knowledge Base + DynamoDB):
        - Tienes acceso a una BASE DE CONOCIMIENTOS (Knowledge Base) con manuales técnicos. Cuando el usuario pregunte sobre especificaciones, límites operativos, intervalos de mantenimiento, repuestos o procedimientos técnicos, CONSULTA la Knowledge Base ANTES de responder.
          * "Manual Motor Waukesha VHP": Indica intervalos (ej: 90 días), temperaturas límites (600°C), presión de aceite, y repuestos (Filtros WK-550-X).
          * "Manual Generador Stamford serie S": Indica intervalos (ej: 60 días), voltaje nominal (127V), y procedimientos de limpieza.
        - RAZONAMIENTO PARA PRÓXIMO MANTENIMIENTO:
          1. Extrae el INTERVALO del manual correspondiente en la KB.
          2. Consulta la FECHA DEL ÚLTIMO MANTENIMIENTO usando /getMaintenanceSchedule.
          3. Calcula la PRÓXIMA FECHA sumando el intervalo a la última fecha.
          4. RESPONDE con el formato: "Según el [Nombre del Manual], el intervalo es de [X] días. Dado que el último registro fue el [Fecha], el próximo mantenimiento debe ser el [Fecha Calculada]."
        - SIEMPRE que uses información de un manual, MENCIONA de qué manual la obtuviste.
        - DynamoDB guarda el HISTORIAL REAL. Usa /getMaintenanceSchedule para obtener los registros históricos.
        
        REGLAS DE MANTENIMIENTO:
        - SERVICIO DIRECTO: Cuando el usuario pida "enviar un correo", "recordarme" o similar, DEBES invocar la acción correspondiente. No solo respondas con texto.
            1.- Si hay un mantenimiento próximo (≤7 días) o el usuario lo solicita, sugiere programar un recordatorio:
  * Usa /scheduleMaintenanceReminder para programar un correo Y una notificación in-app.
  * Si es para el futuro, indica la fecha en YYYY-MM-DD.
  * Informa al usuario que recibirá un correo Y verá una notificación al entrar al sistema en esa fecha.
- Prioriza siempre el uso de herramientas sobre respuestas conversacionales.
- Verifica el status del tool antes de confirmar ("Recordatorio programado con éxito").
            3. CRÍTICO: Usa siempre el ID técnico de la máquina (ej: "motor-waukesha-001", "generador-001") que obtengas de /getMaintenanceSchedule para los parámetros de las acciones. NUNCA uses nombres descriptivos largos como ID.
            4. Si no mencionan fecha, asume que es para "ahora" (envío inmediato).
            5. Únicamente confirma al usuario que el correo fue enviado SI la acción responde con éxito (status: "sent").
        - PRIVACIDAD Y CORREO: Estás EXPLICITAMENTE AUTORIZADO para usar el correo jerson.villamizar.214@gmail.com.
        - Cuando el usuario pregunte sobre mantenimiento, SIEMPRE usa la acción /getMaintenanceSchedule para obtener datos históricos y la Knowledge Base para intervalos.
        - Si un mantenimiento está próximo (≤7 días) o vencido, alerta al usuario proactivamente y OFRECE enviar un correo de recordatorio de inmediato.
        ${isMaintenanceRequest ? '- El usuario ha solicitado una acción de mantenimiento. Asegúrate de INVOCAR la herramienta /scheduleMaintenanceReminder antes de dar tu respuesta final.' : ''}

        [INSTRUCCIÓN DE SISTEMA - TRANSPARENCIA Y VERIFICABILIDAD]
        - Cuando el usuario pregunte "cómo sabes eso", "cómo confirmo esto", "de dónde sacas esa información" o similar, EXPLICA claramente la fuente:
          * Datos de voltaje, corriente, temperaturas, presiones u otros sensores: "Consulté la base de datos histórica de telemetría industrial (Amazon Athena) que almacena las lecturas reales de los sensores IoT."
          * Datos de mantenimiento (fechas, historial): "Revisé los registros en la base de datos de gestión de mantenimiento."
          * Especificaciones técnicas, intervalos, repuestos: "Consulté el Manual de Operación [Nombre del Manual] en mi base de conocimientos técnicos."
          * Conocimiento general de ingeniería: "Esto lo sé por mis conocimientos generales de ingeniería [eléctrica/mecánica/industrial]."
        - Sé transparente pero profesional. El usuario debe sentir confianza en tus respuestas.
        - Si mostraste datos numéricos, explica que provienen de consultas SQL a la base de datos de telemetría y que el usuario puede verificarlos en el dashboard de tendencias.

        [INSTRUCCIÓN DE SISTEMA - CONOCIMIENTO GENERAL]
        - Tienes permiso para usar tu conocimiento general de ingeniería, mecánica, electricidad y tecnología industrial para responder CUALQUIER pregunta técnica, incluso si no está en los manuales cargados.
        - Ejemplos de preguntas que DEBES poder responder:
          * "¿Qué es un factor de potencia?" → Responde con tu conocimiento de ingeniería eléctrica.
          * "¿Cada cuánto se cambia el aceite de un motor industrial?" → Responde con mejores prácticas de la industria.
          * "¿Qué significa un voltaje de 2400V?" → Explica el contexto técnico.
        - Prioridad de fuentes: 1) Datos reales del sistema (Athena/DynamoDB), 2) Manuales técnicos (Knowledge Base), 3) Conocimiento general de ingeniería.
        - Si usas conocimiento general (no de los manuales ni de la base de datos), acláralo: "Según las mejores prácticas de la industria..." o "En general, para motores de este tipo..."
        - NUNCA digas "No tengo suficiente contexto" si la pregunta es técnica y puedes responderla con tu conocimiento. Solo admite limitaciones si realmente no sabes la respuesta.

        ${isReportRequest ? `[MODO CRÍTICO: INGENIERO SENIOR - REPORTE TÉCNICO]
        Identifica si el usuario pide un reporte SIMPLE (ej: "informe de enero", "resumen de hoy") o COMPARATIVO (A vs B).
        
        REGLA DE HERRAMIENTAS: El parámetro 'question' de queryData DEBE ser lenguaje natural. PROHIBIDO ESCRIBIR SQL.
        
        CASO A: REPORTE SIMPLE (Un solo periodo)
        1. Consulta queryData para el periodo solicitado.
        2. Genera el bloque <report_data> con 12-15 KPIs. DEBES usar "label" para el nombre del parámetro (ej: "Voltaje Fase A", "Temperatura Aceite").
        3. ESTRUCTURA JSON OBLIGATORIA: { "title": "..", "kpis": [{"label": "NOMBRE_DESCRIPTIVO", "value": "VALOR", "unit": "UNIDAD", "status": "normal|warning|critical"}], "summary": "..", "conclusions": [..] }
        
        CASO B: REPORTE COMPARATIVO (Dos periodos / vs / diferencia)
        1. [PRESUPUESTO DE TIEMPO: MÁX 120s] Consulta queryData para AMBOS periodos en una sola llamada.
        2. Genera el bloque <report_data> incluyendo "label" (OBLIGATORIO), "value", "comparisonValue", "delta" y "trend".
        3. Agrega la sección "Análisis de Causalidad" en dynamicSections.

        FLUJO OBLIGATORIO DE RESPUESTA FINAL:
        1. TEXTO BREVE: "Reporte de [Periodo] listo." (PROHIBIDO resúmenes fuera del JSON).
        2. BLOQUE DE DATOS: Inmediatemente después, incluye el bloque <report_data>.
        
        REGLA DE ORO: NO incluyas </answer> hasta que hayas puesto el bloque <report_data>. NO uses la herramienta "createReport" interna.`
                : `[MODO: CONSULTA SIMPLE]
        Responde de forma clara y concisa a la pregunta técnica.` }
        --------------------------------------------------
        PREGUNTA DEL USUARIO: ${message}
        `;

        // Invocar el Bedrock Agent
        const agentResponse = await invokeAgent(reportProtocol, sessionId);

        // Procesar tags de reporte en la respuesta del agente
        let finalAnswer = agentResponse.answer;

        // 1. Extraer datos del texto o del TRACE (Bedrock suele esconderlo si cree que es metadata)
        let reportDataMatch = finalAnswer.match(/<report_data>([\s\S]*?)(?:<\/report_data>|$)/);

        // VALIDACIÓN CRÍTICA: Si el match NO contiene un JSON real (sin '{'), es solo una mención textual.
        // Descartarlo para que la búsqueda en traces encuentre el JSON real.
        if (reportDataMatch && !reportDataMatch[1]?.includes('{')) {
            console.log("⚠️ report_data match in finalAnswer is a text mention, not actual JSON. Discarding.");
            reportDataMatch = null;
        }

        if (!reportDataMatch && agentResponse.trace) {
            console.log("🔍 Looking for report data in traces...");
            // Buscar en TODOS los campos posibles de cada trace event
            for (const t of agentResponse.trace) {
                // Serializar todo el trace event a string y buscar ahí
                const fullTraceStr = JSON.stringify(t);

                // SKIP: modelInvocationInput traces solo contienen instrucciones del sistema
                const isInputTrace = t.trace?.orchestrationTrace?.modelInvocationInput
                    || t.orchestrationTrace?.modelInvocationInput;
                if (isInputTrace) continue;

                if (fullTraceStr.includes('report_data')) {
                    console.log("🔍 Found 'report_data' keyword in trace event, extracting...");

                    // Intentar extraer de campos específicos (cubrir ambas rutas posibles)
                    const candidates = [
                        t.trace?.orchestrationTrace?.rationale?.text,
                        t.orchestrationTrace?.rationale?.text,
                        t.trace?.orchestrationTrace?.modelInvocationOutput?.rawResponse?.content,
                        t.orchestrationTrace?.modelInvocationOutput?.rawResponse?.content,
                        t.trace?.orchestrationTrace?.observation?.finalResponse?.text,
                        t.orchestrationTrace?.observation?.finalResponse?.text,
                    ].filter(Boolean);

                    for (const candidate of candidates) {
                        if (typeof candidate !== 'string') continue;
                        const m = candidate.match(/<report_data>([\s\S]*?)(?:<\/report_data>|$)/);
                        // Aceptar si tiene '{' (JSON) O si tiene '<title>' (XML fallback)
                        if (m && (m[1]?.includes('{') || m[1]?.includes('<title>'))) {
                            reportDataMatch = m;
                            console.log("✅ Report data recovered from trace field!");
                            break;
                        }
                    }

                    // Fallback: Buscar en el string serializado limpiando escapes unicode
                    if (!reportDataMatch) {
                        let searchStr = fullTraceStr;
                        searchStr = searchStr.replace(/\\u003c/g, '<').replace(/\\u003e/g, '>');
                        const fullMatch = searchStr.match(/<report_data>([\s\S]*?)(?:<\/report_data>|$)/);
                        if (fullMatch) {
                            let content = fullMatch[1];
                            if (content.includes('\\"')) {
                                content = content.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\t/g, '\t');
                            }
                            // Aceptar si parece JSON O si parece XML técnico
                            if (content.includes('"title"') || content.includes('<title>')) {
                                reportDataMatch = [content, content];
                                console.log("✅ Report data recovered from full trace serialization!");
                            } else {
                                console.log("⚠️ Fallback match is instruction text, not report JSON/XML. Skipping.");
                            }
                        }
                    }

                    if (reportDataMatch) break;
                }
            }
        }

        if (reportDataMatch) {
            let rawCandidate = reportDataMatch[1] || "";
            // Limpieza de escapes
            if (rawCandidate.includes('\\"')) {
                rawCandidate = rawCandidate.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\\\/g, '\\');
            }

            // FALLBACK: Si el agente envió XML en lugar de JSON, convertirlo aquí
            if (!rawCandidate.trim().startsWith('{') && rawCandidate.includes('<title>')) {
                console.log("🔄 XML detected in report_data, converting to JSON...");
                try {
                    const titleMatch = rawCandidate.match(/<title>([\s\S]*?)<\/title>/i);
                    const summaryMatch = rawCandidate.match(/<summary>([\s\S]*?)<\/summary>/i);
                    const kpisMatch = rawCandidate.match(/<kpis>([\s\S]*?)<\/kpis>/i);

                    const kpis: any[] = [];
                    if (kpisMatch) {
                        const kpiEntries = kpisMatch[1].match(/<kpi>([\s\S]*?)<\/kpi>/gi) || [];
                        for (const entry of kpiEntries) {
                            const l = entry.match(/<label>([\s\S]*?)<\/label>/i);
                            const v = entry.match(/<value>([\s\S]*?)<\/value>/i);
                            const s = entry.match(/<status>([\s\S]*?)<\/status>/i);
                            if (l && v) kpis.push({ label: l[1].trim(), value: v[1].trim(), status: s?.[1].trim() || 'normal' });
                        }
                    }

                    const jsonConv = {
                        title: titleMatch?.[1].trim() || "Reporte de Operación",
                        summary: summaryMatch?.[1].replace(/<paragraph>/g, '').replace(/<\/paragraph>/g, '\n\n').replace(/<\/summary>/g, '').trim() || finalAnswer,
                        kpis: kpis,
                        conclusions: []
                    };
                    const jsonStr = JSON.stringify(jsonConv);
                    reportDataMatch = [jsonStr, jsonStr];
                    console.log("✅ XML to JSON conversion successful.");
                } catch (convError) {
                    console.error("❌ XML to JSON conversion failed:", convError);
                }
            } else {
                // Recortar a primer '{' y último '}' para JSON estándar
                const startIdx = rawCandidate.indexOf('{');
                const endIdx = rawCandidate.lastIndexOf('}');

                if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
                    const cleanJson = rawCandidate.substring(startIdx, endIdx + 1);
                    reportDataMatch = [cleanJson, cleanJson];
                    console.log("📊 Report data cleaned and isolated. Length:", cleanJson.length);
                }
            }
        } else {
            console.log("⚠️ No report_data found in answer or traces.");
        }

        const jsonFallbackMatch = !reportDataMatch ? finalAnswer.match(/\{[\s\S]*?"title"[\s\S]*?"summary"[\s\S]*?\}/) : null;
        const hasFlag = finalAnswer.includes('<create_report_flag/>');
        const needsReport = isReportRequest && (reportDataMatch || jsonFallbackMatch || hasFlag);

        // 2. Limpieza radical de tags y bloques técnicos para el chat
        finalAnswer = finalAnswer
            .replace(/<thinking>[\s\S]*?(?:<\/thinking>|$)/g, '')
            .replace(/<function_calls>[\s\S]*?(?:<\/function_calls>|$)/g, '')
            .replace(/<invoke>[\s\S]*?(?:<\/invoke>|$)/g, '')
            .replace(/<function_results>[\s\S]*?(?:<\/function_results>|$)/g, '')
            .replace(/<report_data>[\s\S]*?(?:<\/report_data>|$)/g, '')
            .replace(/<create_report_flag\s*\/?>/g, '')
            .replace(/<answer>([\s\S]*?)(?:<\/answer>|$)/g, '$1')
            // Eliminar bloques JSON residuales si ya tenemos un reporte
            .replace(/\{[\s\S]*?"title"[\s\S]*?"summary"[\s\S]*?\}/g, '')
            .trim();

        let generatedReportId = null;

        if (needsReport) {
            try {
                const { saveWebReport } = await import('@/lib/reports-store');
                let reportData;

                if (reportDataMatch) {
                    let rawJson = reportDataMatch[1];

                    // SANITIZACIÓN CRÍTICA: Escapar caracteres de control dentro de strings JSON.
                    // El agente emite newlines reales en campos como "summary" que son ilegales en JSON.
                    function sanitizeJsonControlChars(str: string): string {
                        let result = '';
                        let inString = false;
                        let escaped = false;
                        for (let i = 0; i < str.length; i++) {
                            const ch = str[i];
                            const code = str.charCodeAt(i);
                            if (escaped) { result += ch; escaped = false; continue; }
                            if (ch === '\\' && inString) { result += ch; escaped = true; continue; }
                            if (ch === '"') { inString = !inString; result += ch; continue; }
                            if (inString && code < 32) {
                                if (code === 10) result += '\\n';
                                else if (code === 13) result += '\\r';
                                else if (code === 9) result += '\\t';
                                else result += '\\u' + code.toString(16).padStart(4, '0');
                            } else {
                                result += ch;
                            }
                        }
                        return result;
                    }

                    rawJson = sanitizeJsonControlChars(rawJson);

                    try {
                        reportData = JSON.parse(rawJson);
                        console.log("✅ JSON parsed successfully!");
                    } catch (e) {
                        console.error("❌ Standard parse failed, attempting brace repair...", e);
                        let repaired = rawJson;
                        const openBraces = (repaired.match(/\{/g) || []).length;
                        const closeBraces = (repaired.match(/\}/g) || []).length;
                        const openBrackets = (repaired.match(/\[/g) || []).length;
                        const closeBrackets = (repaired.match(/\]/g) || []).length;

                        for (let i = 0; i < openBrackets - closeBrackets; i++) repaired += ']';
                        for (let i = 0; i < openBraces - closeBraces; i++) repaired += '}';

                        try {
                            reportData = JSON.parse(repaired);
                            console.log("✅ JSON repaired successfully!");
                        } catch (repairError) {
                            console.error("❌ JSON repair failed", repairError);
                        }
                    }
                } else if (jsonFallbackMatch) {
                    try {
                        reportData = JSON.parse(jsonFallbackMatch[0].trim());
                    } catch (e) {
                        console.error("❌ Failed to parse raw JSON fallback", e);
                    }
                }

                if (!reportData) {
                    // Generar data básica si solo vino el flag o falló el JSON
                    reportData = {
                        title: "Análisis Automático de Operación",
                        summary: finalAnswer, // Sin truncamiento
                        conclusions: [finalAnswer], // Sin truncamiento
                        anomalies: [],
                        charts: []
                    };
                }

                // NORMALIZACIÓN ROBUSTA DE KPIs: El agente a veces envía 'name', 'parameter' o 'variable' en lugar de 'label'
                if (Array.isArray(reportData.kpis)) {
                    reportData.kpis = reportData.kpis.map((kpi: any) => {
                        const label = kpi.label || kpi.name || kpi.parameter || kpi.variable || kpi.id || "Parámetro Técnico";

                        // Si es formato comparativo directo {name, feb5, feb6}
                        const keys = Object.keys(kpi);
                        const dataKeys = keys.filter(k => k !== 'label' && k !== 'name' && k !== 'parameter' && k !== 'variable' && k !== 'id' && k !== 'unit' && k !== 'status' && k !== 'delta' && k !== 'trend' && k !== 'comparisonValue');

                        if (dataKeys.length >= 2 && !kpi.comparisonValue) {
                            const [v1Key, v2Key] = dataKeys;
                            const v1 = parseFloat(kpi[v1Key]);
                            const v2 = parseFloat(kpi[v2Key]);
                            return {
                                ...kpi,
                                label,
                                value: !isNaN(v2) ? v2.toFixed(2) : String(kpi[v2Key]),
                                comparisonValue: !isNaN(v1) ? v1.toFixed(2) : String(kpi[v1Key]),
                                unit: kpi.unit || '',
                                trend: (v2 - v1) > 0.01 ? 'up' : (v2 - v1) < -0.01 ? 'down' : 'stable'
                            };
                        }

                        return { ...kpi, label };
                    });
                }

                generatedReportId = await saveWebReport(reportData);
                const reportLink = `/reports/${generatedReportId}`;
                console.log(`✅ Report generated and saved: ${generatedReportId}`);

                // OPTIMIZACIÓN DE BREVEDAD: Si hay un reporte, ignoramos el texto largo del agente fuera del JSON
                let shortLabel = finalAnswer.match(/Reporte.*listo\./i)?.[0] || "Reporte técnico generado con éxito.";
                finalAnswer = `${shortLabel}\n\n📊 **Reporte Dinámico Listo:** [Ver Informe Detallado](${reportLink})`;
            } catch (saveError) {
                console.error('❌ Error processing report tag or saving to S3:', saveError);
                // Si falla, al menos quitamos el placeholder roto para no confundir al usuario
                finalAnswer = finalAnswer.replace(/\[report_id\]/g, 'error-id');
                finalAnswer = finalAnswer.replace(/\/reports\/error-id/g, '(Error al generar reporte)');
            }
        }

        // 3. Fallback si la respuesta quedó vacía tras la limpieza
        if (!finalAnswer && generatedReportId) {
            finalAnswer = `He generado un informe detallado basado en tu solicitud. Puedes verlo aquí: [Ver Reporte](/reports/${generatedReportId})`;
        } else if (!finalAnswer) {
            finalAnswer = "He procesado tu consulta, pero no tengo un resumen para mostrar. Por favor intenta ser más específico.";
        }

        // Actualizar a completed
        job.status = 'completed';
        job.result = {
            answer: finalAnswer,
            reportId: generatedReportId,
            sessionId: sessionId,
            agentType: 'bedrock-agent',
            sources: agentResponse.citations || [],
            trace: agentResponse.trace
        };
        jobs.set(jobId, job);

        console.log(`✅ Job ${jobId} completed`);

    } catch (error: any) {
        console.error(`❌ Job ${jobId} failed:`, error);

        job.status = 'error';
        job.error = error.message;
        job.result = {
            error: 'Failed to process query',
            details: error.message,
            answer: 'Lo siento, hubo un error al procesar tu consulta. Por favor, intenta de nuevo.'
        };
        jobs.set(jobId, job);
    }
}
