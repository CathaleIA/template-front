import { NextRequest, NextResponse } from 'next/server';
import AWS from 'aws-sdk';

export async function GET(req: NextRequest) {
    // Configure AWS SDK with your credentials and region
    AWS.config.update({
        accessKeyId: process.env.ACCESS_KEY_ID || '',  // Reemplaza con el nombre de tu variable de entorno
        secretAccessKey: process.env.SECRET_ACCESS_KEY || '',  // Reemplaza con el nombre de tu variable de entorno
        region: process.env.REGION || 'us-east-1',  // Si no tienes variable de entorno, usa el valor por defecto
    });
    const quicksight = new AWS.QuickSight();
    
const params = {
    AwsAccountId: process.env.AWS_ACCOUNT_ID || '',  // Tu variable de entorno
    UserArn: process.env.AWS_QUICKSIGHT_USER_ARN || '',  // Tu variable de entorno
    SessionLifetimeInMinutes: 600,
    ExperienceConfiguration: {
        Dashboard: {
            InitialDashboardId: '57aab648-7a18-4f91-9c8a-0d89ffb98823',
        },
    },
    // Agregar dominios permitidos
    AllowedDomains: [process.env.AMPLIFY_APP_ORIGIN || 'http://localhost:3000'],  // Tu variable de entorno
};

    try {
        const response = await quicksight.generateEmbedUrlForRegisteredUser(params).promise();
        
        return NextResponse.json({ 
            embedUrl: response.EmbedUrl,
            status: 200 
        });
    } catch (error) {
        console.error('Error generating embed URL:', error);
        return NextResponse.json({ 
            error: 'Failed to generate embed URL', 
            details: error,
            status: 500 
        }, { status: 500 });
    }
}
