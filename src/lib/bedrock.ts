import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({
  region: process.env.AWS_BEDROCK_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export interface BedrockMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Invoca el modelo de Bedrock (Claude 3 Sonnet) con un conjunto de mensajes
 * @param messages - Array de mensajes de conversación
 * @param systemPrompt - Prompt del sistema opcional para dar contexto
 * @returns Respuesta del modelo
 */
export async function invokeBedrock(
  messages: BedrockMessage[],
  systemPrompt?: string
): Promise<string> {
  const modelId = process.env.AWS_BEDROCK_MODEL_ID ||
    'anthropic.claude-3-sonnet-20240229-v1:0';

  // Validar que los mensajes no estén vacíos
  if (!messages || messages.length === 0) {
    throw new Error('Messages array cannot be empty');
  }

  // Validar que el contenido de los mensajes no esté vacío
  const hasEmptyContent = messages.some(msg => !msg.content || msg.content.trim() === '');
  if (hasEmptyContent) {
    throw new Error('Message content cannot be empty');
  }

  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 4096,
    temperature: 0.7,
    system: systemPrompt || 'Eres un asistente técnico experto en análisis de datos de IoT para equipos industriales.',
    messages: messages.map(msg => ({
      role: msg.role,
      content: msg.content.trim(),
    })),
  };

  console.log('🔍 Bedrock payload preview:', {
    model: modelId,
    messageCount: messages.length,
    systemPromptLength: (systemPrompt || '').length,
    firstMessagePreview: messages[0].content.substring(0, 100) + '...'
  });

  try {
    const command = new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    console.log('✅ Bedrock response received:', {
      hasContent: !!responseBody.content,
      contentLength: responseBody.content?.length || 0
    });

    // Claude responde con un array de contenido
    if (responseBody.content && responseBody.content.length > 0) {
      return responseBody.content[0].text;
    }

    throw new Error('No content in Bedrock response');
  } catch (error: any) {
    console.error('❌ Error invoking Bedrock:', error);
    throw new Error(`Bedrock invocation failed: ${error.message}`);
  }
}

/**
 * Invoca Bedrock con streaming (para respuestas en tiempo real)
 * Nota: Implementación futura si se necesita streaming
 */
export async function invokeBedrockStream(
  messages: BedrockMessage[],
  systemPrompt?: string,
  onChunk?: (text: string) => void
): Promise<string> {
  // Por ahora, usar la versión no-streaming
  return invokeBedrock(messages, systemPrompt);
}
