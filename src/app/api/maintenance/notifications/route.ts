import { NextResponse } from 'next/server';
import { DynamoDBClient, ScanCommand, QueryCommand } from '@aws-sdk/client-dynamodb';

const REGION = process.env.REGION || 'us-east-1';

const client = new DynamoDBClient({
    region: REGION,
    ...(process.env.NEXT_AWS_ACCESS_KEY_ID && process.env.NEXT_AWS_ACCESS_KEY_ID.trim() !== '' &&
        process.env.NEXT_AWS_SECRET_ACCESS_KEY && process.env.NEXT_AWS_SECRET_ACCESS_KEY.trim() !== '' ? {
        credentials: {
            accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID.trim(),
            secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY.trim(),
        }
    } : {}),
});

const MAINTENANCE_SCHEDULES_TABLE = process.env.MAINTENANCE_SCHEDULES_TABLE || 'MaintenanceSchedules';
const MAINTENANCE_LOG_TABLE = process.env.MAINTENANCE_LOG_TABLE || 'MaintenanceLog';
const SCHEDULED_NOTIFICATIONS_TABLE = process.env.SCHEDULED_NOTIFICATIONS_TABLE || 'ScheduledNotifications';

export async function GET() {
    try {
        console.log('🔔 Fetching maintenance notifications...');

        // 1. Obtener todos los planes de mantenimiento
        const schedulesResult = await client.send(new ScanCommand({
            TableName: MAINTENANCE_SCHEDULES_TABLE
        }));

        const schedules = schedulesResult.Items || [];
        const alerts = [];

        // 2. Para cada máquina, verificar el último mantenimiento
        for (const schedule of schedules) {
            const machineId = schedule.machineId?.S || '';
            const machineName = schedule.machineName?.S || machineId;
            const intervalDays = parseInt(schedule.intervalDays?.N || '90', 10);

            // Obtener el último mantenimiento del log
            const logResult = await client.send(new QueryCommand({
                TableName: MAINTENANCE_LOG_TABLE,
                KeyConditionExpression: 'machineId = :mid',
                ExpressionAttributeValues: { ':mid': { S: machineId } },
                ScanIndexForward: false, // Descendente
                Limit: 1
            }));

            const lastLog = logResult.Items?.[0];
            const lastDate = lastLog?.maintenanceDate?.S;

            if (lastDate) {
                const last = new Date(lastDate);
                const next = new Date(last.getTime() + intervalDays * 24 * 60 * 60 * 1000);
                const now = new Date();

                const timeDiff = next.getTime() - now.getTime();
                const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

                // Si falta 7 días o menos, o ya venció
                if (daysRemaining <= 7) {
                    alerts.push({
                        machineId,
                        machineName,
                        daysRemaining,
                        nextDate: next.toISOString().split('T')[0],
                        isOverdue: daysRemaining < 0,
                        type: daysRemaining < 0 ? 'error' : 'warning'
                    });
                }
            }
        }

        // 3. Obtener notificaciones programadas (manuales del bot)
        // Buscamos las que ya llegaron a su fecha
        const nowStr = new Date().toISOString().split('T')[0];
        const scheduledResult = await client.send(new ScanCommand({
            TableName: SCHEDULED_NOTIFICATIONS_TABLE,
            FilterExpression: 'scheduledDate <= :today',
            ExpressionAttributeValues: { ':today': { S: nowStr } }
        }));

        const scheduledNotifs = scheduledResult.Items || [];
        for (const notif of scheduledNotifs) {
            alerts.push({
                machineId: notif.machineId?.S || 'system',
                machineName: notif.machineId?.S || 'Sistema',
                message: notif.message?.S,
                nextDate: notif.scheduledDate?.S,
                type: 'info',
                isScheduled: true
            });
        }

        return NextResponse.json({
            success: true,
            count: alerts.length,
            alerts
        });

    } catch (error: any) {
        console.error('❌ Error fetching maintenance notifications:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
