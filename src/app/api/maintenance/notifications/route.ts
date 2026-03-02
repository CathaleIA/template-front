import { NextResponse, NextRequest } from 'next/server';
import { DynamoDBClient, ScanCommand, QueryCommand, UpdateItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';

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

        // 0. Obtener IDs de notificaciones ya leídas/descartadas
        const dismissedResult = await client.send(new ScanCommand({
            TableName: SCHEDULED_NOTIFICATIONS_TABLE,
            FilterExpression: 'attribute_exists(readAt)',
            ProjectionExpression: 'notificationId',
            ConsistentRead: true
        }));
        const dismissedIds = new Set(
            (dismissedResult.Items || []).map(item => item.notificationId?.S).filter(Boolean)
        );

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

            const logResult = await client.send(new QueryCommand({
                TableName: MAINTENANCE_LOG_TABLE,
                KeyConditionExpression: 'machineId = :mid',
                ExpressionAttributeValues: { ':mid': { S: machineId } },
                ScanIndexForward: false,
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

                if (daysRemaining <= 7) {
                    const alertId = `schedule-${machineId}-${next.toISOString().split('T')[0]}`;

                    // Saltar si ya fue descartada
                    if (dismissedIds.has(alertId)) continue;

                    alerts.push({
                        id: alertId,
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

        // 3. Obtener notificaciones programadas no leídas
        const nowStr = new Date().toISOString().split('T')[0];
        const scheduledResult = await client.send(new ScanCommand({
            TableName: SCHEDULED_NOTIFICATIONS_TABLE,
            FilterExpression: 'scheduledDate <= :today AND attribute_not_exists(readAt)',
            ExpressionAttributeValues: { ':today': { S: nowStr } }
        }));

        const scheduledNotifs = scheduledResult.Items || [];
        for (const notif of scheduledNotifs) {
            alerts.push({
                id: notif.notificationId?.S || 'unknown',
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

// PATCH: Marcar notificaciones como leídas
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { notificationIds } = body;

        if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
            return NextResponse.json({ success: false, error: 'notificationIds requerido (array)' }, { status: 400 });
        }

        const readAt = new Date().toISOString();
        let marked = 0;

        for (const id of notificationIds) {
            try {
                if (id.startsWith('schedule-')) {
                    // Alertas calculadas de mantenimiento: crear registro sintético para recordar que fue descartada
                    await client.send(new PutItemCommand({
                        TableName: SCHEDULED_NOTIFICATIONS_TABLE,
                        Item: {
                            notificationId: { S: id },
                            scheduledDate: { S: new Date().toISOString().split('T')[0] },
                            type: { S: 'dismissed-schedule-alert' },
                            readAt: { S: readAt }
                        }
                    }));
                    marked++;
                } else {
                    // Notificaciones programadas por el bot: actualizar registro existente
                    const scanResult = await client.send(new ScanCommand({
                        TableName: SCHEDULED_NOTIFICATIONS_TABLE,
                        FilterExpression: 'notificationId = :nid',
                        ExpressionAttributeValues: { ':nid': { S: id } },
                        Limit: 1
                    }));

                    const item = scanResult.Items?.[0];
                    if (item) {
                        await client.send(new UpdateItemCommand({
                            TableName: SCHEDULED_NOTIFICATIONS_TABLE,
                            Key: {
                                notificationId: { S: id },
                                scheduledDate: item.scheduledDate!
                            },
                            UpdateExpression: 'SET readAt = :readAt',
                            ExpressionAttributeValues: { ':readAt': { S: readAt } }
                        }));
                        marked++;
                    }
                }
            } catch (err) {
                console.error(`Error marking notification ${id} as read:`, err);
            }
        }

        return NextResponse.json({
            success: true,
            marked,
            readAt
        });

    } catch (error: any) {
        console.error('❌ Error marking notifications as read:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
