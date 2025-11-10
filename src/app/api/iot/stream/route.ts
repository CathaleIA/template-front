// src/app/api/iot/stream/route.ts
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { mqtt, io, iot, auth } from 'aws-iot-device-sdk-v2';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';
import { IoTClient, AttachPolicyCommand } from '@aws-sdk/client-iot';

const AWS_CONFIG = {
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID || 'us-east-1_hWdkRwqlP',
  identityPoolId: process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID || 'us-east-1:f991098b-1a9a-4271-bfe9-af85c2571fd5',
  iotEndpoint: process.env.NEXT_PUBLIC_IOT_ENDPOINT || 'a2k7890trgtkfx-ats.iot.us-east-1.amazonaws.com',
  topic: process.env.NEXT_PUBLIC_IOT_TOPIC || 'industrial/plc/data',
  iotPolicyName: 'industrial-iot-lab-dashboard-policy',
};

let mqttConnection: mqtt.MqttClientConnection | null = null;
let isConnecting = false;

async function attachIoTPolicyIfNeeded(identityId: string, credentials: any) {
  try {
    console.log('[IoT Policy] 🔄 Intentando adjuntar política a:', identityId);
    
    const iotClient = new IoTClient({
      region: AWS_CONFIG.region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
      },
    });

    await iotClient.send(
      new AttachPolicyCommand({
        policyName: AWS_CONFIG.iotPolicyName,
        target: identityId,
      })
    );
    
    console.log('[IoT Policy] ✅ Política adjunta exitosamente a:', identityId);
  } catch (error: any) {
    if (error.name === 'ResourceAlreadyExistsException') {
      console.log('[IoT Policy] ℹ️ Política ya estaba adjunta a:', identityId);
    } else {
      console.error('[IoT Policy] ⚠️ Error adjuntando política:', error);
      console.error('[IoT Policy] ⚠️ Error name:', error.name);
      console.error('[IoT Policy] ⚠️ Error message:', error.message);
    }
  }
}

