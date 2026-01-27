import { NextResponse } from 'next/server';
import { invokeBedrock } from '@/lib/bedrock';
import { getLatestRealtimeData } from '@/lib/iot-realtime';
import { executeAthenaQuery, getDDLScript } from '@/lib/athena-data';

// Clasificador inteligente de preguntas
function classifyQuestion(question: string): 'conversation' | 'manuals' | 'data' {
    const lowerQuestion = question.toLowerCase();

    // Detectar saludos y conversación general
    const conversationKeywords = [
        'hola', 'buenos días', 'buenas tardes', 'buenas noches',
        'qué tal', 'cómo estás', 'ayuda', 'ayúdame',
        'qué puedes hacer', 'qué sabes', 'quién eres',
        'gracias', 'ok', 'entendido', 'perfecto'
    ];

    const dataKeywords = [
        'temperatura', 'voltaje', 'corriente', 'potencia', 'frecuencia',
        'presión', 'aceite', 'refrigerante', 'cilindro', 'breaker',
        'máxima', 'mínima', 'promedio', 'actual', 'ahora', 'ayer',
        'este mes', 'última', 'histórico', 'cuánto', 'cuándo',
        'estado', 'valor', 'lectura', 'dato', 'generador', 'motor',
        'devanado', 'rodamiento', 'busbar', 'enfriamiento',
        'funcionamiento', 'falla', 'error', 'alerta', 'problema',
        'desfase', 'máquina', 'anomalía', 'rendimiento', 'comportamiento'
    ];

    const conversationScore = conversationKeywords.filter(kw => lowerQuestion.includes(kw)).length;
    const dataScore = dataKeywords.filter(kw => lowerQuestion.includes(kw)).length;

    if (conversationScore > 0) return 'conversation';
    if (dataScore > 0) return 'data';
    return 'manuals';
}

