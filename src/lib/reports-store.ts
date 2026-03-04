import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

const BUCKET_NAME = process.env.S3_IOT_BUCKET || process.env.AWS_S3_IOT_BUCKET || '';

/**
 * Guarda un objeto de reporte en S3 y devuelve su ID único
 */
export async function saveWebReport(reportData: any): Promise<string> {
    const reportId = uuidv4();
    const key = `web-reports/${reportId}.json`;

    try {
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: JSON.stringify({
                ...reportData,
                reportId,
                generatedAt: new Date().toISOString()
            }),
            ContentType: 'application/json',
        });

        await s3Client.send(command);
        console.log(`✅ Report saved to S3: ${key}`);
        return reportId;
    } catch (error) {
        console.error('❌ Error saving report to S3:', error);
        throw new Error('Failed to save report to S3');
    }
}

/**
 * Recupera un reporte de S3 por su ID
 */
export async function getWebReport(reportId: string): Promise<any> {
    const key = `web-reports/${reportId}.json`;

    try {
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });

        const response = await s3Client.send(command);
        const bodyContents = await response.Body?.transformToString();

        if (!bodyContents) {
            throw new Error('Report body is empty');
        }

        return JSON.parse(bodyContents);
    } catch (error) {
        console.error(`❌ Error retrieving report ${reportId} from S3:`, error);
        return null;
    }
}
