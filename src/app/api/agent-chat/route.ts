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

        const reportProtocol = `
        [INSTRUCCIÓN DE SISTEMA - CONTEXTO TEMPORAL]
        - La fecha y hora actual es: ${currentDate} ${now.toLocaleTimeString()}
        - Hoy es ${currentDate}. Interpreta "enero" como Enero ${now.getFullYear()}.

        ${isReportRequest ? `[MODO: GENERACIÓN DE REPORTE VISUAL]
        El usuario ha pedido un INFORME. Debes:
        1. Consultar los datos con queryData.
        2. Escribir un resumen BREVE en el chat (2-3 párrafos).
        3. Al FINAL, generar un bloque <report_data>...</report_data> con el JSON real del reporte.
        
        REGLAS CRÍTICAS PARA EL JSON (MUY IMPORTANTE - límite de tokens):
        - El bloque <report_data> debe contener UN JSON VÁLIDO directamente, NO una referencia a él.
        - INCORRECTO: "los datos se encuentran en el bloque <report_data>"
        - CORRECTO: <report_data>{ "title": "...", "summary": "...", "conclusions": [...], "charts": [...] }</report_data>
        - LÍMITE ESTRICTO: MÁXIMO 2 gráficos en total, MÁXIMO 5 puntos por serie de datos.
        - Para los charts, usa formato Plotly: { "type": "bar", "layout": { "title": "..." }, "data": [{ "x": [...], "y": [...], "name": "...", "type": "bar" }] }
        - Colores: verde #22c55e para valores normales, rojo #ef4444 para alertas.
        - USA SOLO los datos reales de la consulta, no valores inventados.
        - El JSON DEBE cerrar todas las llaves y corchetes correctamente. Si no cabe, reduce los datos.`
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

        if (!reportDataMatch && agentResponse.trace) {
            console.log("🔍 Looking for report data in traces...");
            // Buscar en TODOS los campos posibles de cada trace event
            for (const t of agentResponse.trace) {
                // Serializar todo el trace event a string y buscar ahí
                const fullTraceStr = JSON.stringify(t);
                if (fullTraceStr.includes('report_data')) {
                    console.log("🔍 Found 'report_data' keyword in trace event, extracting...");

                    // Intentar extraer de campos específicos primero
                    const candidates = [
                        t.orchestrationTrace?.rationale?.text,
                        t.orchestrationTrace?.modelInvocationOutput?.rawResponse?.content,
                        // El rawResponse.content a veces es un string con todo  
                        typeof t.orchestrationTrace?.modelInvocationOutput?.rawResponse?.content === 'string'
                            ? t.orchestrationTrace.modelInvocationOutput.rawResponse.content
                            : null,
                    ].filter(Boolean);

                    for (const candidate of candidates) {
                        const m = candidate.match(/<report_data>([\s\S]*?)(?:<\/report_data>|$)/);
                        if (m) {
                            reportDataMatch = m;
                            console.log("✅ Report data recovered from trace field!");
                            break;
                        }
                    }

                    // Si no encontramos en campos específicos, buscar en el string completo
                    if (!reportDataMatch) {
                        // Deserializar el JSON del trace y buscar el bloque <report_data>
                        const fullMatch = fullTraceStr.match(/report_data>([\s\S]*?)(?:<\/?report_data>|$)/);
                        if (fullMatch) {
                            // Limpiar escapes de JSON
                            let cleanedJson = fullMatch[1]
                                .replace(/\\n/g, '\n')
                                .replace(/\\"/g, '"')
                                .replace(/\\\\/g, '\\')
                                .trim();
                            // Remover el cierre de tag si quedó
                            cleanedJson = cleanedJson.replace(/<\/report_data>[\s\S]*$/, '').trim();
                            reportDataMatch = [fullMatch[0], cleanedJson];
                            console.log("✅ Report data recovered from full trace serialization!");
                        }
                    }

                    if (reportDataMatch) break;
                }
            }
        }

        if (reportDataMatch) {
            console.log("📊 Report data found! Length:", reportDataMatch[1]?.length || 0);
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
                    let rawJson = reportDataMatch[1].trim();
                    try {
                        // Intentar parsear normal
                        reportData = JSON.parse(rawJson.endsWith('</report_data>') ? rawJson.replace('</report_data>', '') : rawJson);
                    } catch (e) {
                        console.error("❌ Truncated JSON detected, attempting repair...");
                        // Reparación básica de JSON truncado (cerrar llaves y corchetes)
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
                        summary: finalAnswer.substring(0, 300) + "...",
                        conclusions: [finalAnswer.substring(0, 100)],
                        anomalies: [],
                        charts: []
                    };
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
