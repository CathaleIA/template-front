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

        const isReportRequest = /informe|reporte|resumen mensual|reporte mensual|análisis mensual|análisis del mes|gráficas|graficas|dashboard|generar reporte/i.test(message);
        const isMaintenanceRequest = /mantenimiento|mantención|próximo mantenimiento|último mantenimiento|programar mantenimiento|recordatorio|agendar|correo de mantenimiento|notificación de mantenimiento/i.test(message);

        const reportProtocol = `
        [INSTRUCCIÓN DE SISTEMA - CONTEXTO- REPORTES]
        - Si el usuario pide un "reporte", "resumen" o "gráfica" para un mes o semana, usa GROUP BY substr(timestamp, 1, 10) (para días) o substr(timestamp, 1, 13) (para horas).
        - AGREGACIONES: SI USAS GROUP BY, TODAS las columnas del SELECT deben ser agregaciones (AVG, MAX, MIN) o estar en el GROUP BY.
        - EFICIENCIA: No intentes fórmulas complejas de eficiencia en el SQL. Solo trae los promedios de voltaje y corriente.
        - VERACIDAD: NUNCA inventes datos. Si no hay registros para un día, no lo incluyas en los resultados.
        - LIMIT 50 si no es una agregación específica.

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

        ${isReportRequest ? `[MODO: GENERACIÓN DE REPORTE TÉCNICO INDUSTRIAL]
        El usuario ha solicitado un análisis técnico profundo. Debes:
        1. Consultar Athena para el periodo solicitado.
        2. Escribir un resumen profesional en el chat.
        3. Generar un bloque <report_data> con un JSON que incluya:
           - "title": Título técnico descriptivo.
           - "kpis": Mínimo 6 KPIs técnicos (Voltajes, Eficiencia, Temperatura Promedio, Presión de Aceite, Factor de Carga).
           - "summary": Análisis NARRATIVO EXTENSO (mínimo 4 párrafos). Detalla hallazgos por sistema (Cilindros, Lubricación, Enfriamiento).
           - "charts": Series de tiempo Plotly (x, y). MÁXIMO 2 charts, 5 puntos cada uno.
           - "conclusions": Diagnóstico profundo y recomendaciones técnicas (Array de strings).
        
        REGLAS DE ORO:
        - EXTENSIÓN: Sé lo más extenso y detallado posible en el "summary". No uses bullet points ahí; úsalos en "conclusions".
        - LOS CHARTS DEBEN TENER LA LLAVE "data" COMO UN ARRAY.
        - Si no hay datos para un día, refléjalo en el análisis técnico, no lo ocultes.`
                : `[MODO: CONSULTA SIMPLE]
        El usuario hace una pregunta directa. Responde con texto claro y conciso.
        NO generes bloques <report_data> ni JSON. Solo responde la pregunta.` }
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

                    console.log(`🔍 Found ${candidates.length} candidate fields to search in trace.`);

                    for (const candidate of candidates) {
                        if (typeof candidate !== 'string') continue;
                        const m = candidate.match(/<report_data>([\s\S]*?)(?:<\/report_data>|$)/);
                        if (m && m[1]?.includes('{')) {
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
                            const firstBrace = content.indexOf('{');
                            if (firstBrace !== -1) content = content.substring(firstBrace);

                            // VALIDACIÓN: solo aceptar si contiene "title" (es JSON real, no texto de instrucción)
                            if (content.includes('"title"')) {
                                reportDataMatch = [content, content];
                                console.log("✅ Report data recovered from full trace serialization (decoded unicode escapes)!");
                            } else {
                                console.log("⚠️ Fallback match is instruction text, not report JSON. Skipping.");
                            }
                        }
                    }

                    if (reportDataMatch) break;
                }
            }
        }

        if (reportDataMatch) {
            let rawCandidate = reportDataMatch[1] || "";
            // Limpieza extrema de escapes de serialización
            if (rawCandidate.includes('\\"')) {
                rawCandidate = rawCandidate.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\\\/g, '\\');
            }

            // Recortar a primer '{' y último '}'
            const startIdx = rawCandidate.indexOf('{');
            const endIdx = rawCandidate.lastIndexOf('}');

            if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
                const cleanJson = rawCandidate.substring(startIdx, endIdx + 1);
                reportDataMatch = [cleanJson, cleanJson];
                console.log("📊 Report data cleaned and isolated. Length:", cleanJson.length);
            } else {
                console.log("⚠️ Report data structure is problematic (missing braces).");
            }
        } else {
            console.log("⚠️ No report_data found in answer or traces.");
        }

        const jsonFallbackMatch = !reportDataMatch ? finalAnswer.match(/\{[\s\S]*?"title"[\s\S]*?"summary"[\s\S]*?\}/) : null;
        const hasFlag = finalAnswer.includes('<create_report_flag/>');
        // Solo activar reporte si el usuario lo pidió explícitamente
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

                // NORMALIZACIÓN DE KPIs: El agente a veces envía formato comparativo {name, feb5, feb6}
                // en lugar del esperado {label, value, unit}. Convertir automáticamente.
                if (Array.isArray(reportData.kpis) && reportData.kpis.length > 0) {
                    const firstKpi = reportData.kpis[0];
                    if (firstKpi.name && !firstKpi.label) {
                        console.log("🔄 Normalizing KPIs from comparative format to standard format...");
                        const dateKeys = Object.keys(firstKpi).filter(k => k !== 'name' && k !== 'unit');
                        const normalizedKpis: any[] = [];

                        for (const kpi of reportData.kpis) {
                            if (dateKeys.length >= 2) {
                                const [day1Key, day2Key] = dateKeys;
                                const val1 = Number(kpi[day1Key]);
                                const val2 = Number(kpi[day2Key]);
                                const diff = val2 - val1;

                                normalizedKpis.push({
                                    label: kpi.name,
                                    value: !isNaN(val2) ? val2.toFixed(2) : String(kpi[day2Key]),
                                    unit: kpi.unit || '',
                                    trend: diff > 0.01 ? 'up' : diff < -0.01 ? 'down' : 'stable'
                                });
                            } else {
                                const valKey = dateKeys[0];
                                normalizedKpis.push({
                                    label: kpi.name,
                                    value: String(kpi[valKey]),
                                    unit: kpi.unit || '',
                                    trend: 'stable'
                                });
                            }
                        }
                        reportData.kpis = normalizedKpis;
                    }
                }

                generatedReportId = await saveWebReport(reportData);
                const reportLink = `/reports/${generatedReportId}`;
                console.log(`✅ Report generated and saved: ${generatedReportId}`);

                // Reemplazar respuesta con mensaje breve y profesional
                finalAnswer = `He generado el informe con los datos de ${reportData.title || 'tu solicitud'}.\n\n📊 **Reporte Listo:** [Ver Informe Detallado](${reportLink})`;
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
