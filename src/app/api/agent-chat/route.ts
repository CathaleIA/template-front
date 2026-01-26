import { NextResponse } from 'next/server';
import { invokeAgent, generateSessionId } from '@/lib/bedrock-agent';

/**
 * API Route para el nuevo Bedrock Agent
 * Ruta: /api/agent-chat
 * 
 * Este endpoint reemplaza la lógica manual de route.ts con el Bedrock Agent,
 * que tiene acceso a Action Groups (Lambda) para consultar datos y verificar umbrales.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { message, sessionId } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        console.log('📨 Agent Chat Request:', message);

        // Generar o usar sessionId existente para mantener contexto
        const finalSessionId = sessionId || generateSessionId();

        // Invocar el Bedrock Agent
        const agentResponse = await invokeAgent(message, finalSessionId);

        return NextResponse.json({
            answer: agentResponse.answer,
            sessionId: finalSessionId,
            agentType: 'bedrock-agent',
            sources: agentResponse.citations || [],
            trace: agentResponse.trace, // Útil para debugging
        });

    } catch (error: any) {
        console.error('❌ Agent Chat Error:', error);

        // Manejo de errores específicos
        if (error.message?.includes('BEDROCK_AGENT_ID')) {
            return NextResponse.json(
                {
                    error: 'Agent not configured',
                    details: 'El Bedrock Agent no ha sido configurado. Por favor, configura la variable de entorno BEDROCK_AGENT_ID.',
                    answer: 'El asistente avanzado no está configurado aún. Estamos trabajando en ello.'
                },
                { status: 500 }
            );
        }

        if (error.message?.includes('AccessDeniedException')) {
            return NextResponse.json(
                {
                    error: 'Access denied',
                    details: 'Las credenciales de AWS no tienen permisos para invocar el Bedrock Agent.',
                    answer: 'No tengo permisos para acceder al sistema de análisis avanzado. Por favor, contacta al administrador.'
                },
                { status: 403 }
            );
        }

        return NextResponse.json(
            {
                error: 'Failed to process query',
                details: error.message,
                answer: 'Lo siento, hubo un error al procesar tu consulta. Por favor, intenta de nuevo.'
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        message: 'Bedrock Agent Chat API is ready',
        backend: 'AWS Bedrock Agent',
        agentId: process.env.BEDROCK_AGENT_ID || 'not configured',
        features: [
            'Natural language data queries',
            'Threshold monitoring',
            'Multi-step reasoning',
            'Future: PDF manual analysis'
        ]
    });
}
