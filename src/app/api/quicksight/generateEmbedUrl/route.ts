import { NextRequest, NextResponse } from 'next/server';
import AWS from 'aws-sdk';

export async function GET(req: NextRequest) {
    // Configure AWS SDK with your credentials and region
    AWS.config.update({
        accessKeyId: 'AKIATP6YY7AVDOG67INN'       ,
        secretAccessKey: 'MM/ILohuMlRfWOaQiCcSz0SJv11AXar1V1y82nGg+K3q6ulG0X4cwSfGg8f7E4fCft',
        region: 'us-east-1',
    });

    const quicksight = new AWS.QuickSight();
    
    const params = {
        AwsAccountId: process.env.AWS_ACCOUNT_ID || '',
        UserArn:'arn:aws:quicksight:us-east-1:240435918890:user/default/fernando-dev',
        SessionLifetimeInMinutes: 600,
        ExperienceConfiguration: {
            Dashboard: {
                InitialDashboardId: '57aab648-7a18-4f91-9c8a-0d89ffb98823',
            },
        },
        /// Add allowed domains
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
