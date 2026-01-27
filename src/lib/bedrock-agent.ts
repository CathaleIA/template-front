import { BedrockAgentRuntimeClient, InvokeAgentCommand } from '@aws-sdk/client-bedrock-agent-runtime';

const client = new BedrockAgentRuntimeClient({
    region: process.env.BEDROCK_REGION || process.env.REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY || '',
    },
});

export interface AgentResponse {
    answer: string;
    citations?: any[];
    trace?: any[];
}

/**
 * Invoca el Bedrock Agent y maneja la respuesta en streaming
 */
export async function invokeAgent(
    userMessage: string,
    sessionId: string = `session-${Date.now()}`
): Promise<AgentResponse> {
    const agentId = process.env.BEDROCK_AGENT_ID;
    const agentAliasId = process.env.BEDROCK_AGENT_ALIAS_ID || 'TSTALIASID'; // ID por defecto del alias de prueba

    if (!agentId) {
        throw new Error('BEDROCK_AGENT_ID environment variable is not set');
    }

    const command = new InvokeAgentCommand({
        agentId,
        agentAliasId,
        sessionId,
        inputText: userMessage,
        enableTrace: true, // Para debugging
    });

    console.log('🤖 Invoking Bedrock Agent:', { agentId, sessionId, message: userMessage.substring(0, 100) });

    try {
        const response = await client.send(command);

        // El agente devuelve un stream de eventos
        let completionText = '';
        const citations: any[] = [];
        const trace: any[] = [];

        if (response.completion) {
            for await (const event of response.completion) {
                if (event.chunk) {
                    const chunk = event.chunk;
                    if (chunk.bytes) {
                        const text = new TextDecoder().decode(chunk.bytes);
                        completionText += text;
                    }
                }

                if (event.trace) {
                    trace.push(event.trace);
                    console.log('🔍 Agent trace:', JSON.stringify(event.trace, null, 2));
                }

                // Capturar citas si las hay (para Knowledge Bases)
                if ((event as any).citations) {
                    citations.push((event as any).citations);
                }
            }
        }

        console.log('✅ Agent response completed:', completionText.substring(0, 200));

        return {
            answer: completionText || 'El agente no pudo generar una respuesta.',
            citations,
            trace: trace.length > 0 ? trace : undefined,
        };
    } catch (error: any) {
        console.error('❌ Error invoking Bedrock Agent:', error);
        throw new Error(`Agent invocation failed: ${error.message}`);
    }
}

/**
 * Genera un ID de sesión único basado en el usuario o timestamp
 */
export function generateSessionId(userId?: string): string {
    const timestamp = Date.now();
    return userId ? `user-${userId}-${timestamp}` : `session-${timestamp}`;
}
