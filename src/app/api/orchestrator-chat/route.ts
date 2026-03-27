import { NextResponse } from 'next/server';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

/**
 * API Route: /api/orchestrator-chat
 *
 * Llama al Lambda iot-orchestrator, que internamente:
 *   - Clasifica el intent (realtime vs histórico) con Claude
 *   - Delega al agente Bedrock correspondiente
 *   - Retorna { answer, agent_used, session_id }
 *
 * Usa el mismo sistema de jobs/polling que /api/agent-chat
 * para no bloquear el navegador mientras el agente procesa.
 *
 * NO crea ni modifica API Gateways. La Lambda se invoca
 * directamente desde el servidor Next.js via AWS SDK.
 */

// ── Cliente Lambda ────────────────────────────────────────────────────────────
const lambdaClient = new LambdaClient({
    region: process.env.BEDROCK_REGION || 'us-east-1',
    ...(process.env.NEXT_AWS_ACCESS_KEY_ID?.trim() && process.env.NEXT_AWS_SECRET_ACCESS_KEY?.trim()
        ? {
            credentials: {
                accessKeyId:     process.env.NEXT_AWS_ACCESS_KEY_ID.trim(),
                secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY.trim(),
            },
        }
        : {}),
});

const ORCHESTRATOR_LAMBDA = process.env.ORCHESTRATOR_LAMBDA_NAME || 'iot-orchestrator';

// ── Sistema de jobs en memoria (mismo patrón que agent-chat) ──────────────────
interface OrchestratorJob {
    id:        string;
    status:    'pending' | 'processing' | 'completed' | 'error';
    result?:   { answer: string; agent_used: string; session_id: string };
    error?:    string;
    createdAt: number;
}

declare global { var __orchestratorJobs: Map<string, OrchestratorJob> | undefined; }
if (!global.__orchestratorJobs) global.__orchestratorJobs = new Map();
const jobs: Map<string, OrchestratorJob> = global.__orchestratorJobs;

// Limpiar jobs más de 10 minutos
setInterval(() => {
    const now = Date.now();
    for (const [id, job] of jobs.entries()) {
        if (now - job.createdAt > 10 * 60 * 1000) jobs.delete(id);
    }
}, 60_000);

// ── Invocar el Lambda orquestador ─────────────────────────────────────────────
async function callOrchestrator(message: string, sessionId: string) {
    const payload = JSON.stringify({ message, sessionId });

    const cmd = new InvokeCommand({
        FunctionName:   ORCHESTRATOR_LAMBDA,
        InvocationType: 'RequestResponse',
        Payload:        Buffer.from(payload),
    });

    const response = await lambdaClient.send(cmd);

    if (response.FunctionError) {
        const errPayload = response.Payload
            ? JSON.parse(Buffer.from(response.Payload).toString())
            : {};
        throw new Error(`Lambda error: ${errPayload.errorMessage || response.FunctionError}`);
    }

    const body = response.Payload
        ? JSON.parse(Buffer.from(response.Payload).toString())
        : {};

    // El Lambda retorna { statusCode, body: "{...}" }
    const inner = typeof body.body === 'string' ? JSON.parse(body.body) : body;

    if (body.statusCode >= 400) {
        throw new Error(inner.error || `Lambda returned ${body.statusCode}`);
    }

    return {
        answer:     inner.answer     ?? 'Sin respuesta del orquestador.',
        agent_used: inner.agent_used ?? 'unknown',
        session_id: inner.session_id ?? sessionId,
    };
}

// ── POST: Iniciar un job ──────────────────────────────────────────────────────
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { message, sessionId, userId } = body;

        if (!message?.trim()) {
            return NextResponse.json({ error: 'El campo message es requerido' }, { status: 400 });
        }

        const jobId     = `orch-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const sessionId_ = sessionId || `user-${userId || 'anon'}-${Date.now()}`;

        const job: OrchestratorJob = {
            id:        jobId,
            status:    'processing',
            createdAt: Date.now(),
        };
        jobs.set(jobId, job);

        // Ejecutar en background sin await para responder jobId inmediatamente
        callOrchestrator(message, sessionId_)
            .then(result => {
                job.status = 'completed';
                job.result = result;
            })
            .catch(err => {
                console.error('[orchestrator-chat] Error:', err);
                job.status = 'error';
                job.error  = err.message;
            });

        return NextResponse.json({ jobId, status: 'processing' });

    } catch (err: any) {
        console.error('[orchestrator-chat POST]', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// ── GET: Consultar estado de un job ───────────────────────────────────────────
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const jobId = searchParams.get('jobId');

        if (!jobId) {
            return NextResponse.json({ error: 'jobId requerido' }, { status: 400 });
        }

        const job = jobs.get(jobId);
        if (!job) {
            return NextResponse.json({ error: 'Job no encontrado' }, { status: 404 });
        }

        if (job.status === 'completed') {
            return NextResponse.json({
                status:     'completed',
                answer:     job.result!.answer,
                agent_used: job.result!.agent_used,
                session_id: job.result!.session_id,
            });
        }

        if (job.status === 'error') {
            return NextResponse.json({ status: 'error', error: job.error }, { status: 500 });
        }

        return NextResponse.json({ status: job.status });

    } catch (err: any) {
        console.error('[orchestrator-chat GET]', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
