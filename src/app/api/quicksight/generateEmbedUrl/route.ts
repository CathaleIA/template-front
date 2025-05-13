import { NextRequest, NextResponse } from 'next/server';
import AWS from 'aws-sdk';

export async function GET(req: NextRequest) {
    // Configure AWS SDK with your credentials and region
    AWS.config.update({
        accessKeyId: 'AKIATP6YY7AVNZSNDN42'       ,
        secretAccessKey: '67faEdDHPEKGBP+K3q6ulG0X4cwSfGg8f7E4fCft',
        region: 'us-east-1',
    });

    const quicksight = new AWS.QuickSight();
    
    const params = {
        AwsAccountId: process.env.AWS_ACCOUNT_ID || '',
        UserArn: process.env.AWS_QUICKSIGHT_USER_ARN || '',
        SessionLifetimeInMinutes: 600,
        ExperienceConfiguration: {
            Dashboard: {
                InitialDashboardId: '34c6f29e-da26-4c46-93e9-afe512a5af78',
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
