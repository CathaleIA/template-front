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
    
    console.log('✅ IoT Policy adjunta a:', identityId);
  } catch (error: any) {
    // Si el error es que ya está adjunta, no hay problema
    if (error.name === 'ResourceAlreadyExistsException') {
      console.log('ℹ️ IoT Policy ya estaba adjunta');
    } else {
      console.error('⚠️ Error adjuntando política IoT:', error);
    }
  }
}

async function getIoTConnection(idToken: string) {
  if (mqttConnection) return mqttConnection;
  if (isConnecting) {
    await new Promise(r => setTimeout(r, 1000));
    return getIoTConnection(idToken);
  }

  isConnecting = true;
  try {
    console.log('🔄 Obteniendo credenciales AWS con token de usuario...');

    const providerName = `cognito-idp.${AWS_CONFIG.region}.amazonaws.com/${AWS_CONFIG.userPoolId}`;
    const credentialsProvider = fromCognitoIdentityPool({
      identityPoolId: AWS_CONFIG.identityPoolId,
      clientConfig: { region: AWS_CONFIG.region },
      logins: { [providerName]: idToken },
    });

    const creds = await credentialsProvider();
    console.log('✅ Credenciales AWS obtenidas');
    console.log('🆔 Identity ID:', creds.identityId);

    // Adjuntar IoT Policy automáticamente a la identidad
    if (creds.identityId) {
      await attachIoTPolicyIfNeeded(creds.identityId, creds);
    }

    const clientBootstrap = new io.ClientBootstrap();
    const credProvider = auth.AwsCredentialsProvider.newStatic(
      creds.accessKeyId,
      creds.secretAccessKey,
      creds.sessionToken
    );

    const configBuilder = iot.AwsIotMqttConnectionConfigBuilder.new_with_websockets({
      region: AWS_CONFIG.region,
      credentials_provider: credProvider,
    });

    const config = configBuilder
      .with_clean_session(true)
      .with_client_id(`dashboard-${Date.now()}`)
      .with_endpoint(AWS_CONFIG.iotEndpoint)
      .with_keep_alive_seconds(60)
      .build();

    const client = new mqtt.MqttClient(clientBootstrap);
    mqttConnection = client.new_connection(config);

    mqttConnection.on('error', (error) => {
      console.error('❌ Error MQTT:', error);
      mqttConnection = null;
    });

    mqttConnection.on('disconnect', () => {
      console.warn('⚠️ Desconectado de IoT');
      mqttConnection = null;
    });

    await mqttConnection.connect();
    console.log('✅ Conectado a IoT Core');
    isConnecting = false;

    return mqttConnection;
  } catch (error) {
    console.error('❌ Error conectando a IoT:', error);
    isConnecting = false;
    mqttConnection = null;
    throw error;
  }
}

export async function GET(request: NextRequest) {
  console.log('📡 Nueva conexión SSE');

  const encoder = new TextEncoder();
  const cookieStore = await cookies();
  const idToken = cookieStore.get('cognito_id_token')?.value;

  if (!idToken) {
    return new Response('No autenticado', { status: 401 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const connection = await getIoTConnection(idToken);

        await connection.subscribe(
          AWS_CONFIG.topic,
          mqtt.QoS.AtMostOnce,
          (topic: string, payload: ArrayBuffer) => {
            try {
              const messageStr = new TextDecoder('utf-8').decode(payload);
              controller.enqueue(encoder.encode(`data: ${messageStr}\n\n`));
            } catch (error) {
              console.error('❌ Error procesando mensaje:', error);
            }
          }
        );

        console.log('✅ Suscrito a topic:', AWS_CONFIG.topic);

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`)
        );

        const heartbeat = setInterval(() => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date() })}\n\n`)
          );
        }, 30000);

        request.signal.addEventListener('abort', () => {
          clearInterval(heartbeat);
          controller.close();
        });
      } catch (error) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'error', message: String(error) })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}