async function getIoTConnection(idToken: string) {
  if (mqttConnection) {
    console.log('[MQTT] ♻️ Reutilizando conexión existente');
    return mqttConnection;
  }
  
  if (isConnecting) {
    console.log('[MQTT] ⏳ Esperando conexión en curso...');
    await new Promise(r => setTimeout(r, 1000));
    return getIoTConnection(idToken);
  }

  isConnecting = true;
  
  try {
    console.log('═══════════════════════════════════════');
    console.log('[Cognito] 🔄 Iniciando obtención de credenciales');
    console.log('[Config] 📍 Region:', AWS_CONFIG.region);
    console.log('[Config] 🏷️ User Pool ID:', AWS_CONFIG.userPoolId);
    console.log('[Config] 🆔 Identity Pool ID:', AWS_CONFIG.identityPoolId);
    console.log('[Config] 🔗 IoT Endpoint:', AWS_CONFIG.iotEndpoint);
    console.log('[Config] 📡 Topic:', AWS_CONFIG.topic);
    console.log('[Config] 🌍 NODE_ENV:', process.env.NODE_ENV);
    console.log('[Token] 🎫 ID Token length:', idToken?.length || 0);
    console.log('[Token] 🎫 ID Token preview:', idToken?.substring(0, 50) + '...');

    const providerName = `cognito-idp.${AWS_CONFIG.region}.amazonaws.com/${AWS_CONFIG.userPoolId}`;
    console.log('[Cognito] 🔐 Provider name:', providerName);
    
    const credentialsProvider = fromCognitoIdentityPool({
      identityPoolId: AWS_CONFIG.identityPoolId,
      clientConfig: { region: AWS_CONFIG.region },
      logins: { [providerName]: idToken },
    });

    console.log('[Cognito] ⏳ Solicitando credenciales temporales...');
    const creds = await credentialsProvider();
    
    console.log('[Cognito] ✅ Credenciales AWS obtenidas exitosamente');
    console.log('[Cognito] 🆔 Identity ID:', creds.identityId);
    console.log('[Cognito] 🔑 Access Key ID:', creds.accessKeyId?.substring(0, 15) + '...');
    console.log('[Cognito] 🔐 Session Token length:', creds.sessionToken?.length || 0);

    // Adjuntar IoT Policy
    if (creds.identityId) {
      await attachIoTPolicyIfNeeded(creds.identityId, creds);
    } else {
      console.error('[Cognito] ❌ No se obtuvo Identity ID');
      throw new Error('No Identity ID returned from Cognito');
    }

    console.log('[MQTT] 🔌 Configurando conexión MQTT...');
    const clientBootstrap = new io.ClientBootstrap();
    console.log('[MQTT] ✅ ClientBootstrap creado');
    
    const credProvider = auth.AwsCredentialsProvider.newStatic(
      creds.accessKeyId,
      creds.secretAccessKey,
      creds.sessionToken
    );
    console.log('[MQTT] ✅ CredentialsProvider creado');

    const configBuilder = iot.AwsIotMqttConnectionConfigBuilder.new_with_websockets({
      region: AWS_CONFIG.region,
      credentials_provider: credProvider,
    });
    console.log('[MQTT] ✅ ConfigBuilder creado con WebSockets');

    const clientId = `dashboard-${Date.now()}`;
    console.log('[MQTT] 🏷️ Client ID:', clientId);

    const config = configBuilder
      .with_clean_session(true)
      .with_client_id(clientId)
      .with_endpoint(AWS_CONFIG.iotEndpoint)
      .with_keep_alive_seconds(60)
      .build();
    console.log('[MQTT] ✅ Configuración MQTT construida');

    const client = new mqtt.MqttClient(clientBootstrap);
    mqttConnection = client.new_connection(config);
    console.log('[MQTT] ✅ Cliente MQTT creado');

    mqttConnection.on('error', (error) => {
      console.error('[MQTT] ❌ Error en conexión MQTT:', error);
      console.error('[MQTT] ❌ Error type:', typeof error);
      console.error('[MQTT] ❌ Error details:', JSON.stringify(error, null, 2));
      mqttConnection = null;
    });

    mqttConnection.on('disconnect', () => {
      console.warn('[MQTT] ⚠️ Desconectado de IoT Core');
      mqttConnection = null;
    });

    mqttConnection.on('connect', () => {
      console.log('[MQTT] 🎉 Evento "connect" recibido');
    });

    console.log('[MQTT] ⏳ Intentando conectar a IoT Core...');
    await mqttConnection.connect();
    console.log('[MQTT] ✅ ¡CONECTADO EXITOSAMENTE A IOT CORE!');
    console.log('═══════════════════════════════════════');
    
    isConnecting = false;
    return mqttConnection;

  } catch (error) {
    console.error('═══════════════════════════════════════');
    console.error('[ERROR] ❌ Error crítico en getIoTConnection');
    console.error('[ERROR] ❌ Error:', error);
    console.error('[ERROR] ❌ Error type:', typeof error);
    console.error('[ERROR] ❌ Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('[ERROR] ❌ Error message:', error instanceof Error ? error.message : String(error));
    console.error('[ERROR] ❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('═══════════════════════════════════════');
    
    isConnecting = false;
    mqttConnection = null;
    throw error;
  }
}

export async function GET(request: NextRequest) {
  console.log('\n\n');
  console.log('🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟');
  console.log('[SSE] 📡 Nueva petición SSE recibida');
  console.log('[SSE] 🌐 Request URL:', request.url);
  console.log('[SSE] 🌍 Environment:', process.env.NODE_ENV);
  console.log('[SSE] 📅 Timestamp:', new Date().toISOString());

  const encoder = new TextEncoder();
  const cookieStore = await cookies();
  
  console.log('[Cookies] 🍪 Buscando cognito_id_token...');
  const idToken = cookieStore.get('cognito_id_token')?.value;

  console.log('[Cookies] 🍪 Token encontrado:', !!idToken);
  console.log('[Cookies] 🍪 Token length:', idToken?.length || 0);

  if (!idToken) {
    console.error('[Auth] ❌ No se encontró ID token en cookies');
    console.log('[Cookies] 🍪 Cookies disponibles:', cookieStore.getAll().map(c => c.name));
    console.log('🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟\n\n');
    return new Response('No autenticado', { status: 401 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        console.log('[SSE Stream] 🔄 Iniciando stream...');
        
        const connection = await getIoTConnection(idToken);
        console.log('[SSE Stream] ✅ Conexión IoT obtenida');

        console.log('[MQTT Subscribe] 📡 Suscribiendo a topic:', AWS_CONFIG.topic);
        await connection.subscribe(
          AWS_CONFIG.topic,
          mqtt.QoS.AtMostOnce,
          (topic: string, payload: ArrayBuffer) => {
            try {
              const messageStr = new TextDecoder('utf-8').decode(payload);
              console.log('[MQTT Message] 📨 Mensaje recibido de topic:', topic);
              console.log('[MQTT Message] 📦 Payload size:', messageStr.length, 'bytes');
              console.log('[MQTT Message] 📦 Payload preview:', messageStr.substring(0, 100) + '...');
              
              controller.enqueue(encoder.encode(`data: ${messageStr}\n\n`));
              console.log('[SSE Stream] ✅ Mensaje enviado al cliente via SSE');
            } catch (error) {
              console.error('[MQTT Message] ❌ Error procesando mensaje:', error);
            }
          }
        );

        console.log('[MQTT Subscribe] ✅ Suscripción exitosa a topic:', AWS_CONFIG.topic);

        // Enviar mensaje de conexión exitosa
        const connectedMsg = JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() });
        controller.enqueue(encoder.encode(`data: ${connectedMsg}\n\n`));
        console.log('[SSE Stream] ✅ Mensaje "connected" enviado al cliente');

        // Heartbeat
        const heartbeat = setInterval(() => {
          try {
            const heartbeatMsg = JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() });
            controller.enqueue(encoder.encode(`data: ${heartbeatMsg}\n\n`));
            console.log('[Heartbeat] 💓 Enviado');
          } catch (error) {
            console.error('[Heartbeat] ❌ Error:', error);
            clearInterval(heartbeat);
          }
        }, 30000);

        request.signal.addEventListener('abort', () => {
          console.log('[SSE Stream] 🔌 Cliente desconectado (abort signal)');
          clearInterval(heartbeat);
          controller.close();
        });

        console.log('[SSE Stream] ✅ Stream iniciado correctamente');
        console.log('🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟\n\n');

      } catch (error) {
        console.error('[SSE Stream] ❌ Error crítico en stream:', error);
        console.error('[SSE Stream] ❌ Error details:', JSON.stringify(error, null, 2));
        
        const errorMsg = JSON.stringify({ 
          type: 'error', 
          message: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        });
        controller.enqueue(encoder.encode(`data: ${errorMsg}\n\n`));
        controller.close();
        console.log('🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟\n\n');
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}