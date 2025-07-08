import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { AlertLevel } from "./types";

interface AlertStatusProps<T extends string> {
  metrics: {
    name: string;
    value: number;
    metric: T;
  }[];
  getAlertLevel: (value: number, metric: T) => AlertLevel;
}

const getColorClass = (alertLevel: AlertLevel): string => {
  switch (alertLevel) {
    case "normal": return "bg-green-500";
    case "warning": return "bg-amber-500";
    case "danger": return "bg-red-500";
    default: return "bg-gray-500";
  }
};

export function AlertStatus<T extends string>({ metrics, getAlertLevel }: AlertStatusProps<T>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Estado de Alertas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {metrics.map(({ name, value, metric }) => {
            const alertLevel = getAlertLevel(value, metric);
            return (
              <div key={name} className="flex items-center justify-between p-2 rounded-lg border">
                <span className="font-medium">{name}</span>
                <div className="flex items-center">
                  <span className="font-bold mr-2">
                    {value}
                  </span>
                  <div className={`w-3 h-3 rounded-full ${getColorClass(alertLevel)}`}></div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}