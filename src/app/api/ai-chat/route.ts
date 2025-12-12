import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/snowflake';
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Call the dedicated Manuals Agent function
    const query = `SELECT ASK_MANUALS(?) as RESULT`;
    const binds = [message];

    console.log('📚 Querying Manuals Agent:', message);
    const results = await executeQuery(query, binds);
    
    // Parse the result if it's a string JSON
    let parsedResult = results[0]?.RESULT;
    if (typeof parsedResult === 'string') {
        try {
            parsedResult = JSON.parse(parsedResult);
        } catch (e) {
            // Keep as string if parse fails
        }
    }

    // Return in expected format
    return NextResponse.json({ 
      answer: parsedResult,
      sources: [] // Could be enhanced later with actual source tracking
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
    await executeQuery('SELECT 1');
    return NextResponse.json({ status: 'ok', message: 'Snowflake connection healthy' });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}