// Extraer rango de fechas de la pregunta
function extractDateRange(question: string): { start: Date; end: Date } {
    const now = new Date();
    const lowerQuestion = question.toLowerCase();

    // Hoy / Día de hoy
    if (lowerQuestion.includes('hoy') || lowerQuestion.includes('día de hoy')) {
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0); // Inicio del día (00:00:00)
        return { start: startOfDay, end: now };
    }

    // Actual / Ahora (solo última hora para consultas de "ahora")
    if (lowerQuestion.includes('actual') || lowerQuestion.includes('ahora')) {
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

        // Manejar conversación general
        if (agentType === 'conversation') {
            console.log('💬 Conversational query detected');

            const conversationPrompt = `Eres un asistente técnico amigable para un sistema de monitoreo industrial de generadores y motores.

INSTRUCCIONES:
- Responde de forma amigable y profesional en español
- Si te saludan, saluda de vuelta y ofrece ayuda
- Si te preguntan qué puedes hacer, explica que puedes:
  • Consultar datos en tiempo real del generador (voltajes, corrientes, potencia, frecuencia)
  • Consultar datos en tiempo real del motor (temperaturas, aceite, refrigerante)
  • Analizar datos históricos (ayer, última semana, etc.)
  • Calcular máximos, mínimos y promedios
- Si te dan las gracias, responde cortésmente
- Mantén las respuestas breves y al punto
- Si no entiendes algo, pide aclaración`;

            try {
                const answer = await invokeBedrock(
                    [{ role: 'user', content: message }],
                    conversationPrompt
                );

                return NextResponse.json({
                    answer,
                    agentType: 'conversation',
                    sources: [],
                });
            } catch (error: any) {
                console.error('❌ Error in conversation mode:', error);
                return NextResponse.json({
                    answer: 'Hola, soy tu asistente de monitoreo industrial. ¿En qué puedo ayudarte hoy?',
                    agentType: 'conversation',
                    sources: [],
                });
            }
        }

        // Manejar manuales (no implementado aún)
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
            // 1. Decidir fuente (WebSocket Real-Time vs S3 Historical)
            const lowerMessage = message.toLowerCase();

            // Detectar si es una pregunta de agregación (máximo, mínimo, promedio, tendencia)
            const isAggregation = lowerMessage.includes('más alto') ||
                lowerMessage.includes('más bajo') ||
                lowerMessage.includes('máximo') ||
                lowerMessage.includes('mínimo') ||
                lowerMessage.includes('promedio') ||
                lowerMessage.includes('tendencia') ||
                lowerMessage.includes('historial') ||
                lowerMessage.includes('durante') ||
                lowerMessage.includes('a lo largo');

            // Solo usar tiempo real si NO es agregación y pregunta por "ahora/actual"
            const isRealTime = !isAggregation && (
                lowerMessage.includes('ahora') ||
                lowerMessage.includes('actual') ||
                lowerMessage.includes('momento') ||
                lowerMessage.includes('en este momento')
            );

            let contextData = '';
            let dataSource = 'S3 Historical Data';
            let recordCount = 0;

            if (isRealTime) {
                console.log('🚀 Real-time query detected. Fetching latest WebSocket data...');
                const realtimeData = await getLatestRealtimeData(message);
                contextData = `ESTADO ACTUAL EN TIEMPO REAL (WebSocket):\n${JSON.stringify(realtimeData, null, 2)}`;
                dataSource = 'AWS IoT WebSocket (Real-Time)';
                recordCount = 1;
            } else {
                // Modo Histórico (Athena)
                dataSource = 'AWS Athena (Historical)';

                // Calcular fechas para el prompt
                const now = new Date();
                const today = now.toISOString().split('T')[0];
                const yesterdayDate = new Date(now);
                yesterdayDate.setDate(now.getDate() - 1);
                const yesterday = yesterdayDate.toISOString().split('T')[0];

                // 1. Pedir a Bedrock que genere el SQL
                const sqlGenPrompt = `Genera una consulta SQL (Presto/Athena) para responder a la pregunta: "${message}"
                
TABLA: iot_telemetry_db.iot_data
COLUMNAS IMPORTANTES (Usar .value para el valor):
- timestamp (string ISO8601, ej: '2026-01-21T16:45:34.477925Z')
- data.generator (voltage_L1_N.value, voltage_L2_N.value, voltage_L3_N.value, corriente_L1.value, corriente_L2.value, corriente_L3.value, potencia_activa.value, frecuencia.value)
- data.cylinders (Tem_Cyl_1.value hasta Tem_Cyl_20.value, Promedio_tem_cyl.value)
- data.oil_system (Temperatura_aceite.value, Presion_aceite.value)
- data.cooling_system (T_HT_ENTRADA.value, Temp_LT_salida.value)

REGLAS:
- Devuelve SOLO el código SQL, nada de explicación.
- IMPORTANTE: Debes acceder al campo .value para obtener el número. Ejemplo: data.generator.voltage_L1_N.value
- Usa "from_iso8601_timestamp(timestamp)" para el filtro de tiempo.
- CRÍTICO: Athena no permite comparar un timestamp con un string directamente. Ambas partes deben ser timestamps.
- Ejemplo correcto: WHERE from_iso8601_timestamp(timestamp) >= from_iso8601_timestamp('${yesterday}T00:00:00Z')
- NO uses literales de string simples para comparar con timestamps.
- Para "hoy", usa la fecha '${today}'.
- Para "ayer", usa la fecha '${yesterday}'.
- Ejemplo para un mes específico: WHERE from_iso8601_timestamp(timestamp) >= from_iso8601_timestamp('2025-12-01T00:00:00Z') AND from_iso8601_timestamp(timestamp) < from_iso8601_timestamp('2026-01-01T00:00:00Z')
- LIMIT 100 si no es una agregación específica.
`;

                console.log('🤖 Asking Bedrock specifically for SQL...');
                const generatedSQL = await invokeBedrock(
                    [{ role: 'user', content: message }],
                    sqlGenPrompt
                );

                // Limpiar el SQL (a veces Bedrock añade markdown)
                const cleanSQL = generatedSQL.replace(/```sql/g, '').replace(/```/g, '').trim();

                // 2. Ejecutar SQL en Athena
                const rows = await executeAthenaQuery(cleanSQL);

                if (rows.length === 0) {
                    return NextResponse.json({
                        answer: 'No se encontraron datos históricos en Athena para tu consulta. Asegúrate de que la tabla esté creada y tenga datos.',
                        agentType: 'data',
                        sources: [{ source: 'Athena', recordCount: 0 }],
                        sql: cleanSQL
                    });
                }

                // 3. Formatear datos para el contexto final
                contextData = `CONSULTA REALIZADA (SQL):
${cleanSQL}

RESULTADOS OBTENIDOS (${rows.length} filas):
${JSON.stringify(rows, null, 2)}

NOTA: Los resultados arriba corresponden exactamente a los filtros de tiempo (WHERE) aplicados en la consulta SQL.`;
                recordCount = rows.length;
            }

            // 2. Crear contexto para Bedrock
            console.log(`📊 Context created from ${dataSource}`);

            const systemPrompt = `Eres un asistente técnico experto en análisis de datos de IoT para equipos industriales.
Tu objetivo es dar respuestas DIRECTAS y SEGURAS basadas únicamente en los datos proporcionados.

PERIODO DE ANÁLISIS: Se han filtrado los datos específicamente para la consulta del usuario.
DATOS PROPORCIONADOS:
${contextData}

INSTRUCCIONES:
- Responde en español de forma directa. No digas "según los datos proporcionados" o "no puedo determinar el periodo". 
- Confía en que el sistema ya filtró los datos por la fecha correcta solicitada por el usuario.
- Da los valores técnicos inmediatamente.
- Si los datos muestran un valor, asume que es el dato correcto para la fecha consultada.
- No añadas advertencias sobre "falta de contexto de tiempo" a menos que no haya absolutamente ningún dato.`;

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
                    source: dataSource,
                    recordCount: recordCount,
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
        model: process.env.BEDROCK_MODEL_ID || 'claude-3-sonnet',
        s3_bucket: process.env.S3_IOT_BUCKET || 'not configured',
    });
}
