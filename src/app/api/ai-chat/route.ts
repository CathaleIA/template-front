import { NextResponse } from 'next/server';

// URL de tu Lambda via API Gateway
// TODO: Reemplazar con tu URL real después del deployment
const LAMBDA_ENDPOINT = process.env.NEXT_PUBLIC_LAMBDA_ENDPOINT ||
  'https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod/query';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    console.log('📚 Querying Manuals Agent via Lambda:', message);

    // Llamar a la Lambda via API Gateway
    const response = await fetch(LAMBDA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        agentType: 'manuals', // o 'data' para el otro agente
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Lambda Error:', errorData);
      return NextResponse.json(
        {
          error: 'Failed to query manuals agent',
          details: errorData.error || response.statusText
        },
        { status: response.status }
      );
    }

    const result = await response.json();

    console.log('✅ Query completed successfully');

    // Return in expected format
    return NextResponse.json({
      answer: result.answer,
      agentType: result.agentType,
      sources: result.sources || [],
    });

  } catch (error: any) {
    console.error('❌ Manuals Agent Error:', error);
    return NextResponse.json(
      { error: 'Failed to query manuals agent', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Health check simple
    return NextResponse.json({
      status: 'ok',
      message: 'AI Chat API is ready',
      endpoint: LAMBDA_ENDPOINT !== 'https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod/query'
        ? 'configured'
        : 'pending configuration'
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}
