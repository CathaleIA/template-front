import type React from "react"
import { NotificationSystem } from "@/hooks/notification-system"
import { Card } from "@/components/ui/card"

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <Card className="card-generic p-5 w-[100%]">
      <div className="grid grid-cols-[1fr_auto] gap-4">
        <div className="flex flex-col justify-end">
          <h1 className="font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Columna derecha: botón (actions) */}
        {actions && (
          <div className="flex justify-end items-end h-full">
            <div className="flex items-center space-x-2">{actions}</div>
          </div>
        )}
      </div>

      <div className="px-6 pt-2">
        <NotificationSystem />
      </div>
    </Card>
  )
}
