"use client"

import { useEffect, useRef } from "react"
import { useNotifications } from "@/context/notification-context"

export function MaintenanceNotifier() {
    const { addNotification } = useNotifications()
    const fetchedRef = useRef(false)

    useEffect(() => {
        // Solo fetching una vez por montaje de componente (o sesión)
        if (fetchedRef.current) return
        fetchedRef.current = true

        const checkNotifications = async () => {
            try {
                const response = await fetch('/api/maintenance/notifications');
                const data = await response.json();

                if (data.success && data.alerts && data.alerts.length > 0) {
                    data.alerts.forEach((alert: any) => {
                        const isOverdue = alert.daysRemaining < 0;

                        let type: "error" | "success" | "info" = isOverdue ? "error" : "success";
                        let title = isOverdue ? `Mantenimiento Vencido: ${alert.machineName}` : `Mantenimiento Próximo: ${alert.machineName}`;
                        let message = isOverdue
                            ? `El mantenimiento venció hace ${Math.abs(alert.daysRemaining)} días (${alert.nextDate}).`
                            : `Faltan ${alert.daysRemaining} días para el mantenimiento programado (${alert.nextDate}).`;

                        // Si es una notificación programada manualmente por el bot
                        if (alert.isScheduled) {
                            type = "info";
                            title = `🔔 Recordatorio: ${alert.machineName}`;
                            message = alert.message || `Recordatorio programado para hoy (${alert.nextDate})`;
                        }

                        addNotification({
                            type,
                            title,
                            message,
                            duration: 10000 // 10 segundos para que el usuario lo vea bien
                        });
                    });
                }
            } catch (error) {
                console.error('Error fetching maintenance notifications:', error);
            }
        };

        checkNotifications();
    }, [addNotification]);

    return null; // Este componente no renderiza nada visualmente, solo dispara las notificaciones
}
