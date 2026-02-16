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

const jobs = new Map<string, Job>();

// Limpiar jobs antiguos (>5 minutos)
setInterval(() => {
    const now = Date.now();
    for (const [id, job] of jobs.entries()) {
        if (now - job.createdAt > 5 * 60 * 1000) {
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

        // Invocar el Bedrock Agent (puede tardar 40+ segundos)
        const agentResponse = await invokeAgent(message, sessionId);

        // Actualizar a completed
        job.status = 'completed';
        job.result = {
            answer: agentResponse.answer,
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
