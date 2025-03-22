import { NextRequest, NextResponse } from 'next/server';
import AWS from 'aws-sdk';

export async function GET(req: NextRequest) {
    // Configure AWS SDK with your credentials and region
    AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
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
        // Add allowed domains
        AllowedDomains: [process.env.AMPLIFY_APP_ORIGIN || 'http://localhost:3000'],
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
