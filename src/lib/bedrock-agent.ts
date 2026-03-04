import { BedrockAgentRuntimeClient, InvokeAgentCommand } from '@aws-sdk/client-bedrock-agent-runtime';

const client = new BedrockAgentRuntimeClient({
    region: process.env.BEDROCK_REGION || process.env.REGION || 'us-east-1',
    // Solo usar credenciales si existen y no son strings vacíos
    ...(process.env.NEXT_AWS_ACCESS_KEY_ID && process.env.NEXT_AWS_ACCESS_KEY_ID.trim() !== '' &&
        process.env.NEXT_AWS_SECRET_ACCESS_KEY && process.env.NEXT_AWS_SECRET_ACCESS_KEY.trim() !== '' ? {
        credentials: {
            accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID.trim(),
            secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY.trim(),
        }
    } : {}),
});

export interface CitationSource {
    fileName: string;
    snippet: string;
}

export interface AgentResponse {
    answer: string;
    citations?: CitationSource[];
    trace?: any[];
}

/**
 * Extrae las fuentes de citación de los eventos del agente
 */
function extractCitations(rawCitations: any[]): CitationSource[] {
    const sources: CitationSource[] = [];
    const seenFiles = new Set<string>();

    for (const citationGroup of rawCitations) {
        const items = Array.isArray(citationGroup) ? citationGroup : [citationGroup];
        for (const citation of items) {
            const references = citation?.retrievedReferences || [];
            for (const ref of references) {
                const uri = ref?.location?.s3Location?.uri || ref?.location?.uri || '';
                const content = ref?.content?.text || '';

                // Extraer solo el nombre del archivo del URI de S3
                const fileName = uri.split('/').pop() || uri;

                if (fileName && !seenFiles.has(fileName)) {
                    seenFiles.add(fileName);
                    sources.push({
                        fileName: fileName.replace('.md', '').replace('.pdf', ''),
                        snippet: content.substring(0, 200)
                    });
                }
            }
        }
    }

    return sources;
}

/**
 * Invoca el Bedrock Agent y maneja la respuesta en streaming
 */
export async function invokeAgent(
    userMessage: string,
    sessionId: string = `session-${Date.now()}`
): Promise<AgentResponse> {
    const agentId = process.env.BEDROCK_AGENT_ID;
    const agentAliasId = process.env.BEDROCK_AGENT_ALIAS_ID || 'TSTALIASID';

    if (!agentId) {
        throw new Error('BEDROCK_AGENT_ID environment variable is not set');
    }

    const command = new InvokeAgentCommand({
        agentId,
        agentAliasId,
        sessionId,
        inputText: userMessage,
        enableTrace: true,
    });

    console.log('🤖 Invoking Bedrock Agent:', { agentId, sessionId, message: userMessage.substring(0, 100) });

    try {
        const response = await client.send(command);

        let completionText = '';
        const rawCitations: any[] = [];
        const trace: any[] = [];

        if (response.completion) {
            for await (const event of response.completion) {
                if (event.chunk) {
                    const chunk = event.chunk;
                    if (chunk.bytes) {
                        const text = new TextDecoder().decode(chunk.bytes);
                        completionText += text;
                    }
                    // Las citaciones vienen adjuntas al chunk en KB responses
                    if ((chunk as any).attribution?.citations) {
                        rawCitations.push(...(chunk as any).attribution.citations);
                    }
                }

                if (event.trace) {
                    trace.push(event.trace);
                    console.log('🔍 Agent trace:', JSON.stringify(event.trace, null, 2));
                }

                // Fallback: citaciones a nivel de evento
                if ((event as any).citations) {
                    rawCitations.push((event as any).citations);
                }
            }
        }

        // Procesar y deduplicar citaciones
        const citations = extractCitations(rawCitations);
        if (citations.length > 0) {
            console.log('📚 Citations found:', citations.map(c => c.fileName));
        }

        console.log('✅ Agent response completed:', completionText.substring(0, 200));

        return {
            answer: completionText || 'El agente no pudo generar una respuesta.',
            citations: citations.length > 0 ? citations : undefined,
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
