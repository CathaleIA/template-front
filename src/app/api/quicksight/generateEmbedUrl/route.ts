import { NextRequest, NextResponse } from 'next/server';
import AWS from 'aws-sdk';

export async function GET(req: NextRequest) {
    // Verificación de variables de entorno
    console.log("🧪 Verificando variables de entorno:");
    console.log("ACCESS_KEY_ID:", process.env.ACCESS_KEY_ID ? "✅ Recibida" : "❌ NO recibida");
    console.log("SECRET_ACCESS_KEY:", process.env.SECRET_ACCESS_KEY ? "✅ Recibida" : "❌ NO recibida");
    console.log("AWS_ACCOUNT_ID:", process.env.AWS_ACCOUNT_ID ? "✅ Recibida" : "❌ NO recibida");
    console.log("AWS_QUICKSIGHT_USER_ARN:", process.env.AWS_QUICKSIGHT_USER_ARN ? "✅ Recibida" : "❌ NO recibida");
    console.log("AMPLIFY_APP_ORIGIN:", process.env.AMPLIFY_APP_ORIGIN ? "✅ Recibida" : "❌ NO recibida");

    // Configurar manualmente las credenciales
    AWS.config.credentials = new AWS.Credentials({
        accessKeyId: process.env.ACCESS_KEY_ID!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
    });

    AWS.config.update({
        region: 'us-east-1',
    });

    const quicksight = new AWS.QuickSight();

    const params = {
        AwsAccountId: process.env.AWS_ACCOUNT_ID || '',
        UserArn: process.env.AWS_QUICKSIGHT_USER_ARN || '',
        SessionLifetimeInMinutes: 600,
        ExperienceConfiguration: {
            Dashboard: {
                InitialDashboardId: '57aab648-7a18-4f91-9c8a-0d89ffb98823',
            },
        },
        AllowedDomains: [process.env.AMPLIFY_APP_ORIGIN || 'http://localhost:3000'],
    };

    try {
        const response = await quicksight.generateEmbedUrlForRegisteredUser(params).promise();

        return NextResponse.json({
            embedUrl: response.EmbedUrl,
            status: 200,
        });
    } catch (error) {
        console.error('❌ Error generating embed URL:', error);
        return NextResponse.json({
            error: 'Failed to generate embed URL',
            details: error,
            status: 500,
        }, { status: 500 });
    }
}
