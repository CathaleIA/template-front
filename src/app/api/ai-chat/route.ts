import { NextResponse } from 'next/server';

// URL de tu Lambda via API Gateway
const LAMBDA_ENDPOINT = process.env.NEXT_PUBLIC_LAMBDA_ENDPOINT ||
  'https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod/query';

// Clasificador inteligente de preguntas
async function classifyQuestion(question: string): Promise<'manuals' | 'data'> {
  const lowerQuestion = question.toLowerCase();

  // Palabras clave para DATOS
  const dataKeywords = [
    'temperatura', 'voltaje', 'corriente', 'potencia', 'frecuencia',
    'presión', 'aceite', 'refrigerante', 'cilindro', 'breaker',
    'máxima', 'mínima', 'promedio', 'actual', 'ahora', 'ayer',
    'este mes', 'última', 'histórico', 'cuánto', 'cuándo',
    'estado', 'valor', 'lectura', 'dato'
  ];

  // Palabras clave para MANUALES
  const manualKeywords = [
    'cómo', 'qué es', 'para qué', 'manual', 'instrucción',
    'procedimiento', 'mantenimiento', 'reparar', 'solucionar',
    'problema', 'error', 'falla', 'causa', 'síntoma',
    'especificación', 'característica', 'función', 'componente'
  ];

  const dataScore = dataKeywords.filter(kw => lowerQuestion.includes(kw)).length;
  const manualScore = manualKeywords.filter(kw => lowerQuestion.includes(kw)).length;

  // Si tiene más keywords de datos, es pregunta de datos
  if (dataScore > manualScore) {
    return 'data';
  }

  // Por defecto, asumir manuales (más seguro para preguntas técnicas)
  return 'manuals';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Clasificar la pregunta para elegir el agente correcto
    const agentType = await classifyQuestion(message);

    const agentEmoji = agentType === 'data' ? '📊' : '📚';
    const agentName = agentType === 'data' ? 'Data Agent' : 'Manuals Agent';
    console.log(`${agentEmoji} Querying ${agentName} via Lambda:`, message);

    // Llamar a la Lambda via API Gateway
    const response = await fetch(LAMBDA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        agentType, // 'manuals' o 'data' según clasificación
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Lambda Error:', errorData);
      return NextResponse.json(
        {
          error: `Failed to query ${agentName}`,
          details: errorData.error || response.statusText
        },
        { status: response.status }
      );
    }

    const result = await response.json();

    console.log(`✅ ${agentName} completed successfully`);

    // Return in expected format
    return NextResponse.json({
      answer: result.answer,
      agentType: result.agentType,
      sources: result.sources || [],
    });

  } catch (error: any) {
    console.error('❌ AI Agent Error:', error);
    return NextResponse.json(
      { error: 'Failed to query AI agent', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Health check simple
    return NextResponse.json({
      status: 'ok',
      message: 'AI Chat API is ready with intelligent routing',
      endpoint: LAMBDA_ENDPOINT !== 'https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod/query'
        ? 'configured'
        : 'pending configuration',
      agents: ['manuals', 'data']
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}
