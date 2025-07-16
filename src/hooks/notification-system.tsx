"use client"

import { useNotifications } from "@/context/notification-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function NotificationSystem() {
  const { notifications, removeNotification } = useNotifications()

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="space-y-2 mb-6">
      {notifications.map((notification) => (
        <Alert
          key={notification.id}
          className={cn(
            "relative pr-12 animate-in slide-in-from-top-2 duration-300",
            notification.type === "success" &&
              "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200",
            notification.type === "error" &&
              "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200",
          )}
        >
          {notification.type === "success" ? (
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          )}

          <div className="flex-1">
            <AlertTitle className="text-sm font-medium">{notification.title}</AlertTitle>
            {notification.message && (
              <AlertDescription className="text-sm mt-1">{notification.message}</AlertDescription>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 h-6 w-6 p-0 hover:bg-transparent"
            onClick={() => removeNotification(notification.id)}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Cerrar notificación</span>
          </Button>
        </Alert>
      ))}
    </div>
  )
}
