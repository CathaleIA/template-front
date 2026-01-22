import WebSocket from 'ws';

// Cache global para almacenar los últimos mensajes del generador y motor
let latestGeneratorMessage: any = null;
let latestMotorMessage: any = null;
let wsConnection: WebSocket | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL ||
    'wss://657pcrk382.execute-api.us-east-1.amazonaws.com/production/';

/**
 * Conecta al WebSocket y mantiene los últimos mensajes en caché
 */
function connectToWebSocket() {
    if (wsConnection?.readyState === WebSocket.OPEN) {
        return; // Ya está conectado
    }

    console.log('🔌 Connecting to WebSocket for real-time data cache...');
    wsConnection = new WebSocket(WEBSOCKET_URL);

    wsConnection.on('open', () => {
        console.log('✅ WebSocket connected for Bedrock real-time queries');
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
    });

    wsConnection.on('message', (data: WebSocket.Data) => {
        try {
            const message = JSON.parse(data.toString());

            // Ignorar mensajes de control
            if (message.type) return;

            // Detectar si es generador o motor basándose en la estructura de datos
            const isGenerator = message.data && 'generator' in message.data;
            const isMotor = message.data && 'cylinders' in message.data;

            if (isGenerator) {
                latestGeneratorMessage = message;
                console.log('📥 Generator data cached for Bedrock');
            } else if (isMotor) {
                latestMotorMessage = message;
                console.log('📥 Motor data cached for Bedrock');
            }
        } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
        }
    });

    wsConnection.on('close', () => {
        console.log('🔌 WebSocket disconnected. Reconnecting in 5s...');
        wsConnection = null;

        // Reconectar después de 5 segundos
        if (!reconnectTimer) {
            reconnectTimer = setTimeout(connectToWebSocket, 5000);
        }
    });

    wsConnection.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
    });
}

/**
 * Obtiene el último estado reportado por el WebSocket
 */
export async function getLatestRealtimeData(question?: string): Promise<any> {
    // Asegurar que la conexión esté activa
    if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
        connectToWebSocket();
    }

    // Detectar qué tipo de datos necesita basándose en la pregunta
    const needsGenerator = question && (
        question.toLowerCase().includes('voltaje') ||
        question.toLowerCase().includes('corriente') ||
        question.toLowerCase().includes('potencia') ||
        question.toLowerCase().includes('frecuencia') ||
        question.toLowerCase().includes('breaker') ||
        question.toLowerCase().includes('generador')
    );

    const needsMotor = question && (
        question.toLowerCase().includes('temperatura') ||
        question.toLowerCase().includes('cilindro') ||
        question.toLowerCase().includes('aceite') ||
        question.toLowerCase().includes('refrigerante') ||
        question.toLowerCase().includes('enfriamiento') ||
        question.toLowerCase().includes('motor')
    );

    // Si no hay datos, esperar hasta 5 segundos a que lleguen
    const maxWaitTime = 5000; // 5 segundos
    const checkInterval = 500; // Revisar cada 500ms
    let waited = 0;

    while (waited < maxWaitTime) {
        // Si necesita datos específicos, esperar solo por esos
        if (needsGenerator && !needsMotor) {
            if (latestGeneratorMessage) break;
        } else if (needsMotor && !needsGenerator) {
            if (latestMotorMessage) break;
        } else {
            // Si no especifica o necesita ambos, esperar a tener al menos uno
            if (latestGeneratorMessage || latestMotorMessage) break;
        }

        await new Promise(resolve => setTimeout(resolve, checkInterval));
        waited += checkInterval;
    }

    // Validar que tengamos los datos necesarios
    if (needsGenerator && !latestGeneratorMessage) {
        throw new Error('No hay datos del generador disponibles. Por favor, espera unos segundos y vuelve a intentar.');
    }

    if (needsMotor && !latestMotorMessage) {
        throw new Error('No hay datos del motor disponibles. Por favor, espera unos segundos y vuelve a intentar.');
    }

    if (!latestGeneratorMessage && !latestMotorMessage) {
        throw new Error('No real-time data available after waiting. The IoT device may not be sending data.');
    }

    // Retornar un objeto combinado con ambos tipos de datos
    return {
        generator: latestGeneratorMessage,
        motor: latestMotorMessage,
        timestamp: new Date().toISOString()
    };
}

// Iniciar la conexión al cargar el módulo (solo en servidor)
if (typeof window === 'undefined') {
    connectToWebSocket();
}
