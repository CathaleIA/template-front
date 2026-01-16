import { NextResponse } from 'next/server';
import { invokeBedrock } from '@/lib/bedrock';
import { getHistoricalData, summarizeData } from '@/lib/s3-data';

// Clasificador inteligente de preguntas
function classifyQuestion(question: string): 'manuals' | 'data' {
    const lowerQuestion = question.toLowerCase();

    const dataKeywords = [
        'temperatura', 'voltaje', 'corriente', 'potencia', 'frecuencia',
        'presión', 'aceite', 'refrigerante', 'cilindro', 'breaker',
        'máxima', 'mínima', 'promedio', 'actual', 'ahora', 'ayer',
        'este mes', 'última', 'histórico', 'cuánto', 'cuándo',
        'estado', 'valor', 'lectura', 'dato', 'generador', 'motor',
        'devanado', 'rodamiento', 'busbar', 'enfriamiento'
    ];

    const dataScore = dataKeywords.filter(kw => lowerQuestion.includes(kw)).length;

    return dataScore > 0 ? 'data' : 'manuals';
}

// Extraer rango de fechas de la pregunta
function extractDateRange(question: string): { start: Date; end: Date } {
    const now = new Date();
    const lowerQuestion = question.toLowerCase();

    // Hoy / Actual / Ahora
    if (lowerQuestion.includes('hoy') || lowerQuestion.includes('actual') || lowerQuestion.includes('ahora')) {
        const start = new Date(now);
        start.setHours(now.getHours() - 1); // Última hora
        return { start, end: now };
    }

    // Ayer
    if (lowerQuestion.includes('ayer')) {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const endOfYesterday = new Date(yesterday);
        endOfYesterday.setHours(23, 59, 59, 999);
        return { start: yesterday, end: endOfYesterday };
    }

    // Última semana
    if (lowerQuestion.includes('semana')) {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return { start: weekAgo, end: now };
    }

    // Día específico de diciembre (ej: "30 de diciembre", "30 diciembre", "30/12")
    const dayMatch = lowerQuestion.match(/(\d{1,2})\s+(?:de\s+)?diciembre/);
    if (dayMatch) {
        const day = parseInt(dayMatch[1]);
        const dayStart = new Date(`2025-12-${day.toString().padStart(2, '0')}T00:00:00Z`);
        const dayEnd = new Date(`2025-12-${day.toString().padStart(2, '0')}T23:59:59Z`);
        return { start: dayStart, end: dayEnd };
    }

    // Último mes
    if (lowerQuestion.includes('mes') || lowerQuestion.includes('diciembre')) {
        const decemberStart = new Date('2025-12-01T00:00:00Z');
        const decemberEnd = new Date('2025-12-31T23:59:59Z');
        return { start: decemberStart, end: decemberEnd };
    }

    // Por defecto: todo diciembre 2025 (donde están los datos históricos)
    const decemberStart = new Date('2025-12-01T00:00:00Z');
    const decemberEnd = new Date('2025-12-31T23:59:59Z');
    return { start: decemberStart, end: decemberEnd };
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { message } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const agentType = classifyQuestion(message);

        // Por ahora solo manejamos datos, manuales se implementará después
        if (agentType === 'manuals') {
            return NextResponse.json({
                answer: 'La funcionalidad de manuales se implementará próximamente. Por ahora, puedo ayudarte con consultas sobre datos de IoT en tiempo real e históricos del generador y motor.\n\nPuedes preguntarme sobre:\n• Potencia, voltajes y corrientes del generador\n• Temperaturas de cilindros del motor\n• Sistema de aceite y enfriamiento\n• Estado del breaker\n• Datos históricos (ayer, última semana, etc.)',
                agentType: 'manuals',
                sources: [],
            });
        }

        // Procesar pregunta de datos
        console.log('📊 Processing data query with Bedrock:', message);

        try {
            // 1. Obtener datos de S3
            const dateRange = extractDateRange(message);
            console.log(`📅 Date range: ${dateRange.start.toISOString()} - ${dateRange.end.toISOString()}`);

            const historicalData = await getHistoricalData(dateRange.start, dateRange.end);
            console.log(`📦 Retrieved ${historicalData.length} records from S3`);

            if (historicalData.length === 0) {
                return NextResponse.json({
                    answer: 'No se encontraron datos para el período solicitado. Esto puede deberse a que:\n\n1. No hay datos disponibles en S3 para ese rango de fechas\n2. El sistema IoT no ha enviado datos recientemente\n3. Puede haber un problema de conectividad\n\nPor favor, intenta con un rango de fechas diferente o verifica que el sistema esté enviando datos.',
                    agentType: 'data',
                    sources: [{
                        source: 'S3 Historical Data',
                        dateRange: `${dateRange.start.toISOString()} - ${dateRange.end.toISOString()}`,
                        recordCount: 0,
                    }],
                });
            }

            // 2. Crear contexto para Bedrock
            const dataSummary = summarizeData(historicalData);
            console.log('📊 Data summary created');

            const systemPrompt = `Eres un asistente técnico experto en análisis de datos de IoT para equipos industriales (generadores y motores).
Tienes acceso a datos históricos de sensores y equipos en tiempo real.

DATOS DISPONIBLES:
${dataSummary}

INSTRUCCIONES:
- Responde en español de forma clara, concisa y profesional
- Usa los datos proporcionados para responder con precisión
- Si no hay datos suficientes para responder con certeza, indícalo claramente
- Proporciona valores numéricos específicos cuando sea relevante
- Menciona el período de tiempo analizado
- Si detectas valores anormales o fuera de rango, menciónalos
- Sé técnico pero comprensible
- Si la pregunta es sobre un parámetro específico, enfócate en ese parámetro`;

            // 3. Invocar Bedrock
            console.log('🤖 Invoking Bedrock...');
            const answer = await invokeBedrock(
                [{ role: 'user', content: message }],
                systemPrompt
            );

            console.log('✅ Bedrock response generated successfully');

            return NextResponse.json({
                answer,
                agentType: 'data',
                sources: [{
                    source: 'S3 Historical Data',
                    dateRange: `${dateRange.start.toLocaleString('es-ES')} - ${dateRange.end.toLocaleString('es-ES')}`,
                    recordCount: historicalData.length,
                }],
            });

        } catch (dataError: any) {
            console.error('❌ Error processing data query:', dataError);

            // Error específico de S3
            if (dataError.name === 'NoSuchBucket' || dataError.name === 'AccessDenied') {
                return NextResponse.json({
                    answer: 'Error de configuración: No se puede acceder al bucket de S3. Por favor, verifica las credenciales de AWS y los permisos del bucket.',
                    agentType: 'data',
                    sources: [],
                    error: dataError.message,
                }, { status: 500 });
            }

            // Error de Bedrock - empty output
            if (dataError.message?.includes('model output must contain') ||
                dataError.message?.includes('cannot both be empty')) {
                return NextResponse.json({
                    answer: 'El modelo de IA no pudo generar una respuesta. Esto puede ocurrir cuando:\n\n1. Los datos encontrados son insuficientes\n2. Hay un problema temporal con Bedrock\n\nPor favor, intenta con una pregunta más específica sobre una fecha concreta (ej: "datos del 30 de diciembre de 2025").',
                    agentType: 'data',
                    sources: [],
                }, { status: 500 });
            }

            // Error de Bedrock - general
            if (dataError.message?.includes('Bedrock')) {
                return NextResponse.json({
                    answer: 'Error al comunicarse con AWS Bedrock. Por favor, verifica que:\n1. Tienes acceso habilitado a Bedrock en tu cuenta AWS\n2. El modelo Claude 3 Sonnet está disponible en tu región\n3. Las credenciales de AWS son correctas',
                    agentType: 'data',
                    sources: [],
                    error: dataError.message,
                }, { status: 500 });
            }

            throw dataError;
        }

    } catch (error: any) {
        console.error('❌ Bedrock Chat Error:', error);
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
        message: 'Bedrock Chat API is ready',
        agents: ['data'],
        backend: 'AWS Bedrock + S3',
        model: process.env.AWS_BEDROCK_MODEL_ID || 'claude-3-sonnet',
        s3_bucket: process.env.AWS_S3_IOT_BUCKET || 'not configured',
    });
}
