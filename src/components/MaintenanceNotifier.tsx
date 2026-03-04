"use client"

import { useEffect, useRef } from "react"
import { useNotifications } from "@/context/notification-context"

const DISMISSED_KEY = 'maintenance_dismissed_ids';

function getDismissedIds(): Set<string> {
    try {
        const stored = localStorage.getItem(DISMISSED_KEY);
        return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
        return new Set();
    }
}

function saveDismissedIds(ids: Set<string>) {
    try {
        localStorage.setItem(DISMISSED_KEY, JSON.stringify([...ids]));
    } catch {
        // localStorage no disponible
    }
}

export function MaintenanceNotifier() {
    const { addNotification } = useNotifications()
    const fetchedRef = useRef(false)

    useEffect(() => {
        if (fetchedRef.current) return
        fetchedRef.current = true

        const checkNotifications = async () => {
            try {
                const response = await fetch('/api/maintenance/notifications');
                const data = await response.json();

                if (data.success && data.alerts && data.alerts.length > 0) {
                    const dismissed = getDismissedIds();
                    const allIds: string[] = [];
                    let shown = 0;

                    data.alerts.forEach((alert: any) => {
                        const alertId = alert.id || 'unknown';

                        // Saltar si ya fue descartada localmente
                        if (dismissed.has(alertId)) return;

                        const isOverdue = alert.daysRemaining < 0;
                        let type: "error" | "success" | "info" = isOverdue ? "error" : "success";
                        let title = isOverdue ? `Mantenimiento Vencido: ${alert.machineName}` : `Mantenimiento Próximo: ${alert.machineName}`;
                        let message = isOverdue
                            ? `El mantenimiento venció hace ${Math.abs(alert.daysRemaining)} días (${alert.nextDate}).`
                            : `Faltan ${alert.daysRemaining} días para el mantenimiento programado (${alert.nextDate}).`;

                        if (alert.isScheduled) {
                            type = "info";
                            title = `🔔 Recordatorio: ${alert.machineName}`;
                            message = alert.message || `Recordatorio programado para hoy (${alert.nextDate})`;
                        }

                        addNotification({ type, title, message, duration: 10000 });
                        allIds.push(alertId);
                        shown++;
                    });

                    // Guardar en localStorage inmediatamente (protección anti-duplicado)
                    if (allIds.length > 0) {
                        allIds.forEach(id => dismissed.add(id));
                        saveDismissedIds(dismissed);

                        // También marcar en DynamoDB (para persistencia cross-device)
                        try {
                            await fetch('/api/maintenance/notifications', {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ notificationIds: allIds })
                            });
                            console.log(`✅ ${shown} notificación(es) marcada(s) como leída(s)`);
                        } catch (err) {
                            console.error('Error marking notifications as read:', err);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching maintenance notifications:', error);
            }
        };

        checkNotifications();
    }, [addNotification]);

    return null;
}